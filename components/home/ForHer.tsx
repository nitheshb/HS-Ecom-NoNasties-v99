'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { getBanners, Banner } from '@/services/read/banner';

const FOR_HER_TITLES = ['Home-forHer1', 'Home-forHer2', 'Home-forHer3', 'Home-forHer4'] as const;

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

export default function ForHer() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const [isHovered4, setIsHovered4] = useState(false);
  const [forHerBannerMap, setForHerBannerMap] = useState<Record<string, Banner>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await getBanners();
        const filtered = allBanners.filter((banner) =>
          FOR_HER_TITLES.includes(banner.title as typeof FOR_HER_TITLES[number])
        );

        const bannerMap = filtered.reduce<Record<string, Banner>>((acc, banner) => {
          acc[banner.title] = banner;
          return acc;
        }, {});

        setForHerBannerMap(bannerMap);
      } catch (error) {
        console.error('Failed to load for her banners:', error);
      }
    };

    void fetchBanners();
  }, []);

  const forHerImages = useMemo(() => {
    return FOR_HER_TITLES.map((title) => extractImageUrl(forHerBannerMap[title]));
  }, [forHerBannerMap]);

  const hasAllImages = forHerImages.every((img) => !!img);
  if (!hasAllImages) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="w-[98vw] mx-auto px-0">
        {/* Header */}
        <div className="mb-12 px-8">
          <h2 className="text-2xl font-bold mb-5">shop for her</h2>
          <p className=" text-sm">
            organic cotton dresses, shirts, tops, skirts for women
          </p>
        </div>

        {/* 1x4 Horizontal Grid */}
        <div className="grid grid-cols-4 px-8">
          {/* Image 1 - Organic Dresses */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHerImages[0]}
              alt={forHerBannerMap['Home-forHer1']?.title || "Home-forHer1"}
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered1(true)}
                onMouseLeave={() => setIsHovered1(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                  SHOP ORGANIC DRESSES
                </span>
              </button>
            </div>
          </div>

          {/* Image 2 - Super-Soft Shirts */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHerImages[1]}
              alt={forHerBannerMap['Home-forHer2']?.title || "Home-forHer2"}
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered2(true)}
                onMouseLeave={() => setIsHovered2(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                  SHOP SUPER-SOFT SHIRTS
                </span>
              </button>
            </div>
          </div>

          {/* Image 3 - Tops, Tees, Tanks */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHerImages[2]}
              alt={forHerBannerMap['Home-forHer3']?.title || "Home-forHer3"}
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered3(true)}
                onMouseLeave={() => setIsHovered3(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered3 ? 'animate-button-scroll' : ''}`}>
                  SHOP TOPS, TEES, TANKS
                </span>
              </button>
            </div>
          </div>

          {/* Image 4 - Tailored Bottoms */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHerImages[3]}
              alt={forHerBannerMap['Home-forHer4']?.title || "Home-forHer4"}
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered4(true)}
                onMouseLeave={() => setIsHovered4(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered4 ? 'animate-button-scroll' : ''}`}>
                  SHOP TAILORED BOTTOMS
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
