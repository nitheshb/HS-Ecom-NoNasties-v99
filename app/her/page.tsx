'use client';
/* eslint-disable @next/next/no-img-element */

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { 
  getHerProducts, 
  getProductName, 
  getProductDescription,
  getProductImage,
  type Product 
} from '@/lib/products';
import { getFilteredProducts } from '@/lib/product-filters';
import { Filter, LayoutGrid, Grid3X3 } from 'lucide-react';

const HER_HERO_TITLES = ['ForHerHero-img1', 'ForHerHero-img2', 'ForHerHero-img3', 'ForHerHero-img4'] as const;
const HERO_TITLE_SET = new Set(HER_HERO_TITLES.map((title) => title.toLowerCase()));

const getCandidateTitles = (product: Product): string[] => {
  const titles: string[] = [];
  const push = (value?: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      titles.push(value.trim());
    }
  };

  if (typeof product.title === 'string') {
    push(product.title);
  } else if (product.title && typeof product.title === 'object') {
    Object.values(product.title).forEach(push);
  }

  push(product.name);
  if (product.translation?.title) push(product.translation.title);
  if (product.translations?.length) {
    product.translations.forEach((translation) => push(translation?.title));
  }

  return titles;
};

const matchesHeroTitle = (product: Product): string | null => {
  for (const title of getCandidateTitles(product)) {
    const normalized = title.toLowerCase();
    if (HERO_TITLE_SET.has(normalized)) {
      return (
        HER_HERO_TITLES.find(
          (heroTitle) => heroTitle.toLowerCase() === normalized
        ) || null
      );
    }
  }
  return null;
};

const matchesSubHeroTitle = (product: Product): string | null => {
  for (const title of getCandidateTitles(product)) {
    const normalized = title.toLowerCase();
    // Match any title that starts with "subhero" (case-insensitive)
    if (normalized.startsWith('subhero')) {
      return title; // Return the original title to preserve case
    }
  }
  return null;
};

