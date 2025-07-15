import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";

interface Params {
  params: Promise<{ id: string }>;
}
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const pet = await Pet.findById(id).populate("createdBy", "username email image");


    if (!pet) {
      return NextResponse.json(
        { success: false, message: "Pet not found" },
        { status: 404 }
      );
    }

    const petObj = pet.toObject();
    petObj.id = petObj._id.toString();
    delete petObj._id;
    delete petObj.__v;

    return NextResponse.json({
      success: true,
      data: petObj,
    });
  } catch (error) {
    console.error("Error fetching pet:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}