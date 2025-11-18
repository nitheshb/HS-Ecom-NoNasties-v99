'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { getBanners, Banner } from '@/services/read/banner';

const FOR_HIM_TITLES = ['Home-forHim1', 'Home-forHim2', 'Home-forHim3', 'Home-forHim4'] as const;

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

export default function ForHim() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const [isHovered4, setIsHovered4] = useState(false);
  const [forHimBannerMap, setForHimBannerMap] = useState<Record<string, Banner>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await getBanners();
        const filtered = allBanners.filter((banner) =>
          FOR_HIM_TITLES.includes(banner.title as typeof FOR_HIM_TITLES[number])
        );

        const bannerMap = filtered.reduce<Record<string, Banner>>((acc, banner) => {
          acc[banner.title] = banner;
          return acc;
        }, {});

        setForHimBannerMap(bannerMap);
      } catch (error) {
        console.error('Failed to load for him banners:', error);
      }
    };

    void fetchBanners();
  }, []);

  const forHimImages = useMemo(() => {
    return FOR_HIM_TITLES.map((title) => extractImageUrl(forHimBannerMap[title]));
  }, [forHimBannerMap]);

  const hasAllImages = forHimImages.every((img) => !!img);
  if (!hasAllImages) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="w-[98vw] mx-auto px-0">
        {/* Header */}
        <div className="mb-12 px-8">
          <h2 className="text-2xl font-bold mb-5">shop for him</h2>
          <p className="text-sm">
            organic cotton shirts, tees, pants for men
          </p>
        </div>

        {/* 1x4 Horizontal Grid */}
        <div className="grid grid-cols-4 px-8">
          {/* Image 1 - Organic Tees */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHimImages[0]}
              alt={forHimBannerMap['Home-forHim1']?.title || "Home-forHim1"}
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
                  SHOP ORGANIC TEES
                </span>
              </button>
            </div>
          </div>

          {/* Image 2 - Casual Shirts */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHimImages[1]}
              alt={forHimBannerMap['Home-forHim2']?.title || "Home-forHim2"}
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
                  SHOP CASUAL SHIRTS
                </span>
              </button>
            </div>
          </div>

          {/* Image 3 - Linen Pants */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHimImages[2]}
              alt={forHimBannerMap['Home-forHim3']?.title || "Home-forHim3"}
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
                  SHOP LINEN PANTS
                </span>
              </button>
            </div>
          </div>

          {/* Image 4 - Sleep Sets */}
          <div className="relative w-full aspect-3/4">
            <Image
              src={forHimImages[3]}
              alt={forHimBannerMap['Home-forHim4']?.title || "Home-forHim4"}
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
                  SHOP SLEEP SETS
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
