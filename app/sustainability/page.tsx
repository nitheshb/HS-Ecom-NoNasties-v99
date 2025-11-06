export default function SustainabilityPage() {
  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">
          For the Planet
        </h1>

        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              We heal the planet through fashion
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At No Nasties, we believe fashion should heal the planet, not harm it.
              We're committed to creating 100% organic, fair trade, and carbon negative clothing
              that makes a positive impact on our world.
            </p>
          </section>

          {/* Impact Stats */}
          <section className="bg-green-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  100% Organic
                </p>
                <p className="text-gray-700">Cotton & Linen Fabrics</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  251,580
                </p>
                <p className="text-gray-700">Trees Planted Worldwide</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  -672,223 kg
                </p>
                <p className="text-gray-700">Carbon Negative CO2</p>
              </div>
            </div>
          </section>

          {/* Our Practices */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Practices</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Organic & Fair Trade</h3>
                <p className="text-gray-700">
                  All our cotton and linen are certified organic and sourced through fair trade practices,
                  ensuring farmers receive fair wages and working conditions.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Carbon Negative</h3>
                <p className="text-gray-700">
                  We're not just carbon neutral - we're carbon negative. Through reforestation and
                  sustainable practices, we remove more CO2 from the atmosphere than we produce.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Zero Waste</h3>
                <p className="text-gray-700">
                  We upcycle surplus fabric and use zero-waste manufacturing techniques to minimize
                  textile waste. Our packaging is also 100% plastic-free.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">All-Indian Supply Chain</h3>
                <p className="text-gray-700">
                  From seed to garment, our entire supply chain is based in India, supporting local
                  communities and reducing transportation emissions.
                </p>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Certifications</h2>
            <div className="grid md:grid-cols-2 gap-6 text-center">
              <div>
                <p className="font-semibold mb-2">Global Organic Textile Standard</p>
                <p className="text-sm text-gray-600">Certified organic cotton</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Fair Trade</p>
                <p className="text-sm text-gray-600">Supporting farmer welfare</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Carbon Negative</p>
                <p className="text-sm text-gray-600">Verified environmental impact</p>
              </div>
              <div>
                <p className="font-semibold mb-2">100% Vegan</p>
                <p className="text-sm text-gray-600">Cruelty-free materials</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
            <p className="text-gray-700 mb-6">
              Every purchase helps heal the planet. Shop consciously and make a difference.
            </p>
            <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition">
              Shop Now
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

