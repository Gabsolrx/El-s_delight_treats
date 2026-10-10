import React from 'react';

interface SvgIconProps {
  className?: string;
}

/**
 * 1. Freshly Baked SVG Icon
 * Artisanal bakery cloche dome with rising aromatic warmth waves and fresh oven baking loaf.
 */
export const FreshlyBakedSvg: React.FC<SvgIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cloche Dome / Oven Heat Base */}
    <path
      d="M4 25H28C28 25 28 27 26 27H6C4 27 4 25 4 25Z"
      className="fill-current/15 stroke-current"
    />
    <path
      d="M5 23C5 14.5 10 9 16 9C22 9 27 14.5 27 23H5Z"
      className="fill-current/10 stroke-current"
    />
    {/* Cloche Top Knob */}
    <circle cx="16" cy="6.5" r="2.5" className="fill-current/20 stroke-current" />
    {/* Rising Aromatic Heat / Steam Waves */}
    <path d="M12 15C12 17 13 18 13 19" stroke="currentColor" strokeDasharray="1 1.5" />
    <path d="M16 13C16 16 17 17 17 19" stroke="currentColor" strokeDasharray="1 1.5" />
    <path d="M20 15C20 17 21 18 21 19" stroke="currentColor" strokeDasharray="1 1.5" />
  </svg>
);

/**
 * 2. Quality Ingredients SVG Icon
 * Artisan pastry whisk and organic wheat sheaf / cocoa bean botanicals.
 */
export const QualityIngredientsSvg: React.FC<SvgIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Confectionery Whisk Head */}
    <path
      d="M16 4C12 4 9 9 9 14.5C9 18 11.5 20.5 14.5 21.5V28H17.5V21.5C20.5 20.5 23 18 23 14.5C23 9 20 4 16 4Z"
      className="fill-current/10 stroke-current"
    />
    {/* Whisk Wires Loop */}
    <path d="M16 4V21.5" stroke="currentColor" />
    <path d="M12.5 7.5C14.5 12 14.5 16 13 20" stroke="currentColor" />
    <path d="M19.5 7.5C17.5 12 17.5 16 19 20" stroke="currentColor" />
    {/* Whisk Handle Grip */}
    <line x1="14" y1="24.5" x2="18" y2="24.5" stroke="currentColor" />
    {/* Organic Botanical Star / Quality Flourish */}
    <path
      d="M26 6L26.8 8.2L29 9L26.8 9.8L26 12L25.2 9.8L23 9L25.2 8.2L26 6Z"
      className="fill-current stroke-current"
      strokeWidth="0.5"
    />
    <path
      d="M6 10L6.5 11.5L8 12L6.5 12.5L6 14L5.5 12.5L4 12L5.5 11.5L6 10Z"
      className="fill-current stroke-current"
      strokeWidth="0.5"
    />
  </svg>
);

/**
 * 3. Beautiful Designs SVG Icon
 * Artisan pastry piping bag finishing a delicate rosette swirl on a cake tier.
 */
export const BeautifulDesignsSvg: React.FC<SvgIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pastry Piping Bag Cone */}
    <path
      d="M7 6L25 11C25 11 20 21 16 23L13 20L7 6Z"
      className="fill-current/10 stroke-current"
    />
    {/* Piping Bag Top Hem */}
    <path d="M6 5L8 7" stroke="currentColor" />
    {/* Piping Metal Tip / Nozzle */}
    <path d="M14.5 21.5L12 25.5L11 24.5L13.5 20.5" className="fill-current/25 stroke-current" />
    {/* Delicate Swirling Buttercream Rosette */}
    <path
      d="M10 26.5C8.5 26.5 7.5 27.5 8 28.5C8.5 29.5 10.5 29.5 11.5 28.5C12.5 27.5 11.5 26.5 10 26.5Z"
      className="fill-current/30 stroke-current"
    />
    {/* Decorative Sparkle Flourishes */}
    <path
      d="M25 19L25.7 20.8L27.5 21.5L25.7 22.2L25 24L24.3 22.2L22.5 21.5L24.3 20.8L25 19Z"
      className="fill-current stroke-current"
      strokeWidth="0.5"
    />
  </svg>
);

