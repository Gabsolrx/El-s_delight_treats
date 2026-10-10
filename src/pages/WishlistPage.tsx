import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, products } = useApp();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="py-12 bg-[#FAF7F5] dark:bg-[#120F11] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-rose-950 flex items-center justify-center text-pink-600 mx-auto">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
            My Wishlist
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
            Saved cakes and sweet inspirations for upcoming birthdays, weddings, and anniversaries.
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#181316] rounded-3xl border border-rose-100 dark:border-stone-800 p-8 max-w-md mx-auto">
            <p className="text-stone-700 dark:text-stone-300 font-semibold text-sm">
              Your wishlist is empty
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Click the heart icon on any cake card to bookmark it for later.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold"
            >
              <span>Explore Cakes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
