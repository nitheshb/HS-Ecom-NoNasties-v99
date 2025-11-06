export default function SustainabilityBanner() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto pl-0">
        {/* Main Heading */}
        <div className="mb-2">
          <h2 className="text-3xl md:text-4xl font-bold whitespace-nowrap">
            fashion harms the planet. not us.{' '}
            <span className="relative inline-block bg-[#28e605] px-3 py-1 transform -rotate-4">
              we heal it.
            </span>
          </h2>
        </div>

        {/* Secondary Text */}
        <p className="text-base font-semibold uppercase text-[15px]">
          <span className="underline">WE</span> ARE ORGANIC, FAIR TRADE & CARBON NEGATIVE.
        </p>
      </div>
    </section>
  );
}
