import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Budget from "@/lib/models/Budget";
import Transaction from "@/lib/models/Transaction";
import { memoryStore, generateId } from "@/lib/memoryStore";

export async function GET(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const conn = await connectDB();
    let budgets = [];
    let transactions = [];

    if (conn) {
      budgets = await Budget.find({ userId: session.userId, month }).lean();
      transactions = await Transaction.find({
        userId: session.userId,
        type: "expense",
      }).lean();
    } else {
      budgets = memoryStore.budgets.filter(
        (b) => b.userId === session.userId.toString() && b.month === month
      );
      transactions = memoryStore.transactions.filter(
        (t) => t.userId === session.userId.toString() && t.type === "expense"
      );
    }

    // Filter transactions by the target month
    const currentMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.toISOString().slice(0, 7) === month;
    });

    // Compute spent per budget category
    const budgetsWithProgress = budgets.map((b) => {
      const spent = currentMonthExpenses
        .filter((t) => t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      let status = "normal";
      if (percentage >= 100) status = "exceeded";
      else if (percentage >= 80) status = "warning";

      return {
        ...b,
        spent,
        remaining: Math.max(0, b.limit - spent),
        percentage,
        status,
      };
    });

    return NextResponse.json({ budgets: budgetsWithProgress, month });
  } catch (err) {
    console.error("Budgets GET error:", err);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { category, limit, month } = body;

    if (!category || limit === undefined) {
      return NextResponse.json({ error: "Category and limit are required" }, { status: 400 });
    }

    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const conn = await connectDB();
    let savedBudget;

    if (conn) {
      savedBudget = await Budget.findOneAndUpdate(
        { userId: session.userId, category: category.trim(), month: currentMonth },
        { limit: Number(limit) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      const idx = memoryStore.budgets.findIndex(
        (b) =>
          b.userId === session.userId.toString() &&
          b.category.toLowerCase() === category.trim().toLowerCase() &&
          b.month === currentMonth
      );
      if (idx !== -1) {
        memoryStore.budgets[idx].limit = Number(limit);
        savedBudget = memoryStore.budgets[idx];
      } else {
        savedBudget = {
          _id: generateId(),
          userId: session.userId.toString(),
          category: category.trim(),
          limit: Number(limit),
          month: currentMonth,
          createdAt: new Date(),
        };
        memoryStore.budgets.push(savedBudget);
      }
    }

    return NextResponse.json({ success: true, budget: savedBudget });
  } catch (err) {
    console.error("Budgets POST error:", err);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Budget ID required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      await Budget.findOneAndDelete({ _id: id, userId: session.userId });
    } else {
      memoryStore.budgets = memoryStore.budgets.filter(
        (b) => !(b._id.toString() === id.toString() && b.userId === session.userId.toString())
      );
    }

    return NextResponse.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    console.error("Budgets DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

