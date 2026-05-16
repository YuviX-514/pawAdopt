import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <section className="mx-auto max-w-5xl">
        <div className="grid overflow-hidden rounded-lg bg-white shadow-sm lg:grid-cols-[1fr_380px]">
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Contact</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">Need help with an adoption?</h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Reach out for support with listings, adoption requests, owner approvals, or account roles.
            </p>

            <div className="mt-8 space-y-4 text-gray-700">
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-600" />
                hello@petadopt.com
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-600" />
                +91 98765 43210
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-amber-600" />
                New Delhi, India
              </p>
            </div>
          </div>

          <div className="bg-amber-700 p-8 text-white">
            <h2 className="text-2xl font-bold">Fast paths</h2>
            <div className="mt-6 space-y-3">
              <Link className="block rounded bg-white/10 px-4 py-3 hover:bg-white/20" href="/pets">
                Browse available pets
              </Link>
              <Link className="block rounded bg-white/10 px-4 py-3 hover:bg-white/20" href="/settings">
                Change account role
              </Link>
              <Link className="block rounded bg-white/10 px-4 py-3 hover:bg-white/20" href="/adoption-requests">
                Review adoption requests
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
