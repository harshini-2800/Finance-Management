import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import Goal from "@/lib/models/Goal";
import ChatMessage from "@/lib/models/ChatMessage";
import { memoryStore } from "@/lib/memoryStore";
import { seedDemoDataForUser } from "@/lib/seedData";

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await request.json(); // "clear" or "reseed"

    const conn = await connectDB();

    if (conn) {
      if (action === "clear") {
        await Transaction.deleteMany({ userId: session.userId });
        await Budget.deleteMany({ userId: session.userId });
        await Goal.deleteMany({ userId: session.userId });
        await ChatMessage.deleteMany({ userId: session.userId });
      } else {
        // Clear then reseed
        await Transaction.deleteMany({ userId: session.userId });
        await Budget.deleteMany({ userId: session.userId });
        await Goal.deleteMany({ userId: session.userId });
        await seedDemoDataForUser(session.userId);
      }
    } else {
      if (action === "clear") {
        memoryStore.transactions = memoryStore.transactions.filter(
          (t) => t.userId !== session.userId.toString()
        );
        memoryStore.budgets = memoryStore.budgets.filter(
          (b) => b.userId !== session.userId.toString()
        );
        memoryStore.goals = memoryStore.goals.filter(
          (g) => g.userId !== session.userId.toString()
        );
        memoryStore.chatMessages = memoryStore.chatMessages.filter(
          (m) => m.userId !== session.userId.toString()
        );
      } else {
        memoryStore.transactions = memoryStore.transactions.filter(
          (t) => t.userId !== session.userId.toString()
        );
        memoryStore.budgets = memoryStore.budgets.filter(
          (b) => b.userId !== session.userId.toString()
        );
        memoryStore.goals = memoryStore.goals.filter(
          (g) => g.userId !== session.userId.toString()
        );
        await seedDemoDataForUser(session.userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: action === "clear" ? "Demo data cleared successfully" : "Demo data refreshed successfully",
    });
  } catch (err) {
    console.error("Demo reset error:", err);
    return NextResponse.json({ error: "Failed to reset demo data" }, { status: 500 });
  }
}

