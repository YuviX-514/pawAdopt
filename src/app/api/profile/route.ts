import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { normalizeRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/server-auth";

const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_PHOTO_MAX_BYTES = 3 * 1024 * 1024;

function serializeProfile(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    image: user.image || "/user.png",
    email: user.email,
    role: user.role,
    listingRejectedCount: user.document.listingRejectedCount || 0,
    listingBanned: Boolean(user.document.listingBanned),
    listingBanReason: user.document.listingBanReason,
    roleRequest: user.document.roleRequest,
  };
}

function uploadProfileImage(buffer: Buffer) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "users",
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      )
      .end(buffer);
  });
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: serializeProfile(currentUser) });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const username = formData.get("username");
  const imageFile = formData.get("image");

  if (typeof username !== "string" || username.trim().length < 2) {
    return NextResponse.json(
      { message: "Username must be at least 2 characters." },
      { status: 400 }
    );
  }

  let imageUrl = currentUser.document.image || "/user.png";

  if (formData.get("removeImage") === "true") {
    imageUrl = "/user.png";
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!PROFILE_PHOTO_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { message: "Profile photo must be a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (imageFile.size > PROFILE_PHOTO_MAX_BYTES) {
      return NextResponse.json(
        { message: "Profile photo must be under 3MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadRes = await uploadProfileImage(buffer);
    imageUrl = uploadRes.secure_url;
  }

  currentUser.document.username = username.trim();
  currentUser.document.image = imageUrl;

  await currentUser.document.save();

  return NextResponse.json({
    message: "Profile updated",
    user: serializeProfile({
      ...currentUser,
      username: currentUser.document.username,
      image: currentUser.document.image,
      role: normalizeRole(currentUser.document.role),
    }),
  });
}
