import type { UploadApiResponse } from "cloudinary";

export const PET_PHOTO_LIMITS = {
  maxFiles: 5,
  maxBytes: 5 * 1024 * 1024,
  minBytes: 5 * 1024,
  minWidth: 320,
  minHeight: 320,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

const PLACEHOLDER_NAME_PATTERN =
  /(dummy|placeholder|sample|default|stock|logo|avatar|icon|screenshot|test|blank)$/i;

type ValidatedPetPhoto = {
  file: File;
  buffer: Buffer;
};

function looksLikeImage(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (type === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

function entropy(bytes: Uint8Array) {
  const counts = new Array<number>(256).fill(0);
  const sample = bytes.slice(0, Math.min(bytes.length, 64 * 1024));

  for (const byte of sample) counts[byte] += 1;

  return counts.reduce((score, count) => {
    if (!count) return score;
    const probability = count / sample.length;
    return score - probability * Math.log2(probability);
  }, 0);
}

function assertPetPhotoCandidate(file: File, buffer: Buffer) {
  if (!PET_PHOTO_LIMITS.allowedTypes.includes(file.type as (typeof PET_PHOTO_LIMITS.allowedTypes)[number])) {
    throw new Error(`${file.name} must be a JPG, PNG, or WebP image.`);
  }

  if (file.size > PET_PHOTO_LIMITS.maxBytes) {
    throw new Error(`${file.name} is too large. Upload photos under 5MB.`);
  }

  if (file.size < PET_PHOTO_LIMITS.minBytes) {
    throw new Error(`${file.name} is too small to verify as a real pet photo.`);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  if (PLACEHOLDER_NAME_PATTERN.test(baseName)) {
    throw new Error(`${file.name} looks like a placeholder. Upload a real pet photo.`);
  }

  if (!looksLikeImage(file.type, buffer)) {
    throw new Error(`${file.name} is not a valid image file.`);
  }

  if (entropy(buffer) < 2.5) {
    throw new Error(`${file.name} looks blank or artificial. Upload a clear pet photo.`);
  }
}

export async function validatePetPhotoFiles(files: File[]) {
  if (!files.length) {
    throw new Error("At least one pet photo is required.");
  }

  if (files.length > PET_PHOTO_LIMITS.maxFiles) {
    throw new Error(`Upload up to ${PET_PHOTO_LIMITS.maxFiles} pet photos.`);
  }

  const validated: ValidatedPetPhoto[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    assertPetPhotoCandidate(file, buffer);
    validated.push({ file, buffer });
  }

  return validated;
}

export function assertCloudinaryPetPhoto(upload: UploadApiResponse) {
  if (!upload.secure_url) {
    throw new Error("Photo upload failed. Please try again.");
  }

  if ((upload.width || 0) < PET_PHOTO_LIMITS.minWidth || (upload.height || 0) < PET_PHOTO_LIMITS.minHeight) {
    throw new Error("Pet photos must be at least 320x320 pixels.");
  }

  if ((upload.bytes || 0) < PET_PHOTO_LIMITS.minBytes) {
    throw new Error("Uploaded photo is too small to verify as a real pet photo.");
  }

  if (upload.original_filename && PLACEHOLDER_NAME_PATTERN.test(upload.original_filename)) {
    throw new Error("Placeholder or dummy photos are not accepted.");
  }
}
