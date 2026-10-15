export interface ProductSize {
  name: string; // e.g. "6 inch (feeds 6-8)", "8 inch (feeds 12-16)"
  label: string;
  priceModifier: number; // multiplier or fallback
  isBase?: boolean;
  price?: number; // explicit price in NGN
}

export type CakeFlavour = 
  | 'Vanilla Buttercream'
  | 'Rich Chocolate Ganache'
  | 'Velvet Red Velvet'
  | 'Fresh Strawberry Cream'
  | 'Toasted Coconut'
  | 'Spiced Carrot & Walnut'
  | 'Zesty Lemon Curd'
  | 'Marble Swirl'
  | 'Salted Caramel';

export type CakeCategory =
  | 'Birthday Cakes'
  | 'Wedding Cakes'
  | 'Anniversary Cakes'
  | 'Corporate/Office Cakes'
  | 'Graduation Cakes'
  | 'Graduation'
  | 'Christmas Cakes'
  | 'Baby Shower Cakes'
  | 'Baby Shower'
  | 'Custom Cakes'
  | (string & {});

export interface CategoryItem {
  id?: string;
  name: string;
  label: string;
  count?: string;
  image: string;
  slug?: string;
  description?: string;
}

export type OccasionType =
  | 'Birthday'
  | 'Wedding'
  | 'Anniversary'
  | 'Baby Shower'
  | 'Naming Ceremony'
  | 'Graduation'
  | 'Corporate'
  | 'Valentine'
  | 'Mother\'s Day'
  | 'Father\'s Day'
  | 'Christmas'
  | 'Church'
  | 'School'
  | 'General';

export type BudgetTier = 'budget-under-5k' | 'budget-10k-40k' | 'budget-80k-plus';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription?: string;
  category: CakeCategory;
  occasion: OccasionType[];
  price: number; // Base price in NGN
  oldPrice?: number;
  discount?: number; // e.g. 15%
  images: string[];
  imagePlaceholderColor?: string;
  flavours: CakeFlavour[];
  sizes: ProductSize[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  budgetRange: 'Under ₦5,000' | '₦5,000–₦10,000' | '₦10,000–₦20,000' | '₦20,000–₦40,000' | '₦40,000–₦80,000' | '₦80,000+';
  preparationTime: string; // e.g. "Same-day available" or "24 hours notice"
  tag?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (productId + size + flavour + message)
  productId: string;
  product: Product;
  selectedSize: ProductSize;
  selectedFlavour: CakeFlavour;
  cakeMessage: string;
  specialInstructions?: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryMethodOption {
  id: string;
  name: string;
  description: string;
  pricingNote: string;
  isPickup?: boolean;
  enabled: boolean;
  iconType?: 'uber' | 'bolt' | 'pickup' | 'dispatch' | 'driver' | 'interstate' | string;
}

export interface OrderCustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryMethod?: string;
  deliveryMethodId?: string;
  address?: string;
  area?: string;
  landmark?: string;
  deliveryDate: string;
  deliveryTime: string;
  specialInstructions?: string;
}

export type OrderStatus =
  | 'pending_payment_verification'
  | 'confirmed'
  | 'baking'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface StoredOrder {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  customer: OrderCustomerDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  adminNotes?: string;
}

export interface CustomCakeFormData {
  fullName: string;
  phone: string;
  email: string;
  occasion: string;
  cakeSize: string;
  flavour: string;
  colourTheme: string;
  themeDescription: string;
  tiers: string;
  cakeMessage: string;
  budgetRange: string;
  preferredDate: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryMethod?: string;
  deliveryArea: string;
  specialInstructions: string;
  referenceUrl?: string;
}

export interface CustomCakeInquiry {
  id: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'quoted' | 'deposit_paid' | 'completed';
  data: CustomCakeFormData;
  adminNotes?: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  occasion: string;
  rating: number;
  date: string;
  text: string;
  productName: string;
  verified: boolean;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  link: string;
  linkText: string;
  enabled: boolean;
  external?: boolean;
  iconType?: 'freshly_baked' | 'delivery' | 'whatsapp' | 'heart' | string;
  imageUrl?: string;
}

