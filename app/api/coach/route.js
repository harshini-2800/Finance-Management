import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import Goal from "@/lib/models/Goal";
import ChatMessage from "@/lib/models/ChatMessage";
import { memoryStore, generateId } from "@/lib/memoryStore";
import { callGemini } from "@/lib/gemini";
import { computeFinancialHealth } from "@/lib/insightsEngine";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conn = await connectDB();
    let messages = [];

    if (conn) {
      messages = await ChatMessage.find({ userId: session.userId }).sort({ createdAt: 1 }).limit(50).lean();
    } else {
      messages = memoryStore.chatMessages
        .filter((m) => m.userId === session.userId.toString())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-50);
    }

    if (messages.length === 0) {
      // Return default welcome message
      messages = [
        {
          _id: "welcome_01",
          role: "assistant",
          content: "Greetings. I am your AURUM AI Wealth Copilot. I have analyzed your transactions, active vaults, and monthly burn rate. How may I assist in optimizing your capital today?",
          createdAt: new Date(),
        },
      ];
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Coach GET error:", err);
    return NextResponse.json({ error: "Failed to load chat history" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const conn = await connectDB();
    let transactions = [];
    let budgets = [];
    let goals = [];

    if (conn) {
      transactions = await Transaction.find({ userId: session.userId }).sort({ date: -1 }).limit(50).lean();
      budgets = await Budget.find({ userId: session.userId }).lean();
      goals = await Goal.find({ userId: session.userId }).lean();
    } else {
      transactions = memoryStore.transactions.filter((t) => t.userId === session.userId.toString());
      budgets = memoryStore.budgets.filter((b) => b.userId === session.userId.toString());
      goals = memoryStore.goals.filter((g) => g.userId === session.userId.toString());
    }

    const metrics = computeFinancialHealth({ transactions, budgets });

    // Store user message
    if (conn) {
      await ChatMessage.create({
        userId: session.userId,
        role: "user",
        content: message.trim(),
      });
    } else {
      memoryStore.chatMessages.push({
        _id: generateId(),
        userId: session.userId.toString(),
        role: "user",
        content: message.trim(),
        createdAt: new Date(),
      });
    }

    // Prepare context for Gemini AI
    const contextPrompt = `You are AURUM, a prestigious, highly intelligent private AI wealth and personal finance copilot.
User's Real Financial Overview:
- Monthly Income / Inflow: ₹${metrics.totalIncome.toLocaleString()}
- Total Spent This Month: ₹${metrics.totalExpense.toLocaleString()}
- Monthly Net Savings: ₹${metrics.netSavings.toLocaleString()} (${metrics.savingsRate}% savings rate)
- Daily Burn Rate: ₹${metrics.forecast.dailyBurnRate.toLocaleString()}/day
- Month-end Projected Surplus: ₹${metrics.forecast.projectedSurplus.toLocaleString()}
- Active Subscriptions: ${metrics.subscriptions.map((s) => `${s.title} (₹${s.amount})`).join(", ") || "None"}
- Financial Vault Goals: ${goals.map((g) => `${g.title} (₹${g.savedAmount}/₹${g.targetAmount})`).join(", ") || "None"}

User Question: "${message}"

Give a sharp, polished, encouraging, and financially rigorous response. Keep it concise (2-4 paragraphs max), formatting with neat bullet points when presenting numbers. Do not fabricate hallucinated facts beyond their real data.`;

    const aiRes = await callGemini({
      prompt: contextPrompt,
      systemInstruction: "You are AURUM, an elite personal finance copilot. Be sophisticated, analytical, and practical.",
    });

    let assistantReply = "";
    if (aiRes.success && aiRes.data) {
      assistantReply = aiRes.data;
    } else {
      // Deterministic intelligent fallback
      const q = message.toLowerCase();
      if (q.includes("breakdown") || q.includes("cashflow") || q.includes("overview")) {
        assistantReply = `Here is your current portfolio cash flow breakdown:\n\n- **Inflow**: ₹${metrics.totalIncome.toLocaleString()} / month\n- **Outflow**: ₹${metrics.totalExpense.toLocaleString()} / month\n- **Net Savings Velocity**: ₹${metrics.netSavings.toLocaleString()} (${metrics.savingsRate}% rate)\n- **Projected Month-End Reserve**: ₹${metrics.forecast.projectedSurplus.toLocaleString()}\n\nYour savings rate stands at **${metrics.savingsRate}%**, against a recommended target of 25%. Keep non-essential dining and shopping controlled to sustain this upward trajectory.`;
      } else if (q.includes("save") || q.includes("saving") || q.includes("cut")) {
        assistantReply = `Here are immediate actionable opportunities to amplify your capital accumulation:\n\n1. **Subscriptions**: You are currently paying **₹${metrics.monthlySubscriptionBurn.toLocaleString()}** monthly across recurring services. Auditing these can immediately yield over ₹1,000/mo.\n2. **Discretionary Spending**: Allocating 15% less to Dining and Shopping will compound into an additional **₹36,000+** over 12 months in an index fund.\n3. **Automate Transfers**: Direct your surplus into your active vault goals right when your salary arrives.`;
      } else if (q.includes("goal") || q.includes("vault")) {
        if (goals.length > 0) {
          assistantReply = `You have ${goals.length} active vault goals. Your top priority vault is **${goals[0].title}**, which is currently at **${Math.round((goals[0].savedAmount / goals[0].targetAmount) * 100)}%** completion (₹${goals[0].savedAmount.toLocaleString()} of ₹${goals[0].targetAmount.toLocaleString()}). To hit your deadline on schedule, allocate approximately **₹${Math.round((goals[0].targetAmount - goals[0].savedAmount) / 12).toLocaleString()}/week**.`;
        } else {
          assistantReply = `You currently have no active vault goals. Setting a specific financial target (such as an Emergency Reserve or Investment Milestone) boosts savings discipline by over 42%. Navigate to the **Vaults** tab to create one!`;
        }
      } else {
        assistantReply = `Analyzing your real portfolio cash flows:\n\n- **Inflow**: ₹${metrics.totalIncome.toLocaleString()} / month\n- **Outflow**: ₹${metrics.totalExpense.toLocaleString()} / month\n- **Net Savings Velocity**: ₹${metrics.netSavings.toLocaleString()} (${metrics.savingsRate}% rate)\n- **Projected Month-End Reserve**: ₹${metrics.forecast.projectedSurplus.toLocaleString()}\n\nHow else can I assist with your asset allocation, budgets, or retirement projections?`;
      }
    }

    // Save assistant message
    if (conn) {
      await ChatMessage.create({
        userId: session.userId,
        role: "assistant",
        content: assistantReply,
      });
    } else {
      memoryStore.chatMessages.push({
        _id: generateId(),
        userId: session.userId.toString(),
        role: "assistant",
        content: assistantReply,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      reply: assistantReply,
      aiPowered: aiRes.success,
    });
  } catch (err) {
    console.error("Coach POST error:", err);
    return NextResponse.json({ error: "Failed to generate copilot reply" }, { status: 500 });
  }
}

