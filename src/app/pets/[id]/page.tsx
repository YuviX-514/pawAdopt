"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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
  adoptedBy?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    message: string;
  };
  createdBy?: {
    name: string;
    email: string;
    imageUrl?: string;
  };
};

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchPet() {
      try {
        const res = await fetch(`/api/pets/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch pet details");

        const resData = await res.json();
        if (!resData.success) {
          throw new Error(resData.message || "Failed to fetch pet details");
        }

        const pet: Pet = resData.data;
        setPet(pet);
      } catch (err) {
        console.error("Fetch error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPet();
    } else {
      setError("Pet ID is missing in the URL.");
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-25 flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Oops! Error Loading Pet
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/pets")}
            className="px-5 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded transition duration-300"
          >
            Back to Pets
          </button>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex py-25 items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Pet Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The pet you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => router.push("/pets")}
            className="px-5 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded transition duration-300"
          >
            Browse Available Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT IMAGE GALLERY */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {pet.photos?.length ? (
                <>
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={pet.photos[activeImage] || "/default-pet.jpg"}
                      alt={`${pet.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-pet.jpg";
                      }}
                    />
                    <div className="absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded-full text-sm font-semibold shadow backdrop-blur">
                      {pet.adopted ? (
                        <span className="text-green-600">✓ Adopted</span>
                      ) : (
                        <span className="text-amber-600">Available</span>
                      )}
                    </div>
                  </div>
                  {pet.photos.length > 1 && (
                    <div className="p-4 flex gap-3 overflow-x-auto">
                      {pet.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                            activeImage === index
                              ? "border-amber-500"
                              : "border-transparent hover:border-amber-300"
                          } transition`}
                        >
                          <img
                            src={photo}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/default-pet.jpg";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <svg
                    className="w-1/3 h-1/3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium">No photos available</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="bg-white rounded-xl shadow p-6 flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {pet.name || "Unnamed Pet"}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  {pet.species || "Unknown species"}
                </span>
                {pet.breed && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {pet.breed}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    Age
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {pet.age !== undefined ? `${pet.age} years` : "Unknown"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    Gender
                  </p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {pet.gender || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  About {pet.name || "this pet"}
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {pet.description || "No description available."}
                </p>
              </div>

              {pet.createdBy && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Listed By
                  </h3>
                  <div className="flex items-center gap-3">
                    {pet.createdBy.imageUrl ? (
                      <img
                        src={pet.createdBy.imageUrl}
                        alt={pet.createdBy.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-bold">
                        {pet.createdBy?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-gray-900 text-sm font-medium">
                        {pet.createdBy?.name || "Unknown"}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {pet.createdBy?.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Adopted Details or Buttons */}
              <div className="mt-6">
  {pet.adopted && pet.adoptedBy ? (
    <div className="bg-green-50 border border-green-200 rounded p-4 text-sm text-gray-700 mb-4">
      <h4 className="text-green-700 font-semibold mb-3">
        🎉 This pet has been adopted!
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(pet.adoptedBy).map(([key, value]) =>
          value ? (
            <p key={key}>
              <span className="font-semibold capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>: {value}
            </p>
          ) : null
        )}
      </div>
    </div>
  ) : null}

  <div className="flex flex-col md:flex-row gap-3">
    {!pet.adopted && (
      <button
        onClick={() => router.push(`/pets/${params.id}/adopt`)}
        className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition"
      >
        🐾 Adopt Me
      </button>
    )}

    <button
      onClick={() => router.push("/pets")}
      className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition"
    >
      ← Back to Pets
    </button>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
