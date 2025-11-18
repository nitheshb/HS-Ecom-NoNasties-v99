'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { getBanners, Banner } from '@/services/read/banner';

const HERO_TITLES = ['Hero-img-1', 'Hero-img-2', 'Hero-img-3', 'Hero-img-4'] as const;

const extractImageUrl = (banner?: Banner): string => {
  if (!banner) return '';

  const normalizeString = (value?: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  // First, try the img field (most direct)
  const directImg = normalizeString(banner.img);
  if (directImg) {
    return directImg;
  }

  // Then try images array/object
  if (banner.images) {
    // Handle both array and object with numeric keys
    const imagesArray = Array.isArray(banner.images) 
      ? banner.images 
      : Object.values(banner.images);

    for (const entry of imagesArray) {
      if (typeof entry === 'string') {
        const normalized = normalizeString(entry);
        if (normalized) {
          return normalized;
        }
      } else if (entry && typeof entry === 'object') {
        const candidate =
          normalizeString(entry.url) ||
          normalizeString(entry.link) ||
          normalizeString(entry.downloadURL) ||
          normalizeString(entry.src) ||
          normalizeString(entry.imageUrl);

        if (candidate) {
          return candidate;
        }
      }
    }
  }

  return '';
};

export default function Hero() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const [isHovered4, setIsHovered4] = useState(false);
  const [heroBannerMap, setHeroBannerMap] = useState<Record<string, Banner>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await getBanners();
        const filtered = allBanners.filter((banner) =>
          HERO_TITLES.includes(banner.title as typeof HERO_TITLES[number])
        );

        const bannerMap = filtered.reduce<Record<string, Banner>>((acc, banner) => {
          acc[banner.title] = banner;
          return acc;
        }, {});

        setHeroBannerMap(bannerMap);
      } catch (error) {
        console.error('Failed to load hero banners:', error);
      }
    };

    void fetchBanners();
  }, []);

  const heroImages = useMemo(() => {
    return HERO_TITLES.map((title) => extractImageUrl(heroBannerMap[title]));
  }, [heroBannerMap]);

  const hasAllImages = heroImages.every((img) => !!img);
  if (!hasAllImages) {
    return null;
  }

  const heroLinks = HERO_TITLES.map((title, index) => {
    const banner = heroBannerMap[title];
    if (banner?.redirect_url && banner.redirect_url.trim().length > 0) {
      return banner.redirect_url;
    }
    // fallback to original destinations to avoid empty hrefs
    if (index === 0 || index === 2) return '/her';
    return '/him';
  });

  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-2">
        {/* Row 1 - Image 1 */}
        <div className="relative h-[120vh]">
          <Image
            src={heroImages[0]}
            alt="Hero-img-1"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                the ultimate wardrobe hack? the ultimate wardrobe hack? the ultimate wardrobe hack?
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                the ultimate wardrobe hack? the ultimate wardrobe hack? the ultimate wardrobe hack?
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href={heroLinks[0]}
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HER
              </span>
            </Link>
          </div>
        </div>

        {/* Row 1 - Image 2 */}
        <div className="relative h-[120vh]">
          <Image
            src={heroImages[1]}
            alt="Hero-img-2"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                comfort, of course. comfort, of course. comfort, of course. comfort, of course.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                comfort, of course. comfort, of course. comfort, of course. comfort, of course.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href={heroLinks[1]}
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HIM
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2 - Image 3 */}
        <div className="relative h-[120vh]">
          <Image
            src={heroImages[2]}
            alt="Hero-img-3"
            fill
            className="object-cover"
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello zero waste. hello zero waste. hello zero waste. hello zero waste.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello zero waste. hello zero waste. hello zero waste. hello zero waste.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href={heroLinks[2]}
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered3(true)}
              onMouseLeave={() => setIsHovered3(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered3 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HER
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2 - Image 4 */}
        <div className="relative h-[120vh]">
          <Image
            src={heroImages[3]}
            alt="Hero-img-4"
            fill
            className="object-cover"
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello organic cotton. hello organic cotton. hello organic cotton. hello organic cotton.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello organic cotton. hello organic cotton. hello organic cotton. hello organic cotton.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href={heroLinks[3]}
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered4(true)}
              onMouseLeave={() => setIsHovered4(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered4 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HIM
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
