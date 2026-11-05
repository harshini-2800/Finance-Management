import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { memoryStore } from "@/lib/memoryStore";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await connectDB();
    let user;

    if (conn) {
      user = await User.findById(session.userId).select("-passwordHash");
    } else {
      user = memoryStore.users.find((u) => u._id.toString() === session.userId.toString());
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency || "INR",
        monthlyIncome: user.monthlyIncome || 75000,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currency, monthlyIncome } = body;

    const conn = await connectDB();
    let updated;

    if (conn) {
      updated = await User.findByIdAndUpdate(
        session.userId,
        {
          ...(name && { name }),
          ...(currency && { currency }),
          ...(monthlyIncome && { monthlyIncome: Number(monthlyIncome) }),
        },
        { new: true }
      ).select("-passwordHash");
    } else {
      const idx = memoryStore.users.findIndex((u) => u._id.toString() === session.userId.toString());
      if (idx !== -1) {
        if (name) memoryStore.users[idx].name = name;
        if (currency) memoryStore.users[idx].currency = currency;
        if (monthlyIncome) memoryStore.users[idx].monthlyIncome = Number(monthlyIncome);
        updated = memoryStore.users[idx];
      }
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

