import React from 'react';
import { useApp } from '../context/AppContext';

const PILLAR_TAGS: Record<number, string> = {
  0: 'OVEN FRESHNESS',
  1: 'PURE INGREDIENTS',
  2: 'ARTISANAL DETAIL',
  3: 'PUNCTUAL DISPATCH',
  4: 'PERSONAL CELEBRATION',
};

export const BrandPromise: React.FC = () => {
  const { siteContent } = useApp();
  const promises = siteContent.brandPromises || [];

  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA] dark:from-[#0F0F12] dark:via-[#16161A] dark:to-[#0F0F12] border-b border-rose-100/70 dark:border-stone-800/80 overflow-hidden">
      {/* Subtle ambient luxury light orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-200/20 dark:bg-rose-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-rose-950/60 shadow-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            <span className="text-xs uppercase tracking-widest font-semibold text-rose-900 dark:text-rose-200">
              Handcrafted in Lagos · Artisan Quality
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-rose-950 dark:text-rose-100 mt-2">
            Our Promise for Every Celebration
          </h2>

          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 max-w-lg mx-auto leading-relaxed">
            Baked fresh in Amuwo-Odofin, designed with bespoke artistry, and delivered across Lagos with uncompromising integrity.
          </p>
        </div>

        {/* 5 Distinctive Editorial Cards (Zero Icons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {promises.map((p, idx) => {
            const numeral = String(idx + 1).padStart(2, '0');
            const pillarTag = PILLAR_TAGS[idx] || `PILLAR ${numeral}`;

            return (
              <div
                key={p.id || idx}
                className="group relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-rose-950/60 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-pink-300 dark:hover:border-pink-900/60 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Large Background Watermark Numeral */}
                <span className="font-serif text-6xl sm:text-7xl font-bold tracking-tighter text-rose-100/70 dark:text-rose-950/40 select-none absolute top-2 right-4 group-hover:text-pink-200/80 dark:group-hover:text-rose-900/50 transition-colors pointer-events-none">
                  {numeral}
                </span>

                {/* Top Content */}
                <div className="relative z-10 space-y-4">
                  {/* Pillar Tag Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40">
                    <span className="text-[10px] font-bold tracking-wider text-pink-700 dark:text-pink-300">
                      {pillarTag}
                    </span>
                  </div>

                  {/* Title & Expanding Accent Line */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                      {p.title}
                    </h3>
                    <div className="h-0.5 w-6 bg-gradient-to-r from-pink-500 to-rose-300 rounded-full group-hover:w-12 transition-all duration-300" />
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed font-normal pt-1">
                    {p.desc}
                  </p>
                </div>

                {/* Subtle Bottom Accent Dot */}
                <div className="relative z-10 pt-6 mt-4 border-t border-rose-50 dark:border-rose-950/40 flex items-center justify-between text-[11px] font-semibold text-rose-800/60 dark:text-rose-300/60">
                  <span className="tracking-widest uppercase text-[10px]">Standard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiet Footnote Guarantee Banner */}
        <div className="mt-14 pt-8 border-t border-rose-100/60 dark:border-stone-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-medium text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Handcrafted in Lakeview Phase 1, Amuwo-Odofin
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            Never Pre-Frozen · Baked Specifically for Your Date
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Real WhatsApp Dispatch Confirmation
          </span>
        </div>
      </div>
    </section>
  );
};

