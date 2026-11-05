import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { memoryStore, generateId } from "@/lib/memoryStore";

export async function GET(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const conn = await connectDB();
    let transactions = [];

    if (conn) {
      const query = { userId: session.userId };
      if (type && type !== "all") query.type = type;
      if (category && category !== "all") query.category = category;
      if (search) {
        query.$or = [
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      transactions = await Transaction.find(query).sort({ date: -1 }).limit(limit).lean();
    } else {
      transactions = memoryStore.transactions
        .filter((t) => t.userId === session.userId.toString())
        .filter((t) => (!type || type === "all" ? true : t.type === type))
        .filter((t) => (!category || category === "all" ? true : t.category.toLowerCase() === category.toLowerCase()))
        .filter((t) =>
          search
            ? t.description.toLowerCase().includes(search.toLowerCase()) ||
              t.category.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    }

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Transactions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, amount, category, description, date, source, isRecurring } = body;

    if (!type || !amount || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conn = await connectDB();
    let created;

    const payload = {
      userId: session.userId,
      type,
      amount: Number(amount),
      category: category.trim(),
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
      source: source || "manual",
      isRecurring: Boolean(isRecurring),
    };

    if (conn) {
      created = await Transaction.create(payload);
    } else {
      created = {
        _id: generateId(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.transactions.unshift(created);
    }

    return NextResponse.json({ success: true, transaction: created }, { status: 201 });
  } catch (err) {
    console.error("Transactions POST error:", err);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, type, amount, category, description, date, isRecurring } = body;

    if (!id) return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });

    const conn = await connectDB();
    let updated;

    if (conn) {
      updated = await Transaction.findOneAndUpdate(
        { _id: id, userId: session.userId },
        {
          ...(type && { type }),
          ...(amount && { amount: Number(amount) }),
          ...(category && { category: category.trim() }),
          ...(description && { description: description.trim() }),
          ...(date && { date: new Date(date) }),
          ...(isRecurring !== undefined && { isRecurring }),
        },
        { new: true }
      );
    } else {
      const idx = memoryStore.transactions.findIndex(
        (t) => t._id.toString() === id.toString() && t.userId === session.userId.toString()
      );
      if (idx !== -1) {
        if (type) memoryStore.transactions[idx].type = type;
        if (amount) memoryStore.transactions[idx].amount = Number(amount);
        if (category) memoryStore.transactions[idx].category = category.trim();
        if (description) memoryStore.transactions[idx].description = description.trim();
        if (date) memoryStore.transactions[idx].date = new Date(date);
        if (isRecurring !== undefined) memoryStore.transactions[idx].isRecurring = isRecurring;
        updated = memoryStore.transactions[idx];
      }
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err) {
    console.error("Transactions PUT error:", err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });

    const conn = await connectDB();

    if (conn) {
      await Transaction.findOneAndDelete({ _id: id, userId: session.userId });
    } else {
      memoryStore.transactions = memoryStore.transactions.filter(
        (t) => !(t._id.toString() === id.toString() && t.userId === session.userId.toString())
      );
    }

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    console.error("Transactions DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

