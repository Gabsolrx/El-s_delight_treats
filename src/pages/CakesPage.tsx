import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export const CakesPage: React.FC = () => {
  const { products } = useApp();
  const celebrationCakes = products.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return !cat.includes('treat') && !cat.includes('cookie') && !cat.includes('pastry') && !cat.includes('cupcake');
  });

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Artisanal Layer Cakes
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Celebration & Wedding Cakes
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Handcrafted 6-inch to multi-tiered architectural masterpieces with customizable size, flavour, and piped greetings.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {celebrationCakes.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
