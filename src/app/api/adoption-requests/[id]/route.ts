import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { isAdmin } from "@/lib/roles";
import { serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import AdoptionRequest from "@/models/AdoptionRequest";
import Pet from "@/models/Pet";

type Params = {
  params: Promise<{ id: string }>;
};

type ReviewBody = {
  action?: "approve" | "reject";
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid adoption request ID", 400);
    }

    const body = (await req.json()) as ReviewBody;
    if (body.action !== "approve" && body.action !== "reject") {
      return fail("Action must be approve or reject.", 400);
    }

    const adoptionRequest = await AdoptionRequest.findById(id);
    if (!adoptionRequest) {
      return fail("Adoption request not found", 404);
    }

    const isOwner = adoptionRequest.owner.toString() === currentUser.id;
    if (!isOwner && !isAdmin(currentUser.role)) {
      return fail("You can only review requests for your own pet listings.", 403);
    }

    if (adoptionRequest.status !== "pending") {
      return fail("This adoption request has already been reviewed.", 409);
    }

    const pet = await Pet.findById(adoptionRequest.pet);
    if (!pet) {
      return fail("Pet not found", 404);
    }

    if (body.action === "approve") {
      if (pet.adopted) {
        return fail("This pet has already been adopted.", 409);
      }

      adoptionRequest.status = "approved";
      adoptionRequest.reviewedAt = new Date();
      adoptionRequest.reviewedBy = currentUser.document._id;

      pet.adopted = true;
      pet.adoptedBy = {
        ...adoptionRequest.contact,
        message: adoptionRequest.message,
        adoptedAt: new Date(),
      };

      await Promise.all([
        adoptionRequest.save(),
        pet.save(),
        AdoptionRequest.updateMany(
          {
            _id: { $ne: adoptionRequest._id },
            pet: pet._id,
            status: "pending",
          },
          {
            $set: {
              status: "rejected",
              reviewedAt: new Date(),
              reviewedBy: currentUser.document._id,
            },
          }
        ),
      ]);
    } else {
      adoptionRequest.status = "rejected";
      adoptionRequest.reviewedAt = new Date();
      adoptionRequest.reviewedBy = currentUser.document._id;
      await adoptionRequest.save();
    }

    const populated = await AdoptionRequest.findById(adoptionRequest._id)
      .populate("pet", "name species breed photos adopted createdBy")
      .populate("requester", "username email image role")
      .populate("owner", "username email image role");

    return ok({
      request: populated ? serializeDocument(populated) : serializeDocument(adoptionRequest),
      message:
        body.action === "approve"
          ? "Adoption approved. The pet is now marked as adopted."
          : "Adoption request rejected.",
    });
  } catch (error) {
    console.error("PATCH /api/adoption-requests/[id] error:", error);
    return fail("Internal Server Error", 500);
  }
}
