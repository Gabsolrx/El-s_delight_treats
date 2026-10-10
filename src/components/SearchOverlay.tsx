import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatNaira } from '../utils/format';
import { SafeImage } from './SafeImage';

const QUICK_TAGS = [
  'Chocolate cake',
  'Birthday cake',
  'Wedding cake',
  'Cake under ₦20,000',
  'Red velvet',
  'Celebration cake',
];

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, closeSearch, products } = useApp();
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setFilteredProducts([]);
      return;
    }

    const matches = products.filter((p) => {
      // Under price check
      if (trimmed.includes('under') && (trimmed.includes('20,000') || trimmed.includes('20000') || trimmed.includes('20k'))) {
        return p.price <= 20000;
      }
      if (trimmed.includes('under') && (trimmed.includes('5,000') || trimmed.includes('5000') || trimmed.includes('5k'))) {
        return p.price <= 5000;
      }

      return (
        p.name.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.occasion.some((occ) => occ.toLowerCase().includes(trimmed)) ||
        p.flavours.some((f) => f.toLowerCase().includes(trimmed))
      );
    });

    setFilteredProducts(matches.slice(0, 8));
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (slug: string) => {
    closeSearch();
    navigate(`/product/${slug}`);
  };

  const handleQuickTagClick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/98 dark:bg-[#140F12]/98 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-4 flex items-center justify-between border-b border-rose-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-rose-950 dark:text-rose-100">
            Search El's Delight Treats
          </span>
        </div>
        <button
          onClick={closeSearch}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Search Input */}
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 overflow-y-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-pink-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cakes, flavours, occasions (e.g. Birthday, Red Velvet, Wedding)..."
            className="w-full pl-13 pr-10 py-4 text-base sm:text-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Tag Recommendations */}
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="px-3 py-1 text-xs rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/50 dark:border-rose-900/50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Results */}
        <div className="mt-8">
          {query.trim() && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Found {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
              </span>
              {filteredProducts.length > 0 && (
                <button
                  onClick={() => {
                    closeSearch();
                    navigate(`/shop?search=${encodeURIComponent(query)}`);
                  }}
                  className="text-xs text-pink-600 dark:text-pink-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View all in Shop <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {query.trim() && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              <p className="text-base font-semibold text-stone-700 dark:text-stone-300">
                No cakes found for "{query}"
              </p>
              <p className="text-sm text-stone-400 mt-1">
                Try searching for "Chocolate", "Birthday", "Wedding", or request a custom cake.
              </p>
              <button
                onClick={() => {
                  closeSearch();
                  navigate('/custom-cakes');
                }}
                className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold"
              >
                Create a Custom Cake Instead
              </button>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="cursor-pointer group p-3 rounded-xl border border-rose-100 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 rounded-lg overflow-hidden bg-rose-50 mb-2.5">
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      category={product.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-pink-600">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatNaira(product.price)}
                      </span>
                      <div className="flex items-center text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1 text-[11px] text-stone-600 dark:text-stone-300">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
