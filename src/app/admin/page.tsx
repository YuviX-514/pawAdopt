"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, Pet } from "@/types/pet";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  listingRejectedCount?: number;
  listingBanned?: boolean;
  listingBanReason?: string;
  roleRequest?: {
    requestedRole?: string;
    message?: string;
    status?: string;
  };
};

export default function AdminPage() {
  const [listings, setListings] = useState<Pet[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  async function loadAdminData() {
    setLoading(true);
    try {
      const [listingRes, userRes] = await Promise.all([
        fetch("/api/admin/listings"),
        fetch("/api/admin/users"),
      ]);
      const listingPayload = (await listingRes.json()) as ApiResult<Pet[]>;
      const userPayload = (await userRes.json()) as ApiResult<AdminUser[]>;

      if (!listingRes.ok || !listingPayload.success) {
        throw new Error(listingPayload.message || "Failed to load listings.");
      }

      if (!userRes.ok || !userPayload.success) {
        throw new Error(userPayload.message || "Failed to load users.");
      }

      setListings(listingPayload.data || []);
      setUsers(userPayload.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin dashboard failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function reviewListing(id: string, action: "approve" | "reject") {
    const reason = reasonById[id]?.trim();

    if (action === "reject" && !reason) {
      toast.error("Add a short rejection reason.");
      return;
    }

    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const payload = (await res.json()) as ApiResult<{ message: string }>;

    if (!res.ok || !payload.success) {
      toast.error(payload.message || "Unable to review listing.");
      return;
    }

    toast.success(payload.data?.message || "Listing reviewed.");
    await loadAdminData();
  }

  async function updateUser(id: string, action: "unban" | "approve-role" | "reject-role") {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = (await res.json()) as ApiResult<{ message: string }>;

    if (!res.ok || !payload.success) {
      toast.error(payload.message || "Unable to update user.");
      return;
    }

    toast.success(payload.data?.message || "User updated.");
    await loadAdminData();
  }

  if (loading) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Admin</p>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900">Listing review desk</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Review pet listings before they become public. Five rejected listings automatically restrict an account from submitting more.
          </p>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Pending listings</h2>
          {listings.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No listings waiting" description="New submissions will appear here for approval." />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {listings.map((pet) => (
                <article key={pet.id} className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="grid sm:grid-cols-[180px_1fr]">
                    <div className="relative aspect-[4/3] bg-gray-100 sm:aspect-auto">
                      {pet.photos?.[0] ? (
                        <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover" sizes="180px" />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                          <p className="text-sm font-semibold uppercase text-amber-700">{pet.species}</p>
                        </div>
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{pet.description || "No description provided."}</p>
                      <p className="mt-3 text-xs text-gray-500">
                        Owner: {pet.createdBy?.username} ({pet.createdBy?.email})
                      </p>
                      <textarea
                        value={reasonById[pet.id] || ""}
                        onChange={(event) =>
                          setReasonById((prev) => ({ ...prev, [pet.id]: event.target.value }))
                        }
                        className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                        rows={2}
                        placeholder="Reason required when rejecting"
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => reviewListing(pet.id, "approve")}
                          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewListing(pet.id, "reject")}
                          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Account controls</h2>
          {users.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No banned users or pending role requests.</p>
          ) : (
            <div className="mt-6 divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Role: {user.role} · Rejections: {user.listingRejectedCount || 0}
                    </p>
                    {user.listingBanned ? (
                      <p className="mt-1 text-sm text-red-700">{user.listingBanReason}</p>
                    ) : null}
                    {user.roleRequest?.status === "pending" ? (
                      <p className="mt-1 text-sm text-amber-700">
                        Wants {user.roleRequest.requestedRole}: {user.roleRequest.message || "No message"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.listingBanned ? (
                      <button
                        onClick={() => updateUser(user.id, "unban")}
                        className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                      >
                        Remove listing ban
                      </button>
                    ) : null}
                    {user.roleRequest?.status === "pending" ? (
                      <>
                        <button
                          onClick={() => updateUser(user.id, "approve-role")}
                          className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Approve role
                        </button>
                        <button
                          onClick={() => updateUser(user.id, "reject-role")}
                          className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Reject role
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
