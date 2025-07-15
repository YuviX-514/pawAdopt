import { connectDB } from "@/lib/db";
import Pet, { PetType } from "@/models/Pet";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { HydratedDocument, Types } from "mongoose";

// 🧠 Type-safe transformation

function transformPet(pet: HydratedDocument<PetType>) {
  const obj = pet.toObject() as PetType & { _id: Types.ObjectId };
  const { _id, ...rest } = obj;

  return {
    ...rest,
    id: _id.toString(),
  };
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

    // ✅ Get actual user from email
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Create pet with actual user reference
    const pet = await Pet.create({
      ...data,
      createdBy: user._id,
    });

    const transformed = transformPet(pet);
    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
