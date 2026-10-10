import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

export const CategoryCarousel: React.FC = () => {
  const { categories } = useApp();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-10 bg-white dark:bg-[#161214] border-b border-rose-100 dark:border-stone-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
              Browse by Style
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Explore Our Cake Catalogue
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:underline shrink-0"
          >
            View All ({categories.length}) →
          </Link>
        </div>

        {/* Scrollable Container with custom styling */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 items-end">
          {categories.map((cat) => {
            // Determine route target
            let linkTo = `/shop?category=${encodeURIComponent(cat.name)}`;
            if (cat.name === 'Custom Cakes') linkTo = '/custom-cakes';
            if (cat.name === 'Wedding Cakes') linkTo = '/shop?category=Wedding%20Cakes';

            const isChristmas = cat.name.toLowerCase().includes('christmas');

            return (
              <Link
                key={cat.name}
                to={linkTo}
                className={`group flex flex-col items-center text-center shrink-0 ${
                  isChristmas ? 'w-28 sm:w-34' : 'w-24 sm:w-28'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-2xl p-1 transition-transform`}
              >
                {/* Circular image showcase with generous framing to display cake fully */}
                <div
                  className={`relative ${
                    isChristmas
                      ? 'w-26 h-26 sm:w-32 sm:h-32 p-1 bg-gradient-to-tr from-emerald-500 via-rose-400 to-amber-300 ring-2 ring-emerald-500/40 shadow-md'
                      : 'w-22 h-22 sm:w-26 sm:h-26 p-1 bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 shadow-xs'
                  } rounded-full overflow-hidden group-hover:scale-105 transition-all duration-300`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-900">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      category={cat.name}
                      fallbackTitle={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <span
                  className={`text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 mt-2.5 line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${
                    isChristmas ? 'text-rose-900 dark:text-rose-200 font-bold' : ''
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
