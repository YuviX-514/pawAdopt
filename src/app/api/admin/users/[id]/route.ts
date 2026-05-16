import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { isAdmin, normalizeRole } from "@/lib/roles";
import { serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import User from "@/models/User";

type Params = {
  params: Promise<{ id: string }>;
};

type AdminUserAction = {
  action?: "unban" | "approve-role" | "reject-role";
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
      return fail("Invalid user ID", 400);
    }

    const body = (await req.json()) as AdminUserAction;
    const user = await User.findById(id);

    if (!user) {
      return fail("User not found", 404);
    }

    if (body.action === "unban") {
      user.listingBanned = false;
      user.listingBanReason = undefined;
      user.listingBanLiftedAt = new Date();
      user.listingRejectedCount = 0;
      await user.save();
      return ok({ user: serializeDocument(user), message: "Listing restriction removed." });
    }

    if (body.action === "approve-role" || body.action === "reject-role") {
      const requestedRole = normalizeRole(user.roleRequest?.requestedRole);

      if (!user.roleRequest || user.roleRequest.status !== "pending") {
        return fail("No pending role request found.", 409);
      }

      if (body.action === "approve-role" && requestedRole !== "admin") {
        user.role = requestedRole;
      }

      user.roleRequest.status = body.action === "approve-role" ? "approved" : "rejected";
      user.roleRequest.reviewedAt = new Date();
      user.roleRequest.reviewedBy = currentUser.document._id;
      await user.save();

      return ok({
        user: serializeDocument(user),
        message: body.action === "approve-role" ? "Role request approved." : "Role request rejected.",
      });
    }

    return fail("Unsupported admin action.", 400);
  } catch (error) {
    console.error("POST /api/admin/users/[id] error:", error);
    return fail("Failed to update user", 500);
  }
}
