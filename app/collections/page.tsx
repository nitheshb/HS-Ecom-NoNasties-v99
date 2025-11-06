export default function CollectionsPage() {
  const collections = [
    { name: 'Comfort: A Diwali Story', description: 'Celebrate comfort and style' },
    { name: 'Linen Life', description: 'Premium organic linen collection' },
    { name: 'Bloom Baby Bloom', description: 'Fresh and vibrant designs' },
    { name: 'Mixology - Open Bar', description: 'Mix and match essentials' },
    { name: 'Polka Dot Party', description: 'Classic polka dot patterns' },
    { name: 'Azulejo - Soul of Goa', description: 'Portuguese-inspired designs' },
    { name: 'Sleep - Sweet Dreams', description: 'Comfortable sleepwear' },
    { name: 'Joy of Jersey', description: 'Soft jersey fabrics' },
    { name: 'Conscious Co-Ords', description: 'Sustainable coordinates' },
  ];

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-center">Collections</h1>
        <p className="text-center text-gray-600 mb-12">
          Explore our curated collections
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{collection.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
                <button className="w-full border-2 border-black py-2 rounded hover:bg-black hover:text-white transition">
                  Explore Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

