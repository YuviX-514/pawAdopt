import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">About PawAdopt</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">A calmer way to match pets with homes.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            PawAdopt helps owners and rescuers list pets with clear photos, then gives adopters a simple request flow.
            Owners review each request before a pet is marked adopted, so every match has a real approval step.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Real listings", "Pet uploads require real image files and pass server-side validation."],
              ["Owner approval", "Adoption requests stay pending until the listing owner approves them."],
              ["Role aware", "Adopters browse and request, owners list and review, admins can oversee the flow."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
              </div>
            ))}
          </div>

          <Link
            href="/pets"
            className="mt-10 inline-flex rounded bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Browse pets
          </Link>
        </div>
      </section>
    </main>
  );
}
