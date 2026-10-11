import React from 'react';
import { Filter, X, RotateCcw, Search } from 'lucide-react';
import { OccasionType } from '../types';
import { useApp } from '../context/AppContext';

export interface FilterState {
  searchQuery: string;
  category: string;
  occasion: string;
  priceRange: string;
  flavour: string;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const { categories: appCategories } = useApp();

  const categories: string[] = [
    'All Categories',
    ...appCategories.map((c) => c.name),
  ];

  const occasions: (OccasionType | 'All Occasions')[] = [
    'All Occasions',
    'Birthday',
    'Wedding',
    'Anniversary',
    'Baby Shower',
    'Naming Ceremony',
    'Graduation',
    'Corporate',
    'Valentine',
    'Mother\'s Day',
    'Father\'s Day',
    'Christmas',
    'Church',
    'School',
  ];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₦5,000', value: 'under-5k' },
    { label: '₦5,000 – ₦10,000', value: '5k-10k' },
    { label: '₦10,000 – ₦20,000', value: '10k-20k' },
    { label: '₦20,000 – ₦40,000', value: '20k-40k' },
    { label: '₦40,000 – ₦80,000', value: '40k-80k' },
    { label: '₦80,000+', value: '80k-plus' },
  ];

  const flavours = [
    'All Flavours',
    'Rich Chocolate Ganache',
    'Vanilla Buttercream',
    'Velvet Red Velvet',
    'Fresh Strawberry Cream',
    'Toasted Coconut',
    'Spiced Carrot & Walnut',
    'Marble Swirl',
    'Salted Caramel',
  ];

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Best Selling', value: 'best-selling' },
    { label: 'Most Popular', value: 'rating' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  const activeFiltersCount =
    (filters.category !== 'All Categories' && filters.category ? 1 : 0) +
    (filters.occasion !== 'All Occasions' && filters.occasion ? 1 : 0) +
    (filters.priceRange !== 'all' && filters.priceRange ? 1 : 0) +
    (filters.flavour !== 'All Flavours' && filters.flavour ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Top Search & Sort Control Bar */}
      <div className="bg-white dark:bg-[#18181C] p-4 rounded-2xl border border-rose-100 dark:border-rose-950/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="What are you craving?"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Sort & Mobile Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen((prev) => !prev)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 dark:bg-rose-950/40 text-pink-700 dark:text-pink-300 text-xs font-semibold border border-rose-200 dark:border-rose-900"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      {/* Desktop Filter Row / Ribbon */}
      <div className={`space-y-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-white dark:bg-[#18181C] p-4 sm:p-5 rounded-2xl border border-rose-100 dark:border-rose-950/60 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Occasion
              </label>
              <select
                value={filters.occasion}
                onChange={(e) => onFilterChange({ ...filters, occasion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => onFilterChange({ ...filters, priceRange: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Flavour Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Flavour
              </label>
              <select
                value={filters.flavour}
                onChange={(e) => onFilterChange({ ...filters, flavour: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {flavours.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Active Filters Badges & Reset */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t border-rose-50 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-stone-500">Active filters:</span>
                {filters.category !== 'All Categories' && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center gap-1">
                    {filters.category}
                    <button onClick={() => onFilterChange({ ...filters, category: 'All Categories' })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.occasion !== 'All Occasions' && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center gap-1">
                    {filters.occasion}
                    <button onClick={() => onFilterChange({ ...filters, occasion: 'All Occasions' })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.priceRange !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center gap-1">
                    {priceRanges.find((p) => p.value === filters.priceRange)?.label}
                    <button onClick={() => onFilterChange({ ...filters, priceRange: 'all' })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.flavour !== 'All Flavours' && (
                  <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center gap-1">
                    {filters.flavour}
                    <button onClick={() => onFilterChange({ ...filters, flavour: 'All Flavours' })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={onReset}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
