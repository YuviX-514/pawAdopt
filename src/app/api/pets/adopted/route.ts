// src/app/api/pets/adopted/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await connectDB();

    const pets = await Pet.find({
      adopted: true,
      "adoptedBy.email": body.email,
    });

    return NextResponse.json(pets);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Failed to fetch adopted pets" },
      { status: 500 }
    );
  }
}