// Extract number from subHero title for sorting (e.g., "subHero1" -> 1, "subHero10" -> 10)
const extractSubHeroNumber = (title: string): number => {
  const match = title.match(/\d+$/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function HerPage() {
  const searchParams = useSearchParams();
  const filterValue = searchParams.get('filter') || 'all';
  
  const { addItem, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroProductMap, setHeroProductMap] = useState<Record<string, Product>>({});
  const [subHeroProductMap, setSubHeroProductMap] = useState<Record<string, Product>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products for HER section (for hero images)
        const allHerProducts = await getHerProducts(100);
        const heroMap: Record<string, Product> = {};
        const subHeroMap: Record<string, Product> = {};
        
        // Separate hero images from regular products
        for (const product of allHerProducts) {
          const matchedHeroTitle = matchesHeroTitle(product);
          const matchedSubHeroTitle = matchesSubHeroTitle(product);
          
          if (matchedHeroTitle) {
            heroMap[matchedHeroTitle] = product;
          } else if (matchedSubHeroTitle) {
            subHeroMap[matchedSubHeroTitle] = product;
          }
        }
        
        setHeroProductMap(heroMap);
        setSubHeroProductMap(subHeroMap);
        
        // Fetch filtered products based on URL filter parameter
        const filteredProducts = await getFilteredProducts('her', filterValue);
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check your Firebase connection.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [filterValue]);

  const heroImages = useMemo(() => {
    return HER_HERO_TITLES.map((title) => {
      const product = heroProductMap[title];
      return product ? getProductImage(product) : '';
    });
  }, [heroProductMap]);

  // Get all subHero products sorted by their number
  const subHeroProducts = useMemo(() => {
    const products = Object.entries(subHeroProductMap)
      .map(([title, product]) => ({ title, product }))
      .sort((a, b) => extractSubHeroNumber(a.title) - extractSubHeroNumber(b.title));
    return products;
  }, [subHeroProductMap]);

  const hasHeroImages = heroImages.length >= 2 && heroImages[0] && heroImages[1];
  const hasSubHeroImages = subHeroProducts.length > 0;

  const productCount = products.length;
  const gridClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 gap-8';

  const heroAlt1 =
    heroProductMap['ForHerHero-img1']
      ? getCandidateTitles(heroProductMap['ForHerHero-img1'])[0]
      : 'For Her Hero Image 1';

  const heroAlt2 =
    heroProductMap['ForHerHero-img2']
      ? getCandidateTitles(heroProductMap['ForHerHero-img2'])[0]
      : 'For Her Hero Image 2';

  // Group subHero images into rows of 2 images + 1 green section
  const subHeroRows = useMemo(() => {
    const rows: Array<Array<{ title: string; product: Product }>> = [];
    for (let i = 0; i < subHeroProducts.length; i += 2) {
      rows.push(subHeroProducts.slice(i, i + 2));
    }
    return rows;
  }, [subHeroProducts]);

  const handleAddToCart = async (product: Product) => {
    const productName = getProductName(product);
    const productPrice = product.price || product.strike_price || 0;
    const productImage = getProductImage(product);
    
    try {
      await addItem({
        id: product.id,
        name: productName,
        price: productPrice,
        size: 'M',
        quantity: 1,
        image: productImage,
      });
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="w-full px-8 py-4 border-t border-gray-200 mt-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-semibold uppercase">
            {productCount} 
            <span className='ml-1'>products</span>
          </p>
          <div className="flex items-center gap-4">
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200 text-black' : 'bg-white text-gray-400'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`p-2 ${viewMode === 'card' ? 'bg-gray-200 text-black' : 'bg-white text-gray-400'}`}
                onClick={() => setViewMode('card')}
                aria-label="Card view"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <button className="flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase">
              <Filter size={18} />
              FILTER & SORT
            </button>
          </div>
        </div>
      </div>

      {/* Hero images - only show when showing ALL products (no filter) */}
      {filterValue === 'all' && hasHeroImages && (
        <section className="relative w-full bg-white min-h-[148vh] lg:min-h-[170vh] pb-8">
          <div className="flex flex-col lg:flex-row w-full gap-12">
            <div className="w-full lg:w-2/5 flex flex-col justify-start pt-8 lg:pt-20 px-6 lg:pl-12">
              <h1 className="text-[10px] lg:text-5xl font-bold mb-6">for her</h1>
              <p className=" text-base leading-relaxed max-w-md text-[13px]">
                no plastic. no polyester. no pesticides. no chemicals. no child labour. no greenwashing.{' '}
                <span className="font-semibold">no nasties.</span>
              </p>
            </div>
            <div className="w-full lg:flex-1 flex flex-col relative">
              <div className="relative h-[130vh] lg:h-[170vh] flex justify-end">
                <div className="relative h-full w-full lg:w-[69.7vw]">
                  <Image
                    src={heroImages[0]}
                    alt={heroAlt1 || 'For Her Hero Image 1'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Second hero image - positioned absolutely to be flush left with screen */}
          <div className="absolute left-0 top-[90vh] h-[58vh] lg:h-[80vh] w-full lg:w-[30vw]">
            <Image
              src={heroImages[1]}
              alt={heroAlt2 || 'For Her Hero Image 2'}
              fill
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* Sub hero images with green text area - only show when showing ALL products (no filter) */}
      {filterValue === 'all' && hasSubHeroImages && (
        <div className="w-full">
          {subHeroRows.map((row, rowIndex) => (
            <section key={rowIndex} className="w-full flex flex-col md:flex-row mb-4 last:mb-0">
              {/* First image in row */}
              {row[0] && (
                <div className="w-full md:w-[30vw] md:mr-4 relative h-[60vh] md:h-[80vh]">
                  <Image
                    src={getProductImage(row[0].product)}
                    alt={getCandidateTitles(row[0].product)[0] || `Sub Hero Image ${rowIndex * 2 + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {/* Second image in row */}
              {row[1] && (
                <div className="w-full md:w-[30vw] md:mr-4 relative h-[60vh] md:h-[80vh]">
                  <Image
                    src={getProductImage(row[1].product)}
                    alt={getCandidateTitles(row[1].product)[0] || `Sub Hero Image ${rowIndex * 2 + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {/* Green text area - only show if we have at least one image */}
              {row[0] && (
                <div className="w-full md:flex-1 bg-[#28e605] flex flex-col justify-center items-center px-8 py-12 h-[60vh] md:h-[80vh]">
                  <p className="text-white text-2xl md:text-3xl font-semibold text-center mb-2">
                    don&apos;t panic. it&apos;s organic.
                  </p>
                  <p className="text-white text-lg md:text-xl text-center">
                    that too, certified.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-4">
       

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
                {/* <p className="text-gray-600 mb-2">No products found in Firebase.</p>
                <p className="text-sm text-gray-500">
                  Make sure you have products in the T_products collection with active: true
                </p> */}
              </div>
            ) : (
              <div className={gridClasses}>
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

