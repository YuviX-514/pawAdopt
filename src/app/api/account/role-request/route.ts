import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { normalizeRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/server-auth";

type RoleRequestBody = {
  requestedRole?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const body = (await req.json()) as RoleRequestBody;
  const requestedRole = normalizeRole(body.requestedRole);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (requestedRole === "admin") {
    return fail("Admin access cannot be requested from settings.", 400);
  }

  if (requestedRole === currentUser.role) {
    return fail("Your account already has this role.", 400);
  }

  if (message.length < 20) {
    return fail("Please add at least 20 characters explaining why you need this role.", 400);
  }

  currentUser.document.roleRequest = {
    requestedRole,
    message,
    status: "pending",
    requestedAt: new Date(),
  };

  await currentUser.document.save();

  return ok({ message: "Role change request sent to admins." });
}
