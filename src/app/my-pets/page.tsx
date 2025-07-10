"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

type Pet = {
  _id: string;
  name: string;
  species: string;
  photos: string[];
};

export default function MyPetsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      toast.error("Please log in to view your adopted pets.");
      return;
    }

    const fetchPets = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pets/adopted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user!.email }),
        });

        if (!res.ok) throw new Error("Failed to fetch adopted pets.");

        const data: Pet[] = await res.json();
        setPets(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [session, status]);

  const handlePetClick = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-25 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          My Adopted Pets
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading your pets...</p>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePetClick(pet._id)}
              >
                <div className="relative w-full h-48 mb-3">
                  <Image
                    src={pet.photos?.[0] || "/no-photo.jpg"}
                    alt={pet.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {pet.name}
                </h2>
                <p className="text-gray-600">{pet.species}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No adopted pets found.
          </p>
        )}
      </div>
    </main>
  );
}
