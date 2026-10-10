import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProductFilters, FilterState } from '../components/ProductFilters';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Shop: React.FC = () => {
  const { products, categories: appCategories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => {
    const rawCategory = searchParams.get('category');
    const rawOccasion = searchParams.get('occasion');
    return {
      searchQuery: searchParams.get('search') || '',
      category: rawCategory || 'All Categories',
      occasion: rawOccasion || 'All Occasions',
      priceRange: searchParams.get('price') || 'all',
      flavour: searchParams.get('flavour') || 'All Flavours',
      sortBy: searchParams.get('sort') || 'featured',
    };
  });

  // Sync URL search params with state
  useEffect(() => {
    const rawCategory = searchParams.get('category');
    const rawOccasion = searchParams.get('occasion');
    const newPrice = searchParams.get('price');
    const newSearch = searchParams.get('search');

    let resolvedCategory = rawCategory;
    if (resolvedCategory) {
      const match = appCategories.find(
        (c) =>
          c.name.toLowerCase() === resolvedCategory?.toLowerCase() ||
          c.name.toLowerCase().replace(/ cakes?$/i, '') ===
            resolvedCategory?.toLowerCase().replace(/ cakes?$/i, '')
      );
      if (match) {
        resolvedCategory = match.name;
      }
    } else if (rawOccasion) {
      const occLower = rawOccasion.toLowerCase();
      if (occLower.includes('wedding')) resolvedCategory = 'Wedding Cakes';
      else if (occLower.includes('birthday')) resolvedCategory = 'Birthday Cakes';
      else if (occLower.includes('anniversary')) resolvedCategory = 'Anniversary Cakes';
      else if (occLower.includes('christmas')) resolvedCategory = 'Christmas Cakes';
      else if (occLower.includes('graduation')) resolvedCategory = 'Graduation Cakes';
      else if (occLower.includes('corporate') || occLower.includes('office')) resolvedCategory = 'Corporate/Office Cakes';
      else if (occLower.includes('baby')) resolvedCategory = 'Baby Shower Cakes';
    }

    setFilters((prev) => ({
      ...prev,
      category: resolvedCategory || (searchParams.has('category') ? 'All Categories' : prev.category),
      // When category is specified, clear any previous occasion filter so only cakes in that category are shown
      occasion: rawCategory ? 'All Occasions' : (rawOccasion || (searchParams.has('occasion') ? 'All Occasions' : prev.occasion)),
      priceRange: newPrice || (searchParams.has('price') ? 'all' : prev.priceRange),
      searchQuery: newSearch !== null ? newSearch : (searchParams.has('search') ? '' : prev.searchQuery),
    }));
  }, [searchParams, appCategories]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    const params: Record<string, string> = {};
    if (newFilters.category !== 'All Categories') params.category = newFilters.category;
    if (newFilters.occasion !== 'All Occasions') params.occasion = newFilters.occasion;
    if (newFilters.priceRange !== 'all') params.price = newFilters.priceRange;
    if (newFilters.flavour !== 'All Flavours') params.flavour = newFilters.flavour;
    if (newFilters.searchQuery) params.search = newFilters.searchQuery;
    if (newFilters.sortBy !== 'featured') params.sort = newFilters.sortBy;
    setSearchParams(params);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      searchQuery: '',
      category: 'All Categories',
      occasion: 'All Occasions',
      priceRange: 'all',
      flavour: 'All Flavours',
      sortBy: 'featured',
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesFlavour = product.flavours.some((f) => f.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesFlavour) {
          return false;
        }
      }

      // 2. Category - Strictly match cakes whose category equals or contains the selected category
      if (filters.category !== 'All Categories') {
        const normFilter = filters.category.toLowerCase().replace(/s$/, '').replace(/[/_ -]/g, '');
        const normCat = (product.category || '').toLowerCase().replace(/s$/, '').replace(/[/_ -]/g, '');
        const filterLower = filters.category.toLowerCase();
        const catLower = (product.category || '').toLowerCase();

        const matchesCategory =
          normCat === normFilter ||
          catLower === filterLower ||
          (filterLower.includes('wedding') && catLower.includes('wedding')) ||
          (filterLower.includes('birthday') && catLower.includes('birthday')) ||
          (filterLower.includes('anniversary') && catLower.includes('anniversary')) ||
          (filterLower.includes('christmas') && catLower.includes('christmas')) ||
          (filterLower.includes('graduation') && catLower.includes('graduation')) ||
          ((filterLower.includes('corporate') || filterLower.includes('office')) &&
            (catLower.includes('corporate') || catLower.includes('office'))) ||
          (filterLower.includes('custom') && catLower.includes('custom')) ||
          (filterLower.includes('baby') && catLower.includes('baby'));

        if (!matchesCategory) return false;
      }

      // 3. Occasion (only applies when specifically browsing by Occasion without a category override)
      if (filters.occasion !== 'All Occasions' && filters.category === 'All Categories') {
        if (!product.occasion.includes(filters.occasion as any)) return false;
      }

      // 4. Price range
      if (filters.priceRange !== 'all') {
        if (filters.priceRange === 'under-5k' && product.price >= 5000) return false;
        if (filters.priceRange === '5k-10k' && (product.price < 5000 || product.price > 10000)) return false;
        if (filters.priceRange === '10k-20k' && (product.price < 10000 || product.price > 20000)) return false;
        if (filters.priceRange === '20k-40k' && (product.price < 20000 || product.price > 40000)) return false;
        if (filters.priceRange === '40k-80k' && (product.price < 40000 || product.price > 80000)) return false;
        if (filters.priceRange === '80k-plus' && product.price < 80000) return false;
      }

      // 5. Flavour
      if (filters.flavour !== 'All Flavours') {
        if (!product.flavours.includes(filters.flavour as any)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'best-selling') return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      return 0; // default featured order
    });
  }, [filters, products]);

  return (
    <div className="py-10 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Freshly Baked in Lagos
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Shop All Cakes & Treats
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            “Find something beautiful for every celebration.”
          </p>
        </div>

        {/* Filter Controls */}
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          totalResults={filteredProducts.length}
        />

        {/* Products Results Header */}
        <div className="flex items-center justify-between text-xs text-stone-500 border-b border-rose-100 dark:border-stone-800 pb-2">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{filteredProducts.length}</strong> cakes and treats
          </span>
          {filters.category !== 'All Categories' && (
            <span className="font-semibold text-pink-600 dark:text-pink-400">
              Filter: {filters.category}
            </span>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 p-8">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto text-rose-400 dark:text-rose-500 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              No matching cakes found
            </h3>
            <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
              We couldn't find any cakes matching your selected filters. Try clearing some options or explore our custom cake builder.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
