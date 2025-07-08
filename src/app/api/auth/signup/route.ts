import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.provider === "credentials") {
        return NextResponse.json(
          { error: "User already exists!" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            error: `Account exists via ${existing.provider}. Please login using ${existing.provider}.`,
          },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      provider: "credentials",
    });

    return NextResponse.json({ message: "User created", user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
