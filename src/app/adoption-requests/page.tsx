"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { canReviewAdoptions, normalizeRole } from "@/lib/roles";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import type { AdoptionRequest, ApiResult } from "@/types/pet";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdoptionRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const role = normalizeRole(session?.user?.role);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    if (!canReviewAdoptions(role)) {
      toast.error("Only owner accounts can review adoption requests.");
      router.push("/settings");
      return;
    }

    let isMounted = true;

    async function fetchRequests() {
      try {
        const res = await fetch("/api/adoption-requests?scope=owner");
        const payload = (await res.json()) as ApiResult<AdoptionRequest[]>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Unable to load adoption requests.");
        }

        if (isMounted) setRequests(payload.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load adoption requests.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [role, router, session, status]);

  async function reviewRequest(id: string, action: "approve" | "reject") {
    setReviewingId(id);

    try {
      const res = await fetch(`/api/adoption-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await res.json()) as ApiResult<{ request: AdoptionRequest; message: string }>;

      if (!res.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || "Unable to review request.");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === id ? payload.data?.request || request : request
        )
      );
      toast.success(payload.data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to review request.");
    } finally {
      setReviewingId(null);
    }
  }

  if (loading || status === "loading") {
    return <LoadingState label="Loading adoption requests..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Adoption Requests</h1>
          <p className="mt-2 text-gray-600">
            Review adopters, approve the right fit, and automatically close the remaining pending requests.
          </p>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Requests for your pet listings will appear here."
          />
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const pet = request.pet;
              const isPending = request.status === "pending";

              return (
                <article key={request.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                    <div className="relative h-56 bg-gray-100 md:h-full">
                      {pet?.photos?.[0] ? (
                        <Image
                          src={pet.photos[0]}
                          alt={pet.name}
                          fill
                          className="object-cover"
                          sizes="260px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{pet?.name || "Pet request"}</h2>
                          <p className="text-sm text-gray-600">
                            Requested by {request.requester?.username || request.contact.name}
                          </p>
                        </div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                        <p>Email: {request.contact.email}</p>
                        <p>Phone: {request.contact.phone}</p>
                        <p>City: {request.contact.city}</p>
                        <p>State: {request.contact.state}</p>
                      </div>

                      {request.message ? (
                        <p className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-700">{request.message}</p>
                      ) : null}

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => reviewRequest(request.id, "approve")}
                          disabled={!isPending || reviewingId === request.id}
                          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewRequest(request.id, "reject")}
                          disabled={!isPending || reviewingId === request.id}
                          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Reject
                        </button>
                        {pet?.id ? (
                          <button
                            onClick={() => router.push(`/pets/${pet.id}`)}
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View pet
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
