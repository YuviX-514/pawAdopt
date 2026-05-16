import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";
import { isAdmin } from "@/lib/roles";
import { serializeDocuments } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import Pet from "@/models/Pet";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isAdmin(currentUser.role)) {
      return fail("Admin access required.", 403);
    }

    await connectDB();

    const listings = await Pet.find({ moderationStatus: "pending" })
      .sort({ createdAt: 1 })
      .populate("createdBy", "username email image role listingRejectedCount listingBanned");

    return ok(serializeDocuments(listings));
  } catch (error) {
    console.error("GET /api/admin/listings error:", error);
    return fail("Failed to fetch pending listings", 500);
  }
}
