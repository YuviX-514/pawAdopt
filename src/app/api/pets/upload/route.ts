import { NextRequest } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { fail, ok } from "@/lib/api-response";
import {
  assertCloudinaryPetPhoto,
  PET_PHOTO_LIMITS,
  validatePetPhotoFiles,
} from "@/lib/photo-validation";
import { canListPets, isAdmin } from "@/lib/roles";
import { serializeDocument } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import Pet from "@/models/Pet";

function cleanString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanAge(value: FormDataEntryValue | null) {
  const raw = cleanString(value);
  if (!raw) return undefined;

  const age = Number(raw);
  return Number.isFinite(age) && age >= 0 ? age : undefined;
}

function uploadToCloudinary(buffer: Buffer) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "pets",
          quality_analysis: true,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        }
      )
      .end(buffer);
  });
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

    const formData = await req.formData();
    const files = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File);

    const name = cleanString(formData.get("name"));
    const species = cleanString(formData.get("species"));

    if (!name || !species) {
      return fail("Pet name and species are required.");
    }

    const validatedPhotos = await validatePetPhotoFiles(files);
    const photoUrls: string[] = [];

    for (const photo of validatedPhotos) {
      const uploadRes = await uploadToCloudinary(photo.buffer);
      assertCloudinaryPetPhoto(uploadRes);
      photoUrls.push(uploadRes.secure_url);
    }

    const pet = await Pet.create({
      name,
      species,
      breed: cleanString(formData.get("breed")),
      age: cleanAge(formData.get("age")),
      gender: cleanString(formData.get("gender")),
      description: cleanString(formData.get("description")),
      photos: photoUrls,
      createdBy: currentUser.document._id,
      moderationStatus: isAdmin(currentUser.role) ? "approved" : "pending",
      reviewedBy: isAdmin(currentUser.role) ? currentUser.document._id : undefined,
      reviewedAt: isAdmin(currentUser.role) ? new Date() : undefined,
    });

    return ok(
      {
        pet: serializeDocument(pet),
        message: isAdmin(currentUser.role)
          ? "Pet listing published."
          : "Pet listing submitted for admin review.",
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload pet photos.";

    if (
      message.includes("photo") ||
      message.includes("image") ||
      message.includes("JPG") ||
      message.includes("PNG") ||
      message.includes("WebP") ||
      message.includes(`${PET_PHOTO_LIMITS.maxFiles}`)
    ) {
      console.warn("Pet upload validation failed:", message);
      return fail(message);
    }

    console.error("POST /api/pets/upload error:", error);
    return fail("Server error", 500);
  }
}
