"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoadingState from "@/components/ui/LoadingState";
import type { ApiResult, AdoptionRequest, Pet } from "@/types/pet";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  message: "",
};

export default function AdoptPetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: session.user?.name || prev.name,
      email: session.user?.email || prev.email,
    }));
  }, [router, session, status]);

  useEffect(() => {
    let isMounted = true;

    async function loadPet() {
      try {
        const res = await fetch(`/api/pets/${params.id}`);
        const payload = (await res.json()) as ApiResult<Pet>;

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Unable to load pet");
        }

        if (payload.data.adopted) {
          toast.error("This pet has already been adopted.");
          router.push(`/pets/${params.id}`);
          return;
        }

        if (isMounted) setPetName(payload.data.name);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load pet");
        router.push("/pets");
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    if (params.id) loadPet();

    return () => {
      isMounted = false;
    };
  }, [params.id, router]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/pets/${params.id}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await res.json()) as ApiResult<{ request: AdoptionRequest; message: string }>;

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Adoption request failed");
      }

      toast.success(payload.data?.message || "Request sent to the owner for approval.");
      router.push("/my-pets");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Adoption request failed.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || pageLoading) {
    return <LoadingState label="Preparing adoption request..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="bg-amber-700 px-6 py-5">
          <h1 className="text-2xl font-bold text-white">Request Adoption</h1>
          <p className="mt-1 text-amber-100">
            Your request for {petName || "this pet"} will be sent to the owner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Full name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              pattern="^\d{10}$"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <Field label="Street address" name="address" value={form.address} onChange={handleChange} />

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="City" name="city" value={form.city} onChange={handleChange} />
            <Field label="State" name="state" value={form.state} onChange={handleChange} />
            <Field label="Postal code" name="postalCode" value={form.postalCode} onChange={handleChange} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Why do you want to adopt this pet?
            </label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-amber-500"
              placeholder="Tell the owner about your home, experience, and care plan."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
          >
            {loading ? "Sending request..." : "Send request"}
          </button>
        </form>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: keyof typeof initialForm;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  pattern?: string;
};

function Field({ label, name, value, onChange, type = "text", pattern }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        pattern={pattern}
        className="w-full rounded border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-amber-500"
      />
    </div>
  );
}
