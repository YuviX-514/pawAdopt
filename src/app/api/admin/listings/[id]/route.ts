import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { isAdmin } from "@/lib/roles";
import { serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import Pet from "@/models/Pet";
import User from "@/models/User";

type Params = {
  params: Promise<{ id: string }>;
};

type ReviewBody = {
  action?: "approve" | "reject";
  reason?: string;
};

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isAdmin(currentUser.role)) {
      return fail("Admin access required.", 403);
    }

    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid listing ID", 400);
    }

    const body = (await req.json()) as ReviewBody;
    if (body.action !== "approve" && body.action !== "reject") {
      return fail("Action must be approve or reject.", 400);
    }

    const pet = await Pet.findById(id);
    if (!pet) {
      return fail("Pet listing not found", 404);
    }

    if (pet.moderationStatus !== "pending") {
      return fail("This listing has already been reviewed.", 409);
    }

    pet.moderationStatus = body.action === "approve" ? "approved" : "rejected";
    pet.reviewedBy = currentUser.document._id;
    pet.reviewedAt = new Date();

    let message = "Listing approved and published.";

    if (body.action === "reject") {
      pet.rejectionReason = body.reason?.trim() || "Listing did not meet PawAdopt quality standards.";

      const owner = await User.findById(pet.createdBy);
      if (owner) {
        owner.listingRejectedCount = (owner.listingRejectedCount || 0) + 1;

        if (owner.listingRejectedCount >= 5) {
          owner.listingBanned = true;
          owner.listingBanReason =
            "Account reached five rejected pet listings. Contact support to appeal.";
        }

        await owner.save();
      }

      message =
        "Listing rejected." +
        (pet.rejectionReason ? ` Reason: ${pet.rejectionReason}` : "");
    }

    await pet.save();
    const populated = await pet.populate("createdBy", "username email image role listingRejectedCount listingBanned");

    return ok({ listing: serializeDocument(populated), message });
  } catch (error) {
    console.error("POST /api/admin/listings/[id] error:", error);
    return fail("Failed to review listing", 500);
  }
}
