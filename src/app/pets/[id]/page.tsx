"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  description?: string;
  photos?: string[];
  adopted: boolean;
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPets() {
      try {
        const res = await fetch("/api/pets");
        if (!res.ok) throw new Error("Failed to fetch pets");
        const data: Pet[] = await res.json();
        setPets(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPets();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center py-25 justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading pets</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-25 bg-gray-50 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Find Your Perfect Companion
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse our adorable pets waiting for their forever homes
        </p>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">🐾</div>
          <h3 className="text-2xl font-medium text-gray-900 mb-2">No pets available</h3>
          <p className="text-gray-500">Check back later for new arrivals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-w-4 aspect-h-3 relative overflow-hidden">
                {pet.photos?.[0] ? (
                  <Image
                    src={pet.photos[0]}
                    alt={pet.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase font-medium tracking-wide">
                      {pet.species}
                    </p>
                  </div>
                  {pet.adopted ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Adopted
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Available
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {pet.breed && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Breed:</span> {pet.breed}
                    </p>
                  )}
                  {pet.age && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {pet.age} years
                    </p>
                  )}
                  {pet.gender && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Gender:</span> {pet.gender}
                    </p>
                  )}
                </div>

                {pet.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {pet.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
