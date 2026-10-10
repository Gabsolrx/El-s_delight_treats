import React, { useState } from 'react';
import { OCCASIONS_LIST } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { OccasionType } from '../types';

export const OccasionsPage: React.FC = () => {
  const { products, siteContent } = useApp();
  const [activeOccasion, setActiveOccasion] = useState<string>('All');

  const occasionItems =
    siteContent.occasionsSection?.items && siteContent.occasionsSection.items.length > 0
      ? siteContent.occasionsSection.items
      : OCCASIONS_LIST;

  const filtered =
    activeOccasion === 'All'
      ? products
      : products.filter((p) => {
          const occNorm = activeOccasion.toLowerCase();
          const catNorm = (p.category || '').toLowerCase();
          if (
            (occNorm.includes('wedding') && catNorm.includes('wedding')) ||
            (occNorm.includes('birthday') && catNorm.includes('birthday')) ||
            (occNorm.includes('anniversary') && catNorm.includes('anniversary')) ||
            (occNorm.includes('graduation') && catNorm.includes('graduation')) ||
            ((occNorm.includes('corporate') || occNorm.includes('office')) && (catNorm.includes('corporate') || catNorm.includes('office'))) ||
            (occNorm.includes('christmas') && catNorm.includes('christmas')) ||
            (occNorm.includes('baby') && catNorm.includes('baby')) ||
            catNorm === occNorm ||
            catNorm.includes(occNorm)
          ) {
            return true;
          }
          return false;
        });

  return (
    <div className="py-12 bg-[#FAF7F5] dark:bg-[#120F11] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Celebration Registry
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Shop by Occasion
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Whether welcoming little miracles, exchanging vows, or cheering corporate wins, find tailored designs for every special moment.
          </p>
        </div>

        {/* Occasion Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center">
          <button
            onClick={() => setActiveOccasion('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeOccasion === 'All'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-pink-300'
            }`}
          >
            All Occasions
          </button>
          {occasionItems.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setActiveOccasion(occ.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeOccasion === occ.id
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-pink-300'
              }`}
            >
              {occ.title}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
