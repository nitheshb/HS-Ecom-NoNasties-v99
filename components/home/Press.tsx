'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBanners, Banner } from '@/services/read/banner';

const PRESS_BACKGROUND_TITLE = 'pressbackgroundimg';

const PRESS_ITEM_CONFIG = [
  {
    bannerTitle: 'fortune',
    quote: "Rewriting the rules of fashion proving that age-old adage that style can also be a force for good.",
    source: 'FORTUNE',
  },
  {
    bannerTitle: 'vogue',
    quote: 'It starts with using organic cotton, an all-Indian supply chain, upcycling surplus packaging.',
    source: 'VOGUE',
  },
  {
    bannerTitle: 'traveler',
    quote: "Possibly India's oldest and most established vegan clothing brand.",
    source: 'TRAVELER',
  },
  {
    bannerTitle: 'indianexpress',
    quote: 'Sustainably made, right from the seed to the garment.',
    source: 'INDIAN EXPRESS',
  },
  {
    bannerTitle: 'hindustantimes',
    quote: 'A triple bottom-line of people, planet, and profits.',
    source: 'HINDUSTAN TIMES',
  },
] as const;

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

type PressBannerMap = Record<string, Banner>;

export default function Press() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pressBannerMap, setPressBannerMap] = useState<PressBannerMap>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const allBanners = await getBanners();
    const bannerMap = allBanners.reduce<PressBannerMap>((acc, banner) => {
      const normalizedTitle = banner.title?.toLowerCase();
      if (normalizedTitle) {
        acc[normalizedTitle] = banner;
      }
          return acc;
        }, {});

        setPressBannerMap(bannerMap);
      } catch (error) {
        console.error('Failed to load press banners:', error);
      }
    };

    void fetchBanners();
  }, []);

  const getBannerByTitle = useCallback(
    (title?: string) => (title ? pressBannerMap[title.toLowerCase()] : undefined),
    [pressBannerMap]
  );

  const pressItems = useMemo(() => {
    return PRESS_ITEM_CONFIG.map((item) => ({
      quote: item.quote,
      source: item.source,
      image: extractImageUrl(getBannerByTitle(item.bannerTitle)),
    }));
  }, [getBannerByTitle]);

  const backgroundImage = useMemo(() => {
    const explicitBg = extractImageUrl(getBannerByTitle(PRESS_BACKGROUND_TITLE));
    if (explicitBg) return explicitBg;

    const fallbackBgEntry = Object.entries(pressBannerMap).find(([title]) =>
      title.includes('background') || title.includes('bg')
    );

    return extractImageUrl(fallbackBgEntry?.[1]);
  }, [getBannerByTitle, pressBannerMap]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev === pressItems.length - 1 ? 0 : prev + 1));
        setIsTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [pressItems.length]);

  const hasAllImages =
    !!backgroundImage && pressItems.every((item) => !!item.image);
  if (!hasAllImages) {
    return null;
  }

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? pressItems.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === pressItems.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 300);
  };

  const backgroundAlt =
    getBannerByTitle(PRESS_BACKGROUND_TITLE)?.title ||
    Object.keys(pressBannerMap).find(
      (title) => title.includes('press') && title.includes('bg')
    ) ||
    'Press Background';

  return (
    <section className="relative w-full h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <p className="uppercase mb-8 text-base font-semibold">PRESS</p>

        <div className="max-w-4xl text-center px-8 mb-12 overflow-hidden h-32">
          <div
            className={`transition-transform duration-300 ${isTransitioning ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <p className="text-3xl font-semibold leading-relaxed">
              &ldquo;{pressItems[currentIndex].quote}&rdquo;
            </p>
          </div>
        </div>

        <div className="mb-12 overflow-hidden h-32">
          <div
            className={`transition-transform duration-300 flex justify-center ${isTransitioning ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image
                src={pressItems[currentIndex].image}
                alt={pressItems[currentIndex].source}
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
