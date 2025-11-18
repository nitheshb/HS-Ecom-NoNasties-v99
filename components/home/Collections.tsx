'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBanners, Banner } from '@/services/read/banner';

const COLLECTION_BANNER_TITLES = {
  him: 'collection-img-forHim',
  her: 'collection-img-forHer',
} as const;

const extractImageUrl = (banner?: Banner): string => {
  if (!banner) return '';

  const normalizeString = (value?: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  const directImg = normalizeString(banner.img);
  if (directImg) {
    return directImg;
  }

  if (banner.images) {
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

export default function Collections() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [collectionBannerMap, setCollectionBannerMap] = useState<Record<string, Banner>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await getBanners();
        const filtered = allBanners.filter((banner) => {
          const normalized = banner.title?.toLowerCase() || '';
          return (
            normalized === COLLECTION_BANNER_TITLES.him.toLowerCase() ||
            normalized === COLLECTION_BANNER_TITLES.her.toLowerCase()
          );
        });

        const bannerMap = filtered.reduce<Record<string, Banner>>((acc, banner) => {
          if (banner.title) {
            acc[banner.title.toLowerCase()] = banner;
          }
          return acc;
        }, {});

        setCollectionBannerMap(bannerMap);
      } catch (error) {
        console.error('Failed to load collection banners:', error);
      }
    };

    void fetchBanners();
  }, []);

  const collectionImages = useMemo(() => {
    return {
      him: extractImageUrl(collectionBannerMap[COLLECTION_BANNER_TITLES.him.toLowerCase()]),
      her: extractImageUrl(collectionBannerMap[COLLECTION_BANNER_TITLES.her.toLowerCase()]),
    };
  }, [collectionBannerMap]);

  const hasAllImages = collectionImages.him && collectionImages.her;
  if (!hasAllImages) {
    return null;
  }

  return (
    <section className="relative w-full h-screen">
      <div className="grid grid-cols-2 h-full">
        {/* Left Section - For Him */}
        <div className="relative h-full">
          <Image
            src={collectionImages.him}
            alt="For Him"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h2 className="text-4xl font-bold mb-4">for him</h2>
            <p className="text-xl mb-6">
              &ldquo;The fabric is really soft and comfortable. Fits perfectly!&rdquo;
            </p>
            <Link
              href="/him"
              className="bg-white text-[10px] text-black px-6 py-2 font-semibold hover:bg-white-800 transition inline-block overflow-hidden relative"
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                SHOP NOW
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section - For Her */}
        <div className="relative h-full">
          <Image
            src={collectionImages.her}
            alt="For Her"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h2 className="text-4xl font-bold mb-4">for her</h2>
            <p className="text-xl mb-6">
              &ldquo;The most wonderful & comfortable dress ever.&rdquo;
            </p>
            <Link
              href="/her"
              className="bg-white text-[10px] text-black px-6 py-2 font-semibold hover:bg-white-800 transition inline-block overflow-hidden relative"
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                SHOP NOW
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

