import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { serializeDocument } from "@/lib/serializers";
import Pet from "@/models/Pet";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid pet ID", 400);
    }

    const pet = await Pet.findById(id).populate("createdBy", "username email image role");

    if (!pet) {
      return fail("Pet not found", 404);
    }

    return ok(serializeDocument(pet));
  } catch (error) {
    console.error("GET /api/pets/[id] error:", error);
    return fail("Internal server error", 500);
  }
}
