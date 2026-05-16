import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { serializeDocuments } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pet";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Unauthorized", 401);
    }

    await connectDB();

    const approvedRequests = await AdoptionRequest.find({
      requester: currentUser.document._id,
      status: "approved",
    })
      .sort({ updatedAt: -1 })
      .populate("pet", "name species breed photos adopted adoptedBy createdAt")
      .populate("owner", "username email image role");

    return ok(serializeDocuments(approvedRequests));
  } catch (error) {
    console.error("GET /api/pets/adopted error:", error);
    return fail("Failed to fetch adopted pets", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Unauthorized", 401);
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email : currentUser.email;

    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      return fail("You can only view your own adopted pets.", 403);
    }

    await connectDB();

    const pets = await Pet.find({
      adopted: true,
      "adoptedBy.email": currentUser.email,
    });

    return ok(serializeDocuments(pets));
  } catch (error) {
    console.error("POST /api/pets/adopted error:", error);
    return fail("Failed to fetch adopted pets", 500);
  }
}
