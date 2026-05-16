import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { isAdmin } from "@/lib/roles";
import { serializeDocuments } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import User from "@/models/User";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isAdmin(currentUser.role)) {
      return fail("Admin access required.", 403);
    }

    await connectDB();

    const users = await User.find({
      $or: [{ listingBanned: true }, { "roleRequest.status": "pending" }],
    })
      .sort({ listingBanned: -1, updatedAt: -1 })
      .select("username email image role listingRejectedCount listingBanned listingBanReason roleRequest");

    return ok(serializeDocuments(users));
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return fail("Failed to fetch users", 500);
  }
}
