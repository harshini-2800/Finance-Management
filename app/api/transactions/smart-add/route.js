import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { memoryStore, generateId } from "@/lib/memoryStore";
import { callGemini, ruleBasedTransactionParser } from "@/lib/gemini";

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { input } = await request.json();
    if (!input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ error: "Input prompt is required" }, { status: 400 });
    }

    let parsedResult = null;

    // Attempt Gemini 1.5 Flash parsing first
    const systemPrompt = `You are an expert financial assistant parser. Extract structured transaction data from natural language text.
Return ONLY valid JSON matching this schema:
{
  "type": "expense" | "income",
  "amount": number (positive),
  "category": "Dining" | "Groceries" | "Housing" | "Transport" | "Shopping" | "Subscriptions" | "Utilities" | "Salary" | "Investments" | "Freelance" | "Miscellaneous",
  "description": string (concise, cleaned description),
  "isRecurring": boolean
}`;

    const geminiRes = await callGemini({
      prompt: `Parse this natural transaction statement into JSON: "${input}"`,
      systemInstruction: systemPrompt,
      responseSchema: true,
    });

    if (geminiRes.success && geminiRes.data && geminiRes.data.amount) {
      parsedResult = {
        type: geminiRes.data.type || "expense",
        amount: Number(geminiRes.data.amount),
        category: geminiRes.data.category || "Miscellaneous",
        description: geminiRes.data.description || input.slice(0, 40),
        isRecurring: Boolean(geminiRes.data.isRecurring),
        source: "ai",
      };
    } else {
      // Deterministic rule-based fallback
      parsedResult = ruleBasedTransactionParser(input);
    }

    // Save transaction to DB or memory
    const conn = await connectDB();
    const payload = {
      userId: session.userId,
      type: parsedResult.type,
      amount: parsedResult.amount,
      category: parsedResult.category,
      description: parsedResult.description,
      date: new Date(),
      source: "ai",
      isRecurring: parsedResult.isRecurring,
    };

    let createdTx;
    if (conn) {
      createdTx = await Transaction.create(payload);
    } else {
      createdTx = {
        _id: generateId(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.transactions.unshift(createdTx);
    }

    return NextResponse.json({
      success: true,
      transaction: createdTx,
      parsed: parsedResult,
      aiPowered: geminiRes.success,
    });
  } catch (err) {
    console.error("Smart Add error:", err);
    return NextResponse.json({ error: "Failed to parse and save transaction" }, { status: 500 });
  }
}

