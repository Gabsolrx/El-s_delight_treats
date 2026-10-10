import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReviewsSection: React.FC = () => {
  const { reviews } = useApp();

  return (
    <section className="py-16 sm:py-20 bg-[#FAFAFA] dark:bg-[#0F0F12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Real Moments, Real Delight
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            What Our Customers Say
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">
            Verified experiences from celebrations across Lagos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => {
            const cleanText = review.text.replace(/^["“](.*)["”]$/, '$1').trim();
            return (
              <div
                key={review.id}
                className="bg-white dark:bg-[#18181C] rounded-2xl p-6 border border-rose-100 dark:border-rose-950/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Star rating */}
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                    “{cleanText}”
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-rose-50 dark:border-rose-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {review.name}
                      </h4>
                      {review.location && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {review.location}
                        </p>
                      )}
                    </div>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {(review.occasion || review.productName) && (
                    <div className="mt-2 text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                      {[review.occasion, review.productName].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiet footnote regarding verified order data */}
        <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-8">
          Showing representative sample customer feedback verified from WhatsApp dispatch confirmations.
        </p>
      </div>
    </section>
  );
};
