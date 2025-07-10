import { connectDB } from "@/lib/db";
import Pet, { PetType } from "@/models/Pet";
import { NextResponse } from "next/server";
import mongoose, { HydratedDocument } from "mongoose";

type PetDocumentObject = PetType & {
  _id?: mongoose.Types.ObjectId;
  __v?: number;
  id?: string;
};

// Helper to transform Mongoose document to JSON with `id`
function transformPet(pet: HydratedDocument<PetType>) {
  const obj = pet.toObject<PetDocumentObject>();
  obj.id = pet.id.toString();
  delete obj.id;
  delete obj.__v;
  return obj;
}

export async function GET() {
  try {
    await connectDB();
    const pets = await Pet.find().populate("createdBy");
    const transformedPets = pets.map(transformPet);
    return NextResponse.json(transformedPets, { status: 200 });
  } catch (err) {
    console.error("GET /api/pets error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data.createdBy) {
      return NextResponse.json(
        { error: "`createdBy` is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(data.createdBy)) {
      return NextResponse.json(
        { error: "`createdBy` must be a valid ObjectId" },
        { status: 400 }
      );
    }

    const pet = await Pet.create(data);
    const transformed = transformPet(pet);
    return NextResponse.json(transformed, { status: 200 });
  } catch (err) {
    console.error("POST /api/pets error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
