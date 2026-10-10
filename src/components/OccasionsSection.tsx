import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OCCASIONS_LIST } from '../data/products';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

export function getOccasionCategoryLink(occ: { id: string; title: string; link?: string }): string {
  if (occ.link && !occ.link.includes('occasion=')) return occ.link;

  const idNorm = (occ.id || '').toLowerCase();
  const titleNorm = (occ.title || '').toLowerCase();

  if (idNorm.includes('wedding') || titleNorm.includes('wedding')) {
    return '/shop?category=Wedding%20Cakes';
  }
  if (idNorm.includes('birthday') || titleNorm.includes('birthday')) {
    return '/shop?category=Birthday%20Cakes';
  }
  if (idNorm.includes('anniversary') || titleNorm.includes('anniversary')) {
    return '/shop?category=Anniversary%20Cakes';
  }
  if (idNorm.includes('christmas') || titleNorm.includes('christmas')) {
    return '/shop?category=Christmas%20Cakes';
  }
  if (idNorm.includes('graduation') || titleNorm.includes('graduation')) {
    return '/shop?category=Graduation%20Cakes';
  }
  if (
    idNorm.includes('corporate') ||
    titleNorm.includes('corporate') ||
    idNorm.includes('office') ||
    titleNorm.includes('office')
  ) {
    return '/shop?category=Corporate%2FOffice%20Cakes';
  }
  if (idNorm.includes('baby') || titleNorm.includes('baby')) {
    return '/shop?category=Baby%20Shower%20Cakes';
  }

  return `/shop?category=${encodeURIComponent(occ.title)}`;
}

export const OccasionsSection: React.FC = () => {
  const { siteContent } = useApp();
  const occasionsData = siteContent.occasionsSection;

  const badge = occasionsData?.badge || 'Curated for Nigerian Celebrations';
  const headline = occasionsData?.headline || 'Find a Cake for Every Occasion';
  const viewAllText = occasionsData?.viewAllText || 'View All Occasion Collections';
  const items = occasionsData?.items && occasionsData.items.length > 0
    ? occasionsData.items
    : OCCASIONS_LIST;

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#161214] border-b border-rose-100 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
              {badge}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {headline}
            </h2>
          </div>
          <Link
            to="/occasions"
            className="text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:underline mt-2 md:mt-0 flex items-center gap-1"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((occ) => (
            <Link
              key={occ.id}
              to={getOccasionCategoryLink(occ)}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#1A1418] flex flex-col border border-rose-100 dark:border-rose-950/60 hover:-translate-y-1"
            >
              {/* Expansive Full Cake Showcase Frame (Accommodates any height, length, or aspect ratio) */}
              <div className="relative w-full h-[360px] xs:h-[400px] sm:h-[440px] lg:h-[480px] overflow-hidden bg-rose-50/40 dark:bg-stone-900/60 p-2 sm:p-3 flex items-center justify-center">
                <SafeImage
                  src={occ.image}
                  alt={occ.title}
                  category={occ.title}
                  fallbackTitle={occ.title}
                  fitMode="auto"
                  className="w-full h-full rounded-2xl group-hover:scale-103 transition-transform duration-500"
                />

                {/* Floating Top Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-pink-600 dark:text-pink-300 shadow-sm border border-rose-100 dark:border-stone-800 backdrop-blur-xs">
                    {occ.title}
                  </span>
                </div>
              </div>

              {/* Dedicated Content Footer (Never covers or dims the cake!) */}
              <div className="p-5 sm:p-6 bg-white dark:bg-[#1A1418] flex flex-col justify-between flex-1 border-t border-rose-100/60 dark:border-stone-800/80">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {occ.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
                    “{occ.subtitle}”
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 group-hover:text-pink-700 mt-4 transition-colors">
                  <span>Explore {occ.title} Cakes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
