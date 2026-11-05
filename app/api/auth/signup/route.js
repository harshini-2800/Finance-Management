import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { memoryStore, generateId } from "@/lib/memoryStore";
import { seedDemoDataForUser } from "@/lib/seedData";

export async function POST(request) {
  try {
    const { name, email, password, currency, monthlyIncome } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conn = await connectDB();
    const passwordHash = await bcrypt.hash(password, 10);

    let user;

    if (conn) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        currency: currency || "INR",
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 75000,
      });
    } else {
      const existing = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      user = {
        _id: generateId(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        currency: currency || "INR",
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 75000,
        createdAt: new Date(),
      };
      memoryStore.users.push(user);
    }

    // Seed demo data so the app looks alive immediately
    await seedDemoDataForUser(user._id);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Failed to sign up" }, { status: 500 });
  }
}

