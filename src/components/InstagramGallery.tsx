import React from 'react';
import { Instagram, ArrowUpRight, Heart } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { useApp } from '../context/AppContext';
import { SiteGalleryItem } from '../types';

const GALLERY_PHOTOS: SiteGalleryItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    tag: '#BirthdayGlam',
    likes: '248',
    category: 'Birthday',
  },
  {
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80',
    tag: '#LagosWeddings',
    likes: '412',
    category: 'Wedding',
  },
  {
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
    tag: '#CelebrationCakes',
    likes: '195',
    category: 'Birthday Cakes',
  },
  {
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    tag: '#CustomCakes',
    likes: '284',
    category: 'Custom Cakes',
  },
  {
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80',
    tag: '#BirthdayCakes',
    likes: '310',
    category: 'Birthday Cakes',
  },
  {
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
    tag: '#CorporateGifting',
    likes: '162',
    category: 'Corporate',
  },
];

export const InstagramGallery: React.FC = () => {
  const { businessInfo, siteContent } = useApp();
  const galleryData = siteContent.sweetMoments;

  const instagramHandle =
    galleryData?.badge ||
    (businessInfo.instagram && !businessInfo.instagram.includes('elsdelight_treats')
      ? businessInfo.instagram
      : 'els_delighttreats');

  const instagramUrl =
    galleryData?.buttonUrl ||
    businessInfo.instagramUrl ||
    'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==';

  const headline = galleryData?.headline || "Sweet Moments at El's";
  const subtitle =
    galleryData?.subtitle ||
    'Follow our daily baking journey, live frosting reels, and client setups in Lagos.';
  const buttonText = galleryData?.buttonText || 'Follow Us on Instagram';
  const photos = galleryData?.items && galleryData.items.length > 0
    ? galleryData.items
    : GALLERY_PHOTOS;

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#16161A] border-t border-rose-100 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-rose-950/60 text-pink-600 dark:text-pink-300 text-xs font-semibold mb-2">
              <Instagram className="w-3.5 h-3.5" />
              <span>{instagramHandle}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
              {headline}
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
              {subtitle}
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Instagram className="w-4 h-4" />
            <span>{buttonText}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {photos.map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-rose-50 dark:bg-stone-900 border border-rose-100/60 dark:border-stone-800 shadow-xs"
            >
              <SafeImage
                src={item.image}
                alt={item.tag}
                category={item.category}
                fallbackTitle={item.tag}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Hover overlay with likes and hashtag */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center">
                <div className="flex items-center gap-1 text-xs font-bold mb-1">
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                  <span className="tabular-nums">{item.likes}</span>
                </div>
                <span className="text-[11px] font-medium text-pink-200">
                  {item.tag}
                </span>
                <span className="text-[9px] text-stone-300 uppercase mt-0.5">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
