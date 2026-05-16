"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import type { AdoptionRequest, ApiResult } from "@/types/pet";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function MyPetsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      toast.error("Please log in to view your adoption requests.");
      router.push("/auth/login");
      return;
    }

    let isMounted = true;

    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await fetch("/api/adoption-requests?scope=mine");
        const payload = (await res.json()) as ApiResult<AdoptionRequest[]>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Failed to fetch adoption requests.");
        }

        if (isMounted) setRequests(payload.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [router, session, status]);

  if (loading || status === "loading") {
    return <LoadingState label="Loading your adoption requests..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Adoption Requests</h1>
          <p className="mt-2 text-gray-600">
            Track requests you have sent and see which pets have been approved.
          </p>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No adoption requests yet"
            description="When you request to adopt a pet, it will appear here while the owner reviews it."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {requests.map((request) => {
              const pet = request.pet;

              return (
                <button
                  key={request.id}
                  onClick={() => pet?.id && router.push(`/pets/${pet.id}`)}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-56 bg-gray-100">
                    {pet?.photos?.[0] ? (
                      <Image
                        src={pet.photos[0]}
                        alt={pet.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{pet?.name || "Pet"}</h2>
                        <p className="text-sm text-gray-600">{pet?.species}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    {request.owner ? (
                      <p className="mt-3 text-sm text-gray-500">Owner: {request.owner.username}</p>
                    ) : null}
                    {request.message ? (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">{request.message}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
