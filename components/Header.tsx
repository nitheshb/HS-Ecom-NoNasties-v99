'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const pathname = usePathname();
  const { setIsCartOpen, getItemCount } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHerHovered, setIsHerHovered] = useState(false);
  const [isHimHovered, setIsHimHovered] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration error by only rendering cart count after mount
  useEffect(() => {
    // Use setTimeout to avoid synchronous state update in effect
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Check if we're on auth pages (signup/login) - show only logo
  const isAuthPage = pathname === '/signup' || pathname === '/login';
  
  // Check if we're on the homepage
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past 120vh (first image height)
      setIsScrolled(window.scrollY > window.innerHeight * 1.2);
    };

    // Set initial state based on current scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDropdownOpen = isHerHovered || isHimHovered || isCollectionsHovered;
  
  // Determine header style: if not on homepage, always white background with black text
  // On homepage, use transparent when not scrolled, white when scrolled
  const shouldUseWhiteBg = !isHomePage || isScrolled || isDropdownOpen;

  // If on auth pages, show only logo
  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <nav className="w-full px-8">
          <div className="flex items-center justify-center py-4">
            <Link href="/" className="text-2xl font-bold italic transition-colors leading-none text-[#171717]">
              no nasties +
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-75 ${shouldUseWhiteBg ? 'bg-white' : 'bg-transparent'}`}>
      {/* Main navigation */}
      <nav className="w-full px-8">
        <div className="flex items-baseline justify-between py-4">
          {/* Left side - Logo + Navigation */}
          <div className="flex items-baseline gap-8">
            {/* Logo */}
            <Link href="/" className={`text-2xl font-bold italic transition-colors leading-none ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}>
              no nasties +
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-baseline gap-6 pt-1">
              <div 
                className="relative"
                onMouseEnter={() => setIsHerHovered(true)}
                onMouseLeave={() => setIsHerHovered(false)}
              >
                <Link href="/her" className={`uppercase text-sm hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'} ${isHerHovered ? 'underline' : ''}`}>
                  HER
                </Link>
                {isHerHovered && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg py-4 min-w-[200px]">
                    <Link href="/her" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      ALL
                    </Link>
                    <Link href="/her?filter=new-arrivals" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      NEW ARRIVALS
                    </Link>
                    <Link href="/her?filter=organic-linen" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      ORGANIC LINEN
                    </Link>
                    <Link href="/her?filter=dresses" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      DRESSES & JUMPSUITS
                    </Link>
                    <Link href="/her?filter=shirts" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SHIRTS
                    </Link>
                    <Link href="/her?filter=tops" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      TOPS & TEES
                    </Link>
                    <Link href="/her?filter=skirts" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SKIRTS & BOTTOMS
                    </Link>
                    <Link href="/her?filter=sleepwear" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SLEEPWEAR
                    </Link>
                    <Link href="/her?filter=knits" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      ORGANIC KNITS
                    </Link>
                    <Link href="/her?filter=accessories" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SARONGS, SCARVES & BAGS
                    </Link>
                    <Link href="/her?filter=coords" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      CO-ORDS AT 5% OFF
                    </Link>
                    <Link href="/her?filter=sale" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SALE
                    </Link>
                  </div>
                )}
              </div>
              <div 
                className="relative"
                onMouseEnter={() => setIsHimHovered(true)}
                onMouseLeave={() => setIsHimHovered(false)}
              >
                <Link href="/him" className={`uppercase text-sm hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'} ${isHimHovered ? 'underline' : ''}`}>
                  HIM
                </Link>
                {isHimHovered && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg py-4 min-w-[200px]">
                    <Link href="/him" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      ALL
                    </Link>
                    <Link href="/him?filter=new-arrivals" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      NEW ARRIVALS
                    </Link>
                    <Link href="/him?filter=organic-linen" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      ORGANIC LINEN
                    </Link>
                    <Link href="/him?filter=shirts" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SHIRTS
                    </Link>
                    <Link href="/him?filter=tops" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      TOPS & TEES
                    </Link>
                    <Link href="/him?filter=bottoms" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      BOTTOMS
                    </Link>
                    <Link href="/him?filter=coords" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      CO-ORDS AT 5% OFF
                    </Link>
                    <Link href="/him?filter=sale" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SALE
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/home" className={`uppercase text-sm hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}>
                HOME
              </Link>
              <div 
                className="relative"
                onMouseEnter={() => setIsCollectionsHovered(true)}
                onMouseLeave={() => setIsCollectionsHovered(false)}
              >
                <Link href="/collections" className={`uppercase text-sm hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'} ${isCollectionsHovered ? 'underline' : ''}`}>
                  COLLECTIONS
                </Link>
                {isCollectionsHovered && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg py-4 min-w-[200px]">
                    <Link href="/collections/comfort" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      COMFORT: A DIWALI STORY
                    </Link>
                    <Link href="/collections/linen-life" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      LINEN LIFE
                    </Link>
                    <Link href="/collections/bloom" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      BLOOM BABY BLOOM
                    </Link>
                    <Link href="/collections/mixology" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      MIXOLOGY - OPEN BAR
                    </Link>
                    <Link href="/collections/polka-dot" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      POLKA DOT PARTY
                    </Link>
                    <Link href="/collections/azulejo" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      AZULEJO - SOUL OF GOA
                    </Link>
                    <Link href="/collections/sleep" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      SLEEP - SWEET DREAMS
                    </Link>
                    <Link href="/collections/jersey" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      JOY OF JERSEY
                    </Link>
                    <Link href="/collections/coords" className="block px-6 py-2 text-sm text-black hover:bg-gray-50">
                      CONSCIOUS CO-ORDS
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/sustainability" className={`uppercase text-sm hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}>
                SUSTAINABILITY
              </Link>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/orders"
                className={`hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                aria-label="Account"
              >
                <User size={20} />
              </Link>
            ) : (
              <Link
                href="/login"
                className={`hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                aria-label="Account"
              >
                <User size={20} />
              </Link>
            )}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative hover:opacity-80 transition ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {isMounted && getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden absolute top-2 right-2 p-2 transition-colors ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${shouldUseWhiteBg ? 'border-[#171717]/20' : 'border-white/20'}`}>
            <div className="flex flex-col space-y-4">
              <Link
                href="/her"
                className={`py-2 uppercase text-base hover:opacity-80 ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Her
              </Link>
              <Link
                href="/him"
                className={`py-2 uppercase text-base hover:opacity-80 ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Him
              </Link>
              <Link
                href="/home"
                className={`py-2 uppercase text-base hover:opacity-80 ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/collections"
                className={`py-2 uppercase text-base hover:opacity-80 ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link
                href="/sustainability"
                className={`py-2 uppercase text-base hover:opacity-80 ${shouldUseWhiteBg ? 'text-[#171717]' : 'text-white'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sustainability
              </Link>
            </div>
          </div>
        )}

        {/* Search bar */}
        {isSearchOpen && (
          <div className="border-t py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