/**
 * 4. Reliable Service SVG Icon
 * Shield of trust with verified checkmark and punctual clock / timely bell.
 */
export const ReliableServiceSvg: React.FC<SvgIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Trust & Safe Transit Shield */}
    <path
      d="M16 4L26 8V16C26 22 21.5 26.5 16 28C10.5 26.5 6 22 6 16V8L16 4Z"
      className="fill-current/10 stroke-current"
    />
    {/* Inner Punctual Clock Circle */}
    <circle cx="16" cy="16" r="6" className="fill-current/15 stroke-current" />
    {/* Clock Hands showing punctuality */}
    <path d="M16 13V16.5L18.5 18" stroke="currentColor" strokeWidth="2" />
    {/* Trust Checkmark Badge */}
    <circle cx="23" cy="9" r="3" className="fill-emerald-500 stroke-white dark:stroke-stone-900" strokeWidth="1.5" />
    <path d="M21.8 9L22.6 9.8L24.2 8.2" stroke="white" strokeWidth="1.2" />
  </svg>
);

/**
 * 5. Made for Your Moment SVG Icon
 * Two-tiered celebration cake with glowing candle and celebratory heart.
 */
export const MadeForYourMomentSvg: React.FC<SvgIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Bottom Cake Tier */}
    <rect x="5" y="19" width="22" height="8" rx="2" className="fill-current/10 stroke-current" />
    {/* Top Cake Tier */}
    <rect x="9" y="12" width="14" height="7" rx="2" className="fill-current/15 stroke-current" />
    {/* Tier Frosting Drips */}
    <path d="M5 22C7 22 7 24 9 24C11 24 11 22 13 22C15 22 15 24 17 24C19 24 19 22 21 22C23 22 23 24 25 24C27 24 27 22 27 22" stroke="currentColor" strokeWidth="1.2" />
    {/* Milestone Celebration Candle */}
    <line x1="16" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="2" />
    {/* Flame with Warm Glow */}
    <path
      d="M16 4C14.5 5.8 14.5 6.8 16 8C17.5 6.8 17.5 5.8 16 4Z"
      className="fill-amber-400 stroke-amber-500"
      strokeWidth="1.2"
    />
    {/* Sweet Celebration Mini Heart Accent */}
    <path
      d="M24 6.5C24 5.4 24.9 4.5 26 4.5C27.1 4.5 28 5.4 28 6.5C28 8.2 26 9.8 26 9.8C26 9.8 24 8.2 24 6.5Z"
      className="fill-current stroke-current"
      strokeWidth="0.8"
    />
  </svg>
);

/**
 * Universal resolver for SVG icons based on icon name, ID, or title
 */
export const getPromiseSvgIcon = (iconName?: string, id?: string, title?: string) => {
  const key = (iconName || id || title || '').toLowerCase();

  if (key.includes('flame') || key.includes('fresh') || key.includes('bake') || key.includes('prom-1')) {
    return FreshlyBakedSvg;
  }
  if (key.includes('award') || key.includes('quality') || key.includes('ingredient') || key.includes('prom-2')) {
    return QualityIngredientsSvg;
  }
  if (key.includes('palette') || key.includes('design') || key.includes('beautiful') || key.includes('prom-3')) {
    return BeautifulDesignsSvg;
  }
  if (key.includes('shield') || key.includes('reliable') || key.includes('service') || key.includes('prom-4')) {
    return ReliableServiceSvg;
  }
  if (key.includes('heart') || key.includes('moment') || key.includes('celebrat') || key.includes('prom-5')) {
    return MadeForYourMomentSvg;
  }

  return FreshlyBakedSvg;
};
