import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { Hero } from '../components/Hero';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { ProductCard } from '../components/ProductCard';
import { BudgetSection } from '../components/BudgetSection';
import { OccasionsSection } from '../components/OccasionsSection';
import { CorporateSection } from '../components/CorporateSection';
import { BrandPromise } from '../components/BrandPromise';
import { ReviewsSection } from '../components/ReviewsSection';
import { InstagramGallery } from '../components/InstagramGallery';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { products } = useApp();
  // Select best sellers
  const bestSellers = products.filter((p) => p.bestseller).slice(0, 8);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Quick Category Navigation */}
      <CategoryCarousel />

      {/* 3. Major Best Sellers Showcase */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#161214] border-b border-rose-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
                Customer Favourites
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                Our Best Sellers
              </h2>
              <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
                Customer favourites, beautifully baked and celebrated across Lagos.
              </p>
            </div>

            <Link
              to="/best-sellers"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:underline shrink-0 self-start sm:self-auto"
            >
              <span>Explore All Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Budget Section: Something Sweet for Every Budget */}
      <BudgetSection />

      {/* 5. Occasion Shopping */}
      <OccasionsSection />

      {/* 6. Corporate & Offices */}
      <CorporateSection />

      {/* 8. Brand Promise */}
      <BrandPromise />

      {/* 9. Reviews & Social Proof */}
      <ReviewsSection />

      {/* 10. Instagram Gallery */}
      <InstagramGallery />
    </div>
  );
};
