import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid pet ID" },
        { status: 400 }
      );
    }

    const pet = await Pet.findById(params.id)
      .populate("createdBy", "name email imageUrl");

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
