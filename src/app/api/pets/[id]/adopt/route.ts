import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pet";

type Params = {
  params: Promise<{ id: string }>;
};

type AdoptionForm = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  message?: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateForm(body: AdoptionForm) {
  const contact = {
    name: cleanString(body.name),
    email: cleanString(body.email),
    phone: cleanString(body.phone),
    address: cleanString(body.address),
    city: cleanString(body.city),
    state: cleanString(body.state),
    country: cleanString(body.country) || "India",
    postalCode: cleanString(body.postalCode),
  };

  if (
    !contact.name ||
    !contact.email ||
    !contact.phone ||
    !contact.address ||
    !contact.city ||
    !contact.state ||
    !contact.postalCode
  ) {
    throw new Error("All required adoption fields must be completed.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!/^\d{10}$/.test(contact.phone)) {
    throw new Error("Phone number must be exactly 10 digits.");
  }

  return {
    contact,
    message: cleanString(body.message),
  };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Please log in before sending an adoption request.", 401);
    }

    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid pet ID", 400);
    }

    const pet = await Pet.findById(id);
    if (!pet) {
      return fail("Pet not found", 404);
    }

    if (pet.adopted) {
      return fail("This pet has already been adopted.", 400);
    }

    if (pet.moderationStatus !== "approved") {
      return fail("This pet is still being reviewed and cannot receive adoption requests yet.", 400);
    }

    if (pet.createdBy.toString() === currentUser.id) {
      return fail("You cannot request adoption for your own listing.", 400);
    }

    const existingPending = await AdoptionRequest.findOne({
      pet: pet._id,
      requester: currentUser.document._id,
      status: "pending",
    });

    if (existingPending) {
      return fail("You already have a pending request for this pet.", 409);
    }

    const body = (await req.json()) as AdoptionForm;
    const { contact, message } = validateForm(body);

    const adoptionRequest = await AdoptionRequest.create({
      requester: currentUser.document._id,
      owner: pet.createdBy,
      pet: pet._id,
      contact,
      message,
      status: "pending",
    });

    const populated = await adoptionRequest.populate([
      { path: "pet", select: "name species photos adopted" },
      { path: "requester", select: "username email image role" },
      { path: "owner", select: "username email image role" },
    ]);

    return ok(
      {
        request: serializeDocument(populated),
        message: "Adoption request sent to the pet owner for approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit adoption request.";

    if (message.includes("required") || message.includes("valid") || message.includes("Phone")) {
      return fail(message);
    }

    console.error("POST /api/pets/[id]/adopt error:", error);
    return fail("Internal server error", 500);
  }
}
