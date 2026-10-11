import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/format';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { isWishlisted, toggleWishlist, openQuickView, addToCart } = useApp();
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick add default base size and first flavour
    const defaultSize = product.sizes[0];
    const defaultFlavour = product.flavours[0];
    addToCart(product, defaultSize, defaultFlavour, '', '', 1);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      openQuickView(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white dark:bg-[#1A1A1F] rounded-2xl border border-rose-100 dark:border-rose-950/60 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Image Showcase */}
      <div className="relative aspect-4/5 sm:aspect-[4/4.8] w-full overflow-hidden bg-rose-50/40 dark:bg-stone-900 p-1 flex items-center justify-center">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            category={product.category}
            fallbackTitle={product.name}
            fitMode="auto"
            className="w-full h-full rounded-xl group-hover:scale-103 transition-transform duration-300"
          />
        </Link>

        {/* Discount Badge if applicable (excluding 11% off) */}
        {product.discount && product.discount !== 11 && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
              {product.discount}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 backdrop-blur-xs transition-colors shadow-xs"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Desktop Hover Quick View Overlay Button */}
        <button
          onClick={handleOpenQuickView}
          className="absolute bottom-2.5 right-2.5 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-200 hover:text-pink-600 dark:hover:text-pink-400 text-xs font-medium shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm sm:text-base line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row - fully displayed on mobile and tablets */}
        <div className="pt-2 border-t border-rose-50 dark:border-rose-950/40 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base lg:text-lg font-bold text-rose-950 dark:text-rose-100 tabular-nums tracking-tight">
                {formatNaira(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-[11px] sm:text-xs text-stone-400 line-through tabular-nums">
                  {formatNaira(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 self-end xs:self-auto">
            <button
              onClick={handleOpenQuickView}
              className="p-1.5 sm:p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              aria-label="Options"
              title="Customize"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors active:scale-95 whitespace-nowrap"
              aria-label={`Add ${product.name} to Cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
