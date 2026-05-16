"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingState from "@/components/ui/LoadingState";
import type { UserRole } from "@/lib/roles";

export default function SettingsPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("adopter");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [router, status]);

  useEffect(() => {
    async function loadProfile() {
      if (status !== "authenticated") return;

      const res = await fetch("/api/profile");
      if (!res.ok) return;

      const data = await res.json();
      setUsername(data.user.username || "");
      setRole(data.user.role || "adopter");
    }

    loadProfile();
  }, [status]);

  async function saveRole(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("role", role);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to update settings.");
      }

      await update();
      toast.success("Settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update settings.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <LoadingState label="Loading settings..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Choose how you want to use PawAdopt. Owner accounts can list pets and approve adoption requests.
        </p>

        <form onSubmit={saveRole} className="mt-8 space-y-5">
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
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
            >
              {loading ? "Saving..." : "Save settings"}
            </button>
            <Link
              href={role === "owner" ? "/pets/upload" : "/pets"}
              className="rounded border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {role === "owner" ? "List a pet" : "Browse pets"}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
