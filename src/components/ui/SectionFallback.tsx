export default function SectionFallback() {
  return (
    <section className="bg-amber-50 px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-lg bg-white shadow-sm" />
        ))}
      </div>
    </section>
  );
}
