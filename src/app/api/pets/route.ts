import { connectDB } from "@/lib/db";
import Pet from "@/models/Pet";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Helper to transform Mongoose document to JSON with `id`
function transformPet(pet: any) {
  const obj = pet.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

export async function GET() {
  try {
    await connectDB();
    const pets = await Pet.find().populate("createdBy");
    const transformedPets = pets.map(transformPet);
    return NextResponse.json(transformedPets, { status: 200 });
  } catch (error) {
    console.error("GET /api/pets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    // Dummy user for testing
    const dummyUserId = new mongoose.Types.ObjectId("64a1234567890abcdef12345");

    const pet = await Pet.create({
      ...data,
      createdBy: dummyUserId,
    });

    const transformed = transformPet(pet);
    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
