import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { useApp } from '../context/AppContext';
import { safeGetItem } from '../utils/safeStorage';

export const Hero: React.FC = () => {
  const { siteContent } = useApp();
  const hero = siteContent.hero;
  const isFeaturedActive =
    hero.showFeaturedCake !== false &&
    Boolean(hero.featuredCakeImage && hero.featuredCakeImage !== 'none');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-[#FAF7F5] to-[#FAF7F5] dark:from-[#1D1318] dark:via-[#140F12] dark:to-[#120F11] pt-8 pb-16 lg:py-20 border-b border-rose-100/60 dark:border-rose-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 ${
            isFeaturedActive ? 'lg:grid-cols-12 gap-12 lg:gap-8' : 'max-w-3xl mx-auto'
          } items-center`}
        >
          {/* Left Column: Editorial Headline & Actions */}
          <div
            className={`${
              isFeaturedActive
                ? 'lg:col-span-7 flex flex-col items-start'
                : 'flex flex-col items-center text-center'
            } space-y-6`}
          >
            {/* Ambient Kicker */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-xs">
              <span>{hero.kicker}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-[1.55rem] xs:text-[1.7rem] sm:text-5xl lg:text-6xl font-bold tracking-tight text-rose-950 dark:text-rose-100 leading-[1.2] sm:leading-[1.12]">
              {hero.headline?.toLowerCase().includes('sweet moments deserve something special') ? (
                <>
                  <span className="block">Sweet moments deserve</span>
                  <span className="block">something special.</span>
                </>
              ) : hero.headline?.includes('\n') ? (
                hero.headline.split('\n').map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))
              ) : (
                <span className="block">{hero.headline}</span>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl">
              {hero.supportingCopy}
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-wrap items-center gap-4 pt-2 ${
                isFeaturedActive ? 'justify-start' : 'justify-center'
              }`}
            >
              <Link
                to={hero.primaryCtaLink || '/shop'}
                className="px-6 py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <span>{hero.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={hero.secondaryCtaLink || '/best-sellers'}
                className="px-6 py-3.5 rounded-full bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm border border-rose-200 dark:border-stone-700 transition-all shadow-xs"
              >
                {hero.secondaryCtaText}
              </Link>
              <Link
                to="/custom-cakes"
                className="px-4 py-3.5 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold text-sm transition-colors"
              >
                {hero.customCakeCtaText || 'Create a Custom Cake →'}
              </Link>
            </div>

            {/* Value Badges */}
            <div
              className={`pt-4 border-t border-rose-100 dark:border-rose-950/60 flex flex-wrap items-center gap-6 ${
                isFeaturedActive ? 'justify-start' : 'justify-center'
              }`}
            >
              <div>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {hero.badge1}
                </span>
              </div>
              <div>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {hero.badge2}
                </span>
              </div>
              <div>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {hero.badge3}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Cake Visual Presentation (When active) */}
          {isFeaturedActive && (
            <div className="lg:col-span-5 relative">
              {/* Decorative backdrop shapes */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-pink-200/40 dark:bg-rose-950/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-60 h-60 bg-amber-100/50 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-white dark:bg-stone-900 group">
                <div className="aspect-4/5 sm:aspect-square lg:aspect-4/5 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] w-full p-2 flex items-center justify-center bg-rose-50/30 dark:bg-stone-900/60">
                  <SafeImage
                    src={
                      hero.featuredCakeImage ||
                      safeGetItem('els_featured_cake_image') ||
                      '/assets/sister-nk-cake.svg'
                    }
                    alt={hero.featuredCakeTitle || "Featured Celebration Cake from El's Delight Treats"}
                    category="Celebration Special"
                    fallbackTitle="El's Delight Treats"
                    fitMode="auto"
                    className="w-full h-full rounded-2xl group-hover:scale-102 transition-transform duration-500"
                  />
                </div>

                {/* Floating Customer Proof Badge (Always visible on mobile & tablets) */}
                <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg border border-rose-100 dark:border-stone-800 flex items-center gap-2 sm:gap-2.5 max-w-[calc(100%-1.25rem)] sm:max-w-xs">
                  <div className="flex items-center text-amber-500 shrink-0">
                    <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums leading-tight">
                      {hero.featuredCakeRating || '5.0 / 5.0 Rating'}
                    </p>
                    <p className="text-[9.5px] sm:text-[11px] text-stone-600 dark:text-stone-300 font-medium leading-tight">
                      {hero.featuredCakeSubtitle || 'Over 500+ Lagos Celebrations'}
                    </p>
                  </div>
                </div>

                {/* Floating Pricing Badge (Always fully visible on mobile & tablets) */}
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg border border-rose-100 dark:border-stone-800 text-right max-w-[calc(100%-1.25rem)] sm:max-w-sm">
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
                    {hero.featuredCakeTag || 'Featured Today'}
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug break-words">
                    {hero.featuredCakeTitle || 'Gold Splatter "Happy Birthday Sister NK" Cake'}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1 flex-wrap">
                    <span className="text-xs sm:text-sm lg:text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                      {hero.featuredCakePrice || '₦38,000'}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                      · Lagos Delivery / Pickup
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
