'use client';

import { useCart } from '@/lib/cart-context';

// Pre-generated prices to avoid Math.random() during render
const products = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  name: `Product Name ${i + 1}`,
  price: 1000 + (i * 187), // Deterministic pricing
}));

export default function HerPage() {
  const { addItem, setIsCartOpen } = useCart();

  const handleAddToCart = (productName: string, price: number, index: number) => {
    addItem({
      id: `her-${index}`,
      name: productName,
      price: price,
      size: 'M',
      quantity: 1,
      image: '',
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Shop For Her</h1>
        <p className="text-center text-gray-600 mb-12">
          Organic cotton dresses, shirts, tops, skirts for women
        </p>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <button className="px-4 py-2 border border-black rounded">All</button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              New Arrivals
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Organic Linen
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Dresses & Jumpsuits
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Shirts
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Tops & Tees
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Sale
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white group cursor-pointer">
              <div className="aspect-square bg-gray-200 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-300 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </div>
              <div className="p-2">
                <p className="font-semibold mb-1">{product.name}</p>
                <p className="text-gray-600 text-sm mb-2">Organic Cotton</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">₹ {product.price}</p>
                  <button
                    onClick={() => handleAddToCart(product.name, product.price, product.id)}
                    className="px-4 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

