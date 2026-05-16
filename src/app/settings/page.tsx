"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingState from "@/components/ui/LoadingState";
import type { UserRole } from "@/lib/roles";

type ProfilePayload = {
  user: {
    username: string;
    email: string;
    role: UserRole;
    listingRejectedCount?: number;
    listingBanned?: boolean;
    listingBanReason?: string;
    roleRequest?: {
      requestedRole?: UserRole;
      message?: string;
      status?: "none" | "pending" | "approved" | "rejected";
    };
  };
};

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfilePayload["user"] | null>(null);
  const [requestedRole, setRequestedRole] = useState<UserRole>("owner");
  const [message, setMessage] = useState("");
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

      const data = (await res.json()) as ProfilePayload;
      setProfile(data.user);
      setRequestedRole(data.user.role === "owner" ? "adopter" : "owner");
    }

    loadProfile();
  }, [status]);

  async function requestRoleChange(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/account/role-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedRole, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to send request.");
      }

      toast.success(data.data?.message || "Role change request sent.");
      setMessage("");
      const refreshed = await fetch("/api/profile");
      if (refreshed.ok) setProfile(((await refreshed.json()) as ProfilePayload).user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send request.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || !profile) {
    return <LoadingState label="Loading settings..." />;
  }

  const appealText = `Hello PawAdopt Admin,\n\nPlease review my account restriction. My account email is ${profile.email}.\n\nI understand listings must be accurate and safe. I would like to appeal because:\n\n`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Account settings</h1>
          <p className="mt-2 text-gray-600">
            Account roles are reviewed by admins so listings and adoption workflows stay trustworthy.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Info label="Email" value={profile.email} />
            <Info label="Current role" value={profile.role} />
            <Info label="Rejected listings" value={`${profile.listingRejectedCount || 0} / 5`} />
          </div>
        </section>

        {profile.listingBanned ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-900">Listing access restricted</h2>
            <p className="mt-2 text-sm text-red-800">
              {profile.listingBanReason || "Your account cannot submit new pet listings right now."}
            </p>
            <Link
              href={`mailto:hello@petadopt.com?subject=PawAdopt listing ban appeal&body=${encodeURIComponent(appealText)}`}
              className="mt-4 inline-block rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Draft appeal email
            </Link>
          </section>
        ) : null}

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Request a role change</h2>
          {profile.roleRequest?.status === "pending" ? (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your request for {profile.roleRequest.requestedRole} access is waiting for admin review.
            </p>
          ) : (
            <form onSubmit={requestRoleChange} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Requested role</label>
                <select
                  value={requestedRole}
                  onChange={(event) => setRequestedRole(event.target.value as UserRole)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="owner">Pet owner / rescuer</option>
                  <option value="adopter">Adopter</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Tell admins why this role fits your account."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
              >
                {loading ? "Sending..." : "Send request"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 font-bold capitalize text-gray-900">{value}</p>
    </div>
  );
}
