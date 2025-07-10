"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;

      const res = await fetch("/api/profile", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setUsername(data.user.username || "");
        setPreviewUrl(data.user.image || "/image.png");
      }
    };

    fetchProfile();
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl("/image.png");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    if (image) {
      formData.append("image", image);
    } else if (previewUrl === "/image.png") {
      formData.append("removeImage", "true");
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        await update();
        alert("Profile updated successfully!");
        router.refresh();
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="py-25">
      <div className="max-w-xl mx-auto mt-10 p-6 bg-amber-900/50 text-white rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-amber-300">
              <Image
                src={previewUrl || "/image.png"}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                style={{
                  objectPosition: 'center center'
                }}
                priority
              />
            </div>
            <div className="flex gap-2">
              <label className="px-3 py-1 bg-amber-700/50 hover:bg-amber-700 text-amber-100 rounded-full text-sm cursor-pointer transition-colors">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {previewUrl !== "/user.png" && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1 bg-amber-900/50 hover:bg-amber-900 text-amber-100 rounded-full text-sm transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-amber-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded bg-amber-950 border border-amber-700 text-amber-100 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded text-white"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}