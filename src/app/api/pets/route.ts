import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { canListPets, isAdmin } from "@/lib/roles";
import { serializeDocuments, serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import Pet from "@/models/Pet";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = cleanString(searchParams.get("q"));
    const species = cleanString(searchParams.get("species"));
    const adopted = searchParams.get("adopted");

    const filters: Record<string, unknown> = {};
    filters.moderationStatus = "approved";

    if (query) {
      filters.$or = [
        { name: { $regex: query, $options: "i" } },
        { species: { $regex: query, $options: "i" } },
        { breed: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (species) {
      filters.species = { $regex: species, $options: "i" };
    }

    if (adopted === "true" || adopted === "false") {
      filters.adopted = adopted === "true";
    }

    const pets = await Pet.find(filters)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email image role");

    return ok(serializeDocuments(pets));
  } catch (error) {
    console.error("GET /api/pets error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Unauthorized", 401);
    }

    if (!canListPets(currentUser.role)) {
      return fail("Only owner and admin accounts can list pets.", 403);
    }

    if (currentUser.document.listingBanned && !isAdmin(currentUser.role)) {
      return fail(
        "Your account cannot submit new pet listings right now. Please contact support to appeal this restriction.",
        403
      );
    }

    const body = await req.json();
    const name = cleanString(body.name);
    const species = cleanString(body.species);
    const photos = Array.isArray(body.photos)
      ? body.photos.filter((photo: unknown): photo is string => typeof photo === "string")
      : [];

    if (!name || !species || photos.length === 0) {
      return fail("Name, species, and at least one photo are required.");
    }

    const pet = await Pet.create({
      name,
      species,
      breed: cleanString(body.breed),
      age: toOptionalNumber(body.age),
      gender: cleanString(body.gender),
      description: cleanString(body.description),
      photos,
      createdBy: currentUser.document._id,
      moderationStatus: isAdmin(currentUser.role) ? "approved" : "pending",
      reviewedBy: isAdmin(currentUser.role) ? currentUser.document._id : undefined,
      reviewedAt: isAdmin(currentUser.role) ? new Date() : undefined,
    });

    return ok(serializeDocument(pet), { status: 201 });
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return fail("Internal Server Error", 500);
  }
}
