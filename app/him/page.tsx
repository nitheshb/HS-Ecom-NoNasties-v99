'use client';

import { useCart } from '@/lib/cart-context';
import { useEffect, useState } from 'react';
import { 
  getHimProducts, 
  getProductName, 
  getProductDescription, 
  getProductImage,
  type Product 
} from '@/lib/products';

export default function HimPage() {
  const { addItem, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await getHimProducts(100);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check your Firebase connection.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const productName = getProductName(product);
    const productPrice = product.price || product.strike_price || 0;
    const productImage = getProductImage(product);
    
    addItem({
      id: product.id,
      name: productName,
      price: productPrice,
      size: 'M',
      quantity: 1,
      image: productImage,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Shop For Him</h1>
        <p className="text-center text-gray-600 mb-12">
          Organic cotton shirts, tees, pants for men
        </p>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4 flex-wrap">
            <button className="px-4 py-2 border border-black rounded">All</button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              New Arrivals
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Organic Linen
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Shirts
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Tees & Polos
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Knitted Tees
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Pants & Shorts
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:border-black">
              Sale
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please check your Firebase configuration in the .env file
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">No products found in Firebase.</p>
                <p className="text-sm text-gray-500">
                  Make sure you have products in the T_products collection with active: true
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const productName = getProductName(product);
                  const productDescription = getProductDescription(product);
                  const productPrice = product.price || product.strike_price || 0;
                  const productImage = getProductImage(product);
                  
                  // Get category - avoid showing UUIDs or IDs
                  let category = 'Organic Cotton';
                  if (product.category && typeof product.category === 'string') {
                    // Check if it's not a UUID (UUIDs have dashes and are long)
                    if (!product.category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                      category = product.category;
                    }
                  }
                  // Don't use category_id if it looks like a UUID
                  const categoryId = product.category_id;
                  if (categoryId && typeof categoryId === 'string' && category === 'Organic Cotton') {
                    // If category_id is not a UUID and we don't have a category name, we could fetch it
                    // But for now, just don't show UUIDs
                    if (!categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                      // Only use if it's not a UUID
                      category = categoryId;
                    }
                  }
                  
                  // Debug: Log image URL
                  if (product.id === products[0]?.id) {
                    console.log('First HIM product image:', {
                      productId: product.id,
                      img: product.img,
                      images: product.images,
                      finalImage: productImage,
                      allFields: Object.keys(product).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('img'))
                    });
                  }
                  
                  return (
                    <div key={product.id} data-product-id={product.id} className="bg-white group cursor-pointer">
                      <div className="aspect-square bg-gray-200 mb-4 relative overflow-hidden">
                        {productImage ? (
                          // Use regular img tag for S3 images to avoid Next.js Image optimization issues
                          <img
                            src={productImage}
                            alt={productName}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('Image failed to load:', productImage);
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.parentElement?.querySelector('.no-image-placeholder') as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Placeholder for when image doesn't exist or fails to load */}
                        <div className="no-image-placeholder absolute inset-0 bg-gray-300 flex items-center justify-center" style={{ display: productImage ? 'none' : 'flex' }}>
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="font-semibold mb-1 line-clamp-2">{productName}</p>
                        <p className="text-gray-600 text-sm mb-2">{category}</p>
                        {productDescription && productDescription !== 'Organic Cotton' && (
                          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{productDescription}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.strike_price && product.strike_price > (product.price || 0) && (
                              <p className="text-sm text-gray-400 line-through">₹ {product.strike_price}</p>
                            )}
                            <p className="text-lg font-bold">₹ {productPrice}</p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition whitespace-nowrap"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

