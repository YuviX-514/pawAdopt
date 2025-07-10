import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const petId = context.params.id;

    if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      message,
    } = body;

    if (!name || !email || !phone || !address || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    if (pet.adopted) {
      return NextResponse.json(
        { success: false, message: "This pet has already been adopted" },
        { status: 400 }
      );
    }

    pet.adopted = true;
    pet.adoptedBy = {
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      message,
      date: new Date(),
    };

    await pet.save();

    return NextResponse.json({
      success: true,
      message: "Adoption request submitted successfully",
      data: pet,
    });
  } catch (error) {
    console.error("Adoption error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
