"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, Pet } from "@/types/pet";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const species = searchParams.get("species") || "";
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (query) return `Search results for "${query}"`;
    if (species) return `${species} pets`;
    return "Search pets";
  }, [query, species]);

  useEffect(() => {
    let isMounted = true;

    async function searchPets() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ adopted: "false" });
        if (query) params.set("q", query);
        if (species) params.set("species", species);

        const res = await fetch(`/api/pets?${params.toString()}`);
        const payload = (await res.json()) as ApiResult<Pet[]>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Search failed.");
        }

        if (isMounted) setPets(payload.data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    searchPets();

    return () => {
      isMounted = false;
    };
  }, [query, species]);

  if (loading) return <LoadingState label="Searching pets..." />;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">Showing available pets that match your search.</p>

        {error ? (
          <EmptyState title="Search failed" description={error} />
        ) : pets.length === 0 ? (
          <EmptyState
            title="No matching pets"
            description="Try a different name, species, or breed."
          />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-56 bg-gray-100">
                  {pet.photos?.[0] ? (
                    <Image
                      src={pet.photos[0]}
                      alt={pet.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">{pet.name}</h2>
                  <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                    {pet.species}
                  </p>
                  {pet.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">{pet.description}</p>
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
