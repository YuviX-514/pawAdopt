"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { canListPets, normalizeRole } from "@/lib/roles";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, Pet } from "@/types/pet";

const MAX_FILES = 5;
const MAX_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PLACEHOLDER_PATTERN = /(dummy|placeholder|sample|default|stock|logo|avatar|icon|test|blank|image)$/i;

const initialForm = {
  name: "",
  species: "",
  breed: "",
  age: "",
  gender: "",
  description: "",
};

function validatePhotoFiles(files: File[], existingCount = 0) {
  if (existingCount + files.length > MAX_FILES) {
    throw new Error(`Upload up to ${MAX_FILES} photos.`);
  }

  for (const file of files) {
    const baseName = file.name.replace(/\.[^.]+$/, "");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error(`${file.name} must be a JPG, PNG, or WebP image.`);
    }

    if (file.size / (1024 * 1024) > MAX_MB) {
      throw new Error(`${file.name} is too large. Max ${MAX_MB}MB allowed.`);
    }

    if (PLACEHOLDER_PATTERN.test(baseName)) {
      throw new Error(`${file.name} looks like a dummy photo. Upload a real pet photo.`);
    }
  }
}

export default function UploadPetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const role = normalizeRole(session?.user?.role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && !canListPets(role)) {
      toast.error("Switch your account role to owner before listing pets.");
      router.push("/settings");
    }
  }, [role, router, status]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  if (status === "loading") {
    return <LoadingState label="Checking your account..." />;
  }

  if (status === "authenticated" && !canListPets(role)) {
    return null;
  }

  function updatePreviews(nextPhotos: File[]) {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(nextPhotos.map((file) => URL.createObjectURL(file)));
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhotoSelection(event: React.ChangeEvent<HTMLInputElement>, mode: "replace" | "append") {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    try {
      validatePhotoFiles(selected, mode === "append" ? photos.length : 0);
      const nextPhotos = mode === "append" ? [...photos, ...selected] : selected;
      setPhotos(nextPhotos);
      updatePreviews(nextPhotos);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid photo upload.");
    } finally {
      event.target.value = "";
    }
  }

  function removePhoto(index: number) {
    const nextPhotos = photos.filter((_, photoIndex) => photoIndex !== index);
    setPhotos(nextPhotos);
    updatePreviews(nextPhotos);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name.trim() || !form.species.trim() || photos.length === 0) {
      toast.error("Name, species, and at least one pet photo are required.");
      return;
    }

    setLoading(true);

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) body.append(key, value);
    });
    photos.forEach((photo) => body.append("photos", photo));

    try {
      const res = await fetch("/api/pets/upload", {
        method: "POST",
        body,
      });
      const payload = (await res.json()) as ApiResult<Pet>;

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Upload failed");
      }

      toast.success("Pet listing created.");
      router.push(`/pets/${payload.data?.id || ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Add a New Pet</h1>
          <p className="mt-3 text-lg text-gray-500">
            Clear, real pet photos help adopters and owners make better matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pet photos</label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-5">
              {previews.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((src, index) => (
                    <div key={src} className="relative">
                      <Image
                        src={src}
                        alt={`Pet preview ${index + 1}`}
                        width={500}
                        height={500}
                        className="h-44 w-full rounded object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  Add at least one clear JPG, PNG, or WebP pet photo.
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <label className="cursor-pointer rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                  {previews.length ? "Change photos" : "Add photos"}
                  <input
                    name="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => handlePhotoSelection(event, "replace")}
                    disabled={loading}
                    className="sr-only"
                  />
                </label>
                {previews.length ? (
                  <label className="cursor-pointer rounded border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                    Add more
                    <input
                      name="photos"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) => handlePhotoSelection(event, "append")}
                      disabled={loading}
                      className="sr-only"
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Pet name" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Species" name="species" value={form.species} onChange={handleChange} required />
            <Field label="Breed" name="breed" value={form.breed} onChange={handleChange} />
            <Field label="Age (years)" name="age" type="number" min="0" value={form.age} onChange={handleChange} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
              placeholder="Personality, habits, medical notes, and care needs."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
          >
            {loading ? "Uploading..." : "Submit pet listing"}
          </button>
        </form>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: keyof typeof initialForm;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  min?: string;
};

function Field({ label, name, value, onChange, type = "text", required, min }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
      />
    </div>
  );
}
