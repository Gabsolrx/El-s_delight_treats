import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const BudgetSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-18 bg-[#FAFAFA] dark:bg-[#0F0F12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Affordable Luxury
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Something Sweet for Every Budget
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">
            Whether it's an impromptu solo indulgence, a warm family birthday, or an extravagant Lagos wedding, we have your cravings covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Tier 1: Petite Celebrations */}
          <div className="bg-white dark:bg-[#18181C] rounded-2xl p-6 sm:p-8 border border-rose-100 dark:border-rose-950/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/40 dark:bg-rose-950/20 rounded-bl-full pointer-events-none" />
            <div>
              <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                Pocket-Friendly & Quick
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Petite Celebrations
              </h3>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2 tabular-nums">
                ₦20,000 – ₦30,000
              </p>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Single-tier 6-inch layer cakes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Feeds 6–8 family and friends
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Free customized piped inscription
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Same-day express pickup & dispatch
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-50 dark:border-rose-950/60">
              <Link
                to="/shop?price=20k-40k"
                className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Shop Petite Cakes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Tier 2: Celebration (Featured/Most Popular) */}
          <div className="bg-gradient-to-b from-rose-50/50 via-white to-white dark:from-[#20141A] dark:via-[#1A1A1F] dark:to-[#1A1A1F] rounded-2xl p-6 sm:p-8 border-2 border-pink-400 dark:border-pink-800 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-4 right-4">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-pink-600 text-white shadow-xs">
                Most Popular
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                Unforgettable Memories
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Celebration
              </h3>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2 tabular-nums">
                ₦10,000 – ₦40,000
              </p>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Signature chocolate, red velvet & vanilla
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> 6, 8, and 10-inch birthday cakes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Free customized piped inscription
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span> Anniversaries, graduations & family cakes
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-100 dark:border-rose-950/60">
              <Link
                to="/shop?price=10k-40k"
                className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Shop Celebration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Tier 3: Luxury */}
          <div className="bg-white dark:bg-[#18181C] rounded-2xl p-6 sm:p-8 border border-rose-100 dark:border-rose-950/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 dark:bg-amber-950/20 rounded-bl-full pointer-events-none" />
            <div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Grand Occasions
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Luxury & Weddings
              </h3>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2 tabular-nums">
                ₦80,000+
              </p>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> 2-Tier & 3-Tier luxury wedding cakes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Hand-crafted sugar flora & 24k gold leaf
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Large corporate event sheet cakes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> White-glove setup & dedicated delivery
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-50 dark:border-rose-950/60">
              <Link
                to="/shop?price=80k-plus"
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Shop Luxury</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
