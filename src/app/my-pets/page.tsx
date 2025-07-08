"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Pet = {
  _id: string;
  name: string;
  species: string;
  photos: string[];
};

export default function MyPetsPage() {
  const [email, setEmail] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pets/adopted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to fetch adopted pets.");

      const data = await res.json();
      setPets(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-25 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          My Adopted Pets
        </h1>

        <div className="mb-8 flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-md py-2 px-3"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            {loading ? "Searching..." : "Find My Pets"}
          </button>
        </div>

        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-lg shadow p-4 text-center"
              >
                <img
                  src={pet.photos?.[0] || "/no-photo.jpg"}
                  alt={pet.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h2 className="text-xl font-bold text-gray-800">{pet.name}</h2>
                <p className="text-gray-600">{pet.species}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {loading ? "" : "No adopted pets found."}
          </p>
        )}
      </div>
    </main>
  );
}
