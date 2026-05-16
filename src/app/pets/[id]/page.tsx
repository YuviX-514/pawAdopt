"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Mail } from "lucide-react";
import Image from "next/image";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, Pet } from "@/types/pet";

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    let isMounted = true;

    async function fetchPet() {
      try {
        const res = await fetch(`/api/pets/${params.id}`);
        const payload = (await res.json()) as ApiResult<Pet>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Failed to fetch pet details");
        }

        if (isMounted) setPet(payload.data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch pet details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (params.id) {
      fetchPet();
    }

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const isOwnListing = useMemo(
    () => Boolean(session?.user?.email && pet?.createdBy?.email === session.user.email),
    [pet?.createdBy?.email, session?.user?.email]
  );

  function handleAdoptClick() {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    router.push(`/pets/${params.id}/adopt`);
  }

  if (loading) {
    return <LoadingState label="Loading pet details..." />;
  }

  if (error || !pet) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">Unable to load pet</h1>
          <p className="mt-3 text-gray-600">{error || "Pet not found."}</p>
          <button
            onClick={() => router.push("/pets")}
            className="mt-6 rounded bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Back to pets
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="relative aspect-square bg-gray-100">
                {pet.photos?.length ? (
                  <Image
                    src={pet.photos[activeImage]}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No photo available
                  </div>
                )}

                <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow">
                  {pet.adopted ? "Adopted" : "Available"}
                </span>
              </div>

              {pet.photos && pet.photos.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {pet.photos.map((photo, index) => (
                    <button
                      key={photo}
                      onClick={() => setActiveImage(index)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded border-2 ${
                        activeImage === index ? "border-amber-500" : "border-transparent"
                      }`}
                      aria-label={`Show photo ${index + 1}`}
                    >
                      <Image src={photo} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {pet.species}
                  </span>
                  {pet.breed ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {pet.breed}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Age</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {pet.age !== undefined ? `${pet.age} years` : "Unknown"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Gender</p>
                <p className="mt-1 text-lg font-bold capitalize text-gray-900">
                  {pet.gender || "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About {pet.name}</h2>
              <p className="mt-2 leading-relaxed text-gray-700">
                {pet.description || "No description was added for this pet."}
              </p>
            </div>

            {pet.createdBy ? (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Listed by
                </h3>
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-amber-400">
                    <Image
                      src={pet.createdBy.image || "/user.png"}
                      alt={pet.createdBy.username || "Pet owner"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{pet.createdBy.username}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3.5 w-3.5" />
                      {pet.createdBy.email}
                    </p>
                    {pet.createdAt ? (
                      <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        Listed {formatDistanceToNow(new Date(pet.createdAt), { addSuffix: true })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              {pet.adopted ? (
                <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  This pet has already been adopted.
                </div>
              ) : isOwnListing ? (
                <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  This is your listing. Adoption requests will appear in your request inbox.
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleAdoptClick}
                    className="flex-1 rounded bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Request Adoption
                  </button>
                  <button
                    onClick={() => router.push("/pets")}
                    className="flex-1 rounded border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Back to pets
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
