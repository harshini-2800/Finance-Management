import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/lib/models/Goal";
import { memoryStore, generateId } from "@/lib/memoryStore";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conn = await connectDB();
    let goals = [];

    if (conn) {
      goals = await Goal.find({ userId: session.userId }).sort({ deadline: 1 }).lean();
    } else {
      goals = memoryStore.goals
        .filter((g) => g.userId === session.userId.toString())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    const enhancedGoals = goals.map((g) => {
      const remainingAmount = Math.max(0, g.targetAmount - g.savedAmount);
      const targetDate = new Date(g.deadline);
      const now = new Date();
      const diffDays = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
      const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
      const weeklySuggestion = Math.round(remainingAmount / diffWeeks);
      const percentage = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));

      return {
        ...g,
        percentage,
        remainingAmount,
        diffDays,
        diffWeeks,
        weeklySuggestion,
      };
    });

    return NextResponse.json({ goals: enhancedGoals });
  } catch (err) {
    console.error("Goals GET error:", err);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, targetAmount, savedAmount, deadline } = body;

    if (!title || !targetAmount || !deadline) {
      return NextResponse.json({ error: "Title, target amount, and deadline are required" }, { status: 400 });
    }

    const conn = await connectDB();
    let goal;

    const payload = {
      userId: session.userId,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      savedAmount: savedAmount ? Number(savedAmount) : 0,
      deadline: new Date(deadline),
    };

    if (conn) {
      goal = await Goal.create(payload);
    } else {
      goal = {
        _id: generateId(),
        ...payload,
        createdAt: new Date(),
      };
      memoryStore.goals.push(goal);
    }

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (err) {
    console.error("Goals POST error:", err);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

// Add funds to a goal vault
export async function PATCH(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, addAmount } = body;

    if (!id || addAmount === undefined || Number(addAmount) <= 0) {
      return NextResponse.json({ error: "Goal ID and valid amount required" }, { status: 400 });
    }

    const conn = await connectDB();
    let updated;

    if (conn) {
      updated = await Goal.findOneAndUpdate(
        { _id: id, userId: session.userId },
        { $inc: { savedAmount: Number(addAmount) } },
        { new: true }
      );
    } else {
      const idx = memoryStore.goals.findIndex(
        (g) => g._id.toString() === id.toString() && g.userId === session.userId.toString()
      );
      if (idx !== -1) {
        memoryStore.goals[idx].savedAmount += Number(addAmount);
        updated = memoryStore.goals[idx];
      }
    }

    return NextResponse.json({ success: true, goal: updated });
  } catch (err) {
    console.error("Goals PATCH error:", err);
    return NextResponse.json({ error: "Failed to update goal funds" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Goal ID required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      await Goal.findOneAndDelete({ _id: id, userId: session.userId });
    } else {
      memoryStore.goals = memoryStore.goals.filter(
        (g) => !(g._id.toString() === id.toString() && g.userId === session.userId.toString())
      );
    }

    return NextResponse.json({ success: true, message: "Goal deleted" });
  } catch (err) {
    console.error("Goals DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}

