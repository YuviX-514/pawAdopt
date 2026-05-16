"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, Pet } from "@/types/pet";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPets() {
      try {
        const res = await fetch("/api/pets?adopted=false");
        const payload = (await res.json()) as ApiResult<Pet[]>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Failed to fetch pets");
        }

        if (isMounted) setPets(payload.data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to fetch pets");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPets();

    return () => {
      isMounted = false;
    };
  }, []);

  const species = useMemo(
    () => Array.from(new Set(pets.map((pet) => pet.species).filter(Boolean))),
    [pets]
  );

  if (isLoading) {
    return <LoadingState label="Finding available pets..." />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-28">
        <EmptyState
          title="Error loading pets"
          description={error}
          action={
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Try again
            </button>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Find Your Perfect Companion
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Browse pets whose owners and rescuers are ready to review adoption requests.
            </p>
          </div>

          {species.length ? (
            <div className="flex flex-wrap gap-2">
              {species.slice(0, 5).map((item) => (
                <Link
                  key={item}
                  href={`/search?species=${encodeURIComponent(item)}`}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50"
                >
                  {item}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {pets.length === 0 ? (
          <EmptyState
            title="No pets available"
            description="Check back later or list a pet if you are a rescuer or owner."
            action={
              <Link
                href="/pets/upload"
                className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                List a pet
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {pet.photos?.[0] ? (
                    <Image
                      src={pet.photos[0]}
                      alt={pet.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No photo
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-700">
                        {pet.name}
                      </h2>
                      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                        {pet.species}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Available
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    {pet.breed ? <p>Breed: {pet.breed}</p> : null}
                    {pet.age !== undefined ? <p>Age: {pet.age} years</p> : null}
                    {pet.gender ? <p className="capitalize">Gender: {pet.gender}</p> : null}
                  </div>

                  {pet.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">{pet.description}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
