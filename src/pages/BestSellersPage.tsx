import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export const BestSellersPage: React.FC = () => {
  const { products } = useApp();
  const bestSellers = products.filter((p) => p.bestseller || p.rating >= 4.9);

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            <span>Most Celebrated Cakes in Lagos</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Our Best Sellers
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Proven crowd favourites, meticulously baked with luxury ingredients for birthdays, weddings, and sweet surprises.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
