import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { canReviewAdoptions, isAdmin } from "@/lib/roles";
import { serializeDocuments } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import AdoptionRequest from "@/models/AdoptionRequest";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return fail("Unauthorized", 401);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "mine";
    const status = searchParams.get("status");
    const filter: Record<string, unknown> = {};

    if (scope === "owner") {
      if (!canReviewAdoptions(currentUser.role)) {
        return fail("Only owner and admin accounts can review adoption requests.", 403);
      }

      if (!isAdmin(currentUser.role)) {
        filter.owner = currentUser.document._id;
      }
    } else {
      filter.requester = currentUser.document._id;
    }

    if (status === "pending" || status === "approved" || status === "rejected") {
      filter.status = status;
    }

    const requests = await AdoptionRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("pet", "name species breed photos adopted createdBy")
      .populate("requester", "username email image role")
      .populate("owner", "username email image role");

    return ok(serializeDocuments(requests));
  } catch (error) {
    console.error("GET /api/adoption-requests error:", error);
    return fail("Internal Server Error", 500);
  }
}
