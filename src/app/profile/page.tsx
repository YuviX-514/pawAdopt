"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import LoadingState from "@/components/ui/LoadingState";
import type { UserRole } from "@/lib/roles";

export default function ProfilePage() {
  const { status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("adopter");
  const [previewUrl, setPreviewUrl] = useState("/user.png");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [router, status]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (status !== "authenticated") return;

      const res = await fetch("/api/profile");
      if (!res.ok) return;

      const data = await res.json();
      if (!isMounted) return;

      setUsername(data.user.username || "");
      setPreviewUrl(data.user.image || "/user.png");
      setRole(data.user.role || "adopter");
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [status]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Profile photo must be a JPG, PNG, or WebP image.");
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImage(null);
    setPreviewUrl("/user.png");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("role", role);

    if (image) {
      formData.append("image", image);
    } else if (previewUrl === "/user.png") {
      formData.append("removeImage", "true");
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error updating profile");
      }

      await update();
      toast.success("Profile updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-amber-300">
              <Image src={previewUrl} alt="Profile" fill className="object-cover" sizes="128px" />
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700">
                Change photo
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Account role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="adopter">Adopter</option>
              <option value="owner">Pet owner / rescuer</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Owner accounts can list pets and review adoption requests.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
