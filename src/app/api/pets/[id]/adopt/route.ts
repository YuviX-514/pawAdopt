import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Validate ID
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, phone, address, city, state, country, postalCode, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const pet = await Pet.findById(params.id);
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

    // Update pet adoption status
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
      date: new Date()
    };

    await pet.save();

    return NextResponse.json({
      success: true,
      message: "Adoption request submitted successfully",
      data: pet
    });

  } catch (error) {
    console.error("Adoption error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}