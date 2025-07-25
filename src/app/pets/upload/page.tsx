"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function UploadPetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    description: "",
    photos: [] as File[],
  });
  const MAX_FILES = 5;
const MAX_MB = 5;
const [photoWarning, setPhotoWarning] = useState("");

  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Cleanup previews to avoid memory leaks
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  // Auth guard logic
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === "authenticated" && !session) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArr = Array.from(files);
  
  // Validate count
  if (fileArr.length > MAX_FILES) {
    toast.error(`Max ${MAX_FILES} photos allowed`);
    setPhotoWarning(`⚠️ Only ${MAX_FILES} photos allowed`);
    return;
  }

  // Validate size
  for (const file of fileArr) {
    if (file.size / (1024 * 1024) > MAX_MB) {
      toast.error(`"${file.name}" is too big. Max ${MAX_MB}MB allowed.`);
      return;
    }
  }

  setPhotoWarning("");
  setForm((prev) => ({ ...prev, photos: fileArr }));
  const previews = fileArr.map((f) => URL.createObjectURL(f));
  setPreview(previews);
};


  const handleAddMorePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArr = Array.from(files);
  const totalPhotos = form.photos.length + fileArr.length;

  if (totalPhotos > MAX_FILES) {
    toast.error(`You can only upload ${MAX_FILES} photos total`);
    setPhotoWarning(`⚠️ Max ${MAX_FILES} photos allowed`);
    return;
  }

  for (const file of fileArr) {
    if (file.size / (1024 * 1024) > MAX_MB) {
      toast.error(`"${file.name}" is too big. Max ${MAX_MB}MB allowed.`);
      return;
    }
  }

  setPhotoWarning("");
  setForm((prev) => ({
    ...prev,
    photos: [...prev.photos, ...fileArr],
  }));
  const previews = fileArr.map((f) => URL.createObjectURL(f));
  setPreview((prev) => [...prev, ...previews]);
};


  const handleRemovePhoto = (index: number) => {
    setForm((prev) => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
    setPreview((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.species || form.photos.length === 0) {
      toast.error("Name, species & at least one photo are required");
      return;
    }

    setLoading(true);

    const body = new FormData();
    Object.entries(form).forEach(([key, val]) => {
  if (key === "photos" && Array.isArray(val)) {
    val.forEach((file) => body.append("photos", file));
  } else if (key === "age" && val === "") {
    // skip empty age
  } else if (val !== null && (typeof val === "string" || val instanceof Blob)) {
    body.append(key, val);
  }
});


    try {
      const res = await fetch("/api/pets/upload", {
        method: "POST",
        body,
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Pet uploaded successfully!");
      router.push("/pets");
    } catch  {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-25 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Add a New Pet
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Help us find a loving home for this pet
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Photos *
              </label>
              <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                <div className="space-y-3 text-center w-full">
                  {photoWarning && (
  <p className="text-sm text-red-600 font-medium mb-2">{photoWarning}</p>
)}
                  {preview.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {preview.map((src, index) => (
                        <div key={index} className="relative">
                          <Image
  src={src}
  alt={`Preview ${index}`}
  width={500}
  height={500}
  className="mx-auto h-48 w-full object-cover rounded-lg"
  unoptimized
/>

                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
  {preview.length === 0 ? (
    // Show only "Add Photo" when no images
    <label
      htmlFor="file-upload"
      className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded"
    >
      Add Photo
      <input
        id="file-upload"
        name="photos"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChangePhotos}
        disabled={loading}
        className="sr-only"
      />
    </label>
  ) : (
    <>
      {/* Show Change + Add More when already photos exist */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded"
      >
        Change Photos
        <input
          id="file-upload"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChangePhotos}
          disabled={loading}
          className="sr-only"
        />
      </label>
      <label
        htmlFor="add-more-upload"
        className="cursor-pointer border border-amber-600 text-amber-600 hover:bg-amber-50 font-medium py-2 px-4 rounded"
      >
        Add More Photos
        <input
          id="add-more-upload"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddMorePhotos}
          disabled={loading}
          className="sr-only"
        />
      </label>
    </>
  )}
</div>


                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG up to 5MB each
                  </p>
                </div>
              </div>
            </div>

            {/* Other Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pet Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="species"
                  className="block text-sm font-medium text-gray-700"
                >
                  Species *
                </label>
                <input
                  id="species"
                  name="species"
                  type="text"
                  required
                  value={form.species}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="breed"
                  className="block text-sm font-medium text-gray-700"
                >
                  Breed
                </label>
                <input
                  id="breed"
                  name="breed"
                  type="text"
                  value={form.breed}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age (years)
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.age}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Tell us about the pet's personality, habits, special needs, etc."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Submit Pet Listing"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}