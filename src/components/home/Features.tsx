"use client";

export default function Features() {
  const features = [
    {
      title: "Vetted Partners",
      description: "We work exclusively with trusted shelters and rescues that meet our high standards of care.",
      icon: "🏆",
      color: "bg-amber-100"
    },
    {
      title: "Health Guarantee",
      description: "All pets receive comprehensive veterinary checks and come with health records.",
      icon: "❤️",
      color: "bg-orange-100"
    },
    {
      title: "Lifetime Support",
      description: "Our team provides ongoing advice and resources for the lifetime of your pet.",
      icon: "📞",
      color: "bg-amber-100"
    }
  ];

  return (
    <section className="py-20 px-4 bg-amber-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 mb-4">
          Why Choose PawAdopt?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
  We&apos;re committed to making perfect matches that last a lifetime
</p>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.color} p-8 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center`}
            >
              <span className="text-4xl mb-4">{feature.icon}</span>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}