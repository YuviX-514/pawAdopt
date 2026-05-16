import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { normalizeRole } from "@/lib/roles";
import bcrypt from "bcryptjs";

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { username, email, password, role } = await req.json();

    if (!username || !isValidEmail(email) || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Username, a valid email, and a 6+ character password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.provider === "credentials") {
        return NextResponse.json({ error: "User already exists." }, { status: 400 });
      }

      return NextResponse.json(
        {
          error: `Account exists via ${existing.provider}. Please login using ${existing.provider}.`,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const requestedRole = normalizeRole(role);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "credentials",
      role: requestedRole === "admin" ? "adopter" : requestedRole,
    });

    return NextResponse.json({
      message: "User created",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
