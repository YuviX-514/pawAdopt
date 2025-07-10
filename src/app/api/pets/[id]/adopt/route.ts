import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import mongoose from "mongoose";

interface RequestContext {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  context: RequestContext
): Promise<NextResponse> {
  try {
    await connectDB();
    const petId = context.params.id;

    if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
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
        { success: false, message: "Pet already adopted" },
        { status: 400 }
      );
    }

    pet.adopted = true;
    pet.adoptedBy = {
      ...body,
      date: new Date()
    };

    await pet.save();

    return NextResponse.json({
      success: true,
      message: "Adoption successful",
      data: pet
    });

  } catch (error) {
    console.error("Adoption error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}