export interface BrandPromiseItem {
  id: string;
  title: string;
  desc: string;
  iconName?: string;
}

export interface SiteHeroContent {
  kicker: string;
  headline: string;
  supportingCopy: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  customCakeCtaText: string;
  badge1: string;
  badge2: string;
  badge3: string;
  // Featured Today Cake (Right Column)
  showFeaturedCake?: boolean;
  featuredCakeImage?: string;
  featuredCakeTitle?: string;
  featuredCakePrice?: string;
  featuredCakeTag?: string;
  featuredCakeRating?: string;
  featuredCakeSubtitle?: string;
}

export interface SiteAboutValue {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

export interface SiteAboutContent {
  headline: string;
  tagline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  founderName: string;
  founderRole: string;
  imageUrl?: string;
  values?: SiteAboutValue[];
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  category?: string;
}

export interface CorporatePerkItem {
  id: string;
  title: string;
  desc: string;
}

export interface SiteCorporateContent {
  headline: string;
  subheadline: string;
  intro: string;
  perks: CorporatePerkItem[];
}

export interface SiteOccasionItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}

export interface SiteOccasionsContent {
  badge: string;
  headline: string;
  viewAllText: string;
  items: SiteOccasionItem[];
}

export interface SiteGalleryItem {
  id?: string;
  image: string;
  tag: string;
  likes: string;
  category: string;
}

export interface SiteGalleryContent {
  badge?: string;
  headline: string;
  subtitle: string;
  buttonText: string;
  buttonUrl?: string;
  items: SiteGalleryItem[];
}

export interface SiteBudgetTierItem {
  id: string; // 'petite' | 'celebration' | 'luxury'
  badge?: string;
  eyebrow: string;
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
}

export interface SiteBudgetSectionContent {
  badge?: string;
  headline: string;
  subtitle: string;
  tier1: SiteBudgetTierItem;
  tier2: SiteBudgetTierItem;
  tier3: SiteBudgetTierItem;
}

export interface CustomColorPalette {
  id: string;
  name: string;
  colors: string[];
  description?: string;
  previewImage?: string;
}

export interface CustomPageConfig {
  badge?: string;
  headline?: string;
  subtitle?: string;
  flavors: string[];
  colorPalettes?: CustomColorPalette[];
  cakeSizes?: string[];
  occasions?: string[];
  tiers?: string[];
  budgetRanges?: string[];
}

export interface SiteContent {
  hero: SiteHeroContent;
  announcements: AnnouncementItem[];
  brandPromises: BrandPromiseItem[];
  about: SiteAboutContent;
  faqs?: FaqItem[];
  corporate?: SiteCorporateContent;
  occasionsSection?: SiteOccasionsContent;
  sweetMoments?: SiteGalleryContent;
  budgetSection?: SiteBudgetSectionContent;
  customPage?: CustomPageConfig;
}

export interface LogoSettings {
  mode: 'default' | 'custom';
  customUrl?: string; // Base64 data URL or remote image URL
  alt?: string;
  shape?: 'transparent' | 'rounded' | 'circle' | 'card';
  sizePreset?: 'compact' | 'standard' | 'prominent';
  showWordmark?: boolean;
  wordmarkText?: string;
  wordmarkSubtext?: string;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  type: string;
  address: string;
  pickupNote: string;
  phone: string;
  whatsappNumber: string;
  whatsappUrlNumber: string;
  email: string;
  instagram: string;
  instagramUrl?: string;
  facebook?: string;
  facebookUrl?: string;
  logo?: LogoSettings;
  logoUrl?: string;
  logoType?: 'default' | 'custom';
  payment: {
    bank: string;
    accountName: string;
    accountNumber: string;
  };
  openingHours: string;
  deliveryFeeFlat?: number;
  freeDeliveryThreshold?: number;
  deliveryPolicyNotice?: string;
  deliveryMethods?: DeliveryMethodOption[];
}
