import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  Product,
  CartItem,
  ProductSize,
  CakeFlavour,
  StoredOrder,
  OrderStatus,
  CustomCakeFormData,
  CustomCakeInquiry,
  ReviewItem,
  AnnouncementItem,
  SiteContent,
  BusinessInfo,
  FaqItem,
  LogoSettings,
  CategoryItem,
  CustomColorPalette,
  CustomPageConfig,
} from '../types';
import { PRODUCTS, TESTIMONIALS, CATEGORIES_LIST } from '../data/products';
import {
  DEFAULT_BUSINESS_INFO,
  DEFAULT_SITE_CONTENT,
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_DELIVERY_POLICY_NOTICE,
  DEFAULT_CUSTOM_FLAVORS,
  DEFAULT_COLOR_PALETTES,
  DEFAULT_CUSTOM_PAGE_CONFIG,
} from '../data/defaultSiteContent';
import { INITIAL_DEMO_ORDERS, INITIAL_DEMO_INQUIRIES } from '../data/defaultAdminData';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  safeJsonParse,
  idbGet,
  idbSet,
  idbDelete,
  sanitizeOrderForStorage,
} from '../utils/safeStorage';

const VERIFIED_CHRISTMAS_CAKE_IMG =
  'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&crop=center&w=1000&h=1000&q=85';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  hideIcon?: boolean;
}

interface AppContextType {
  // Store dynamic data (editable from Admin)
  products: Product[];
  businessInfo: BusinessInfo;
  siteContent: SiteContent;
  orders: StoredOrder[];
  customInquiries: CustomCakeInquiry[];
  reviews: ReviewItem[];

  // Admin Auth & Controls
  isAdmin: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  adminPin: string;
  updateAdminPin: (newPin: string) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<boolean>;
  duplicateProduct: (id: string) => Product | null;
  resetProductsToDefault: () => void;

  // Categories Management
  categories: CategoryItem[];
  addCategory: (category: CategoryItem) => void;
  removeCategory: (categoryName: string, reassignTo?: string) => Promise<void>;
  updateCategory: (categoryName: string, updates: Partial<CategoryItem>) => void;
  resetCategoriesToDefault: () => void;

  // Business & Payment Info
  updateBusinessInfo: (updates: Partial<BusinessInfo>) => void;
  updateLogoSettings: (updates: Partial<LogoSettings>) => void;
  resetLogoToDefault: () => void;

  // Site Content & Banners
  updateSiteContent: (updates: Partial<SiteContent>) => void;
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id'>) => void;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => void;
  deleteAnnouncement: (id: string) => void;
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;

  // Custom Bespoke Cake Page & Flavors
  addCustomFlavor: (flavor: string) => void;
  deleteCustomFlavor: (flavor: string) => void;
  resetCustomFlavors: () => void;
  addCustomColorPalette: (palette: CustomColorPalette) => void;
  deleteCustomColorPalette: (paletteId: string) => void;
  resetCustomColorPalettes: () => void;
  updateCustomPageConfig: (updates: Partial<CustomPageConfig>) => void;

  // Orders Management
  saveOrder: (order: StoredOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;

  // Custom Inquiries Management
  addCustomInquiry: (formData: CustomCakeFormData) => CustomCakeInquiry;
  updateInquiryStatus: (id: string, status: CustomCakeInquiry['status'], adminNotes?: string) => void;
  deleteInquiry: (id: string) => void;
  clearAllInquiries: () => void;

  // Reviews Management
  addReview: (review: Omit<ReviewItem, 'id'>) => void;
  updateReview: (id: string, updates: Partial<ReviewItem>) => void;
  deleteReview: (id: string) => void;

  // Global Backup & Reset
  exportAllStoreData: () => string;
  importStoreData: (jsonStr: string) => boolean;
  resetAllToFactoryDefaults: () => void;

  // Supabase Backend Sync
  isSupabaseReady: boolean;
  syncWithSupabase: () => Promise<void>;
  syncProductsToSupabase: () => Promise<void>;
  syncOrdersToSupabase: () => Promise<void>;
  syncInquiriesToSupabase: () => Promise<void>;
  syncCategoriesToSupabase: () => Promise<void>;
  syncReviewsToSupabase: () => Promise<void>;
  syncSettingsToSupabase: () => Promise<void>;
  purgeSupabaseDeletedData: (options?: { silent?: boolean }) => Promise<void>;
  saveAllDataToSupabase: (options?: { silent?: boolean }) => Promise<void>;
  loadAllDataFromSupabase: (options?: { silent?: boolean }) => Promise<{ success: boolean; message?: string; error?: string }>;
  getTableLiveCounts: () => Promise<any>;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    selectedSize: ProductSize,
    selectedFlavour: CakeFlavour,
    cakeMessage?: string,
    specialInstructions?: string,
    quantity?: number
  ) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  recentlyViewedProducts: Product[];

  // Quick View
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Search Overlay
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (
    title: string,
    description?: string,
    type?: 'success' | 'info' | 'warning' | 'error',
    hideIcon?: boolean
  ) => void;
  dismissToast: (id: string) => void;

  // Order
  currentOrder: StoredOrder | null;
  setCurrentOrder: (order: StoredOrder | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // -------------------------------------------------------------
  // 1. PRODUCTS STATE (with localStorage persistence)
  // -------------------------------------------------------------
  const hasLoadedIdb = useRef(false);
  const hasLoadedSupabase = useRef(false);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedDeleted = safeGetItem('els_deleted_product_ids');
      const deletedIds = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);

      const isPermanentlyDeleted = (p: { id: string }) =>
        deletedIds.has(p.id) || p.id === 'prod-12' || p.id === 'prod-13';

      let dedicatedProductImg = safeGetItem('els_christmas_cake_image');
      if (dedicatedProductImg && dedicatedProductImg.includes('photo-1512485800893-b097b693b169')) {
        dedicatedProductImg = VERIFIED_CHRISTMAS_CAKE_IMG;
        safeSetItem('els_christmas_cake_image', VERIFIED_CHRISTMAS_CAKE_IMG);
      }

      const dedicatedWeddingImg = safeGetItem('els_wedding_cake_image');

      const sanitizeImages = (images?: string[]) => {
        if (!images || images.length === 0) return [VERIFIED_CHRISTMAS_CAKE_IMG];
        return images.map((img) =>
          typeof img === 'string' && img.includes('photo-1512485800893-b097b693b169')
            ? VERIFIED_CHRISTMAS_CAKE_IMG
            : img
        );
      };

      const saved = safeGetItem('els_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (p) =>
              !isPermanentlyDeleted(p) &&
              p.id !== 'prod-10' &&
              p.id !== 'prod-12' &&
              p.id !== 'prod-13' &&
              p.category !== 'Cake Slices'
          );

          // Deduplicate by ID
          const seenIds = new Set<string>();
          const deduplicated: Product[] = [];

          for (const item of filtered) {
            if (isPermanentlyDeleted(item)) continue;
            if (seenIds.has(item.id)) continue;
            seenIds.add(item.id);
            deduplicated.push(item);
          }

          return deduplicated.map((p) => {
            const cleanCategory = (p.category === 'Classic Cakes' || p.category === 'Classic') ? 'Birthday Cakes' : p.category;
            const isChristmas =
              p.id === 'prod-christmas' ||
              (cleanCategory && cleanCategory.toLowerCase().includes('christmas'));
            if (isChristmas) {
              const effectiveImg =
                dedicatedProductImg ||
                sanitizeImages(p.images)[0] ||
                VERIFIED_CHRISTMAS_CAKE_IMG;
              const sanitized = sanitizeImages(p.images);
              const remaining = sanitized.filter((img: string) => img !== effectiveImg);
              return { ...p, category: cleanCategory, images: [effectiveImg, ...remaining] };
            }

            const isWedding =
              p.id === 'prod-16' ||
              (p.name && p.name.toLowerCase().includes('luxury wedding')) ||
              p.slug === 'luxury-wedding-cake';
            if (isWedding) {
              if (dedicatedWeddingImg && (!p.images || p.images.length === 0)) {
                return { ...p, category: cleanCategory, images: [dedicatedWeddingImg] };
              }
              return { ...p, category: cleanCategory };
            }
            return { ...p, category: cleanCategory };
          });
        }
      }

      const initialProducts = PRODUCTS.filter((p) => !isPermanentlyDeleted(p));
      return initialProducts.map((p) => {
        const cleanCategory = (p.category === 'Classic Cakes' || p.category === 'Classic') ? 'Birthday Cakes' : p.category;
        if (p.id === 'prod-christmas' || (cleanCategory && cleanCategory.toLowerCase().includes('christmas'))) {
          const effectiveImg = dedicatedProductImg || VERIFIED_CHRISTMAS_CAKE_IMG;
          const remaining = (p.images || []).filter((img: string) => img !== effectiveImg);
          return { ...p, category: cleanCategory, images: [effectiveImg, ...remaining] };
        }
        const isWedding =
          p.id === 'prod-16' ||
          (p.name && p.name.toLowerCase().includes('luxury wedding')) ||
          p.slug === 'luxury-wedding-cake';
        if (isWedding && dedicatedWeddingImg && (!p.images || p.images.length === 0)) {
          return { ...p, category: cleanCategory, images: [dedicatedWeddingImg] };
        }
        return { ...p, category: cleanCategory };
      });
    } catch (e) {
      console.warn('Error loading products from storage:', e);
    }
    return PRODUCTS;
  });

  useEffect(() => {
    safeSetItem('els_products', JSON.stringify(products));
    // Guard against overwriting IndexedDB's full-resolution images on initial mount
    if (hasLoadedIdb.current) {
      idbSet('els_products', products);
    }
  }, [products]);

  // -------------------------------------------------------------
  // 1B. CATEGORIES STATE (with localStorage persistence)
  // -------------------------------------------------------------
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      let dedicatedCatImg = safeGetItem('els_christmas_category_image');
      if (dedicatedCatImg && dedicatedCatImg.includes('photo-1512485800893-b097b693b169')) {
        dedicatedCatImg = VERIFIED_CHRISTMAS_CAKE_IMG;
        safeSetItem('els_christmas_category_image', VERIFIED_CHRISTMAS_CAKE_IMG);
      }

      const saved = safeGetItem('els_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (c) =>
              c.name !== 'Bento Cakes' &&
              c.name !== 'Cupcakes' &&
              c.name !== 'Gift Boxes' &&
              c.name !== 'Dessert Boxes' &&
              c.name !== 'Cake Slices' &&
              c.slug !== 'cake-slices' &&
              c.name !== 'Classic Cakes' &&
              c.slug !== 'classic-cakes' &&
              c.name.toLowerCase() !== 'classic' &&
              c.slug.toLowerCase() !== 'classic'
          );
          const savedDeletedCats = safeGetItem('els_deleted_category_names');
          const deletedCatNames = new Set<string>(savedDeletedCats ? JSON.parse(savedDeletedCats).map((n: string) => n.toLowerCase()) : []);
          const existingNames = new Set(filtered.map((c) => c.name.toLowerCase()));
          const missingDefaults = CATEGORIES_LIST.filter(
            (def) => !existingNames.has(def.name.toLowerCase()) && !deletedCatNames.has(def.name.toLowerCase())
          );
          let currentList = filtered;
          if (missingDefaults.length > 0) {
            const customIndex = filtered.findIndex((c) => c.name.toLowerCase() === 'custom cakes');
            if (customIndex !== -1) {
              currentList = [
                ...filtered.slice(0, customIndex),
                ...missingDefaults,
                ...filtered.slice(customIndex),
              ];
            } else {
              currentList = [...filtered, ...missingDefaults];
            }
          }
          return currentList.map((c) => {
            if (c.name.toLowerCase().includes('christmas')) {
              if (dedicatedCatImg) {
                return { ...c, image: dedicatedCatImg };
              }
              // Preserve the user's saved/uploaded image! Never overwrite with default if an image is present!
              if (c.image && !c.image.includes('photo-1512485800893-b097b693b169')) return c;
              return { ...c, image: VERIFIED_CHRISTMAS_CAKE_IMG };
            }
            if (!c.image) {
              const def = CATEGORIES_LIST.find((item) => item.name.toLowerCase() === c.name.toLowerCase());
              if (def?.image) return { ...c, image: def.image };
            }
            return c;
          });
        }
      }
    } catch (e) {
      console.warn('Error loading categories from storage:', e);
    }
    const dedicatedCatImg = safeGetItem('els_christmas_category_image') || VERIFIED_CHRISTMAS_CAKE_IMG;
    return CATEGORIES_LIST.map((c) => {
      if (c.name.toLowerCase().includes('christmas')) {
        return { ...c, image: dedicatedCatImg };
      }
      return c;
    });
  });

  useEffect(() => {
    safeSetItem('els_categories', JSON.stringify(categories));
    idbSet('els_categories', categories);
  }, [categories]);

  // Synchronize IndexedDB stored high-res photos and deletion records on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // 1. Load permanent deletions from IndexedDB
        const [idbDeletedIds, idbDeletedCategories] = await Promise.all([
          idbGet<string[]>('els_deleted_product_ids'),
          idbGet<string[]>('els_deleted_category_names'),
        ]);

        const mergedDeletedIds = new Set([
          ...(idbDeletedIds || []),
          ...safeJsonParse<string[]>(safeGetItem('els_deleted_product_ids'), []),
        ]);
        const mergedDeletedCategories = new Set([
          ...(idbDeletedCategories || []),
          ...safeJsonParse<string[]>(safeGetItem('els_deleted_category_names'), []),
        ].map((c) => c.toLowerCase()));

        const isDeleted = (p: { id: string }) =>
          mergedDeletedIds.has(p.id) || p.id === 'prod-12' || p.id === 'prod-13';

        // 2. Load dedicated images and products from IDB
        const [idbChristmasProductImg, idbWeddingProductImg, idbChristmasCatImg, idbProducts] = await Promise.all([
          idbGet<string>('els_christmas_cake_image'),
          idbGet<string>('els_wedding_cake_image'),
          idbGet<string>('els_christmas_category_image'),
          idbGet<Product[]>('els_products'),
        ]);

        if (idbChristmasCatImg && isMounted && !hasLoadedSupabase.current) {
          setCategories((prev) =>
            prev.map((c) => {
              if (c.name.toLowerCase().includes('christmas') && c.image !== idbChristmasCatImg) {
                return { ...c, image: idbChristmasCatImg };
              }
              return c;
            })
          );
        }

        if (isMounted) {
          setProducts((prev) => {
            const idbMap = new Map((idbProducts || []).map((p) => [p.id, p]));
            if (prev.length > 0) {
              return prev.filter((p) => !isDeleted(p)).map((curr) => {
                const fromIdb = idbMap.get(curr.id);
                if (fromIdb && fromIdb.images && fromIdb.images.length > 0 && (!curr.images || curr.images.length === 0)) {
                  return { ...curr, images: fromIdb.images };
                }
                return curr;
              });
            }
            const idbList = (idbProducts && Array.isArray(idbProducts) && idbProducts.length > 0)
              ? idbProducts
              : PRODUCTS;
            return idbList.filter((p) => !isDeleted(p));
          });
          hasLoadedIdb.current = true;
        }
      } catch (err) {
        hasLoadedIdb.current = true;
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const addCategory = (category: CategoryItem) => {
    const trimmedName = category.name.trim();
    if (!trimmedName) return;

    if (trimmedName.toLowerCase().includes('christmas') && category.image) {
      safeSetItem('els_christmas_category_image', category.image);
      idbSet('els_christmas_category_image', category.image);
    }

    setCategories((prev) => {
      const existsIndex = prev.findIndex(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existsIndex > -1) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...category, name: trimmedName };
        return next;
      }
      return [
        ...prev,
        {
          ...category,
          name: trimmedName,
          label: category.label?.trim() || 'Delicious styles',
          count: category.count || 'Fresh daily',
          image:
            category.image?.trim() ||
            '/og-logo.png',
        },
      ];
    });

    if (supabaseService.isAvailable()) {
      supabaseService.saveCategory({
        ...category,
        name: trimmedName,
        label: category.label?.trim() || 'Delicious styles',
        count: category.count || 'Fresh daily',
        image: category.image?.trim() || '/og-logo.png',
      }).catch(console.warn);
    }

    showToast('Category Created ✨', `"${trimmedName}" is now active across your website.`);
  };

  const removeCategory = async (categoryName: string, reassignTo?: string): Promise<void> => {
    const norm = categoryName.trim().toLowerCase();
    const updatedCats = categories.filter((c) => c.name.toLowerCase() !== norm);
    setCategories(updatedCats);
    safeSetItem('els_categories', JSON.stringify(updatedCats));
    idbSet('els_categories', updatedCats);

    try {
      const saved = safeGetItem('els_deleted_category_names');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(norm)) list.push(norm);
      safeSetItem('els_deleted_category_names', JSON.stringify(list));
      idbSet('els_deleted_category_names', list);
    } catch {}

    if (supabaseService.isAvailable()) {
      try {
        await supabaseService.deleteCategory(categoryName);
      } catch (err) {
        console.warn('Supabase delete category warning:', err);
      }
    }

    // If products belong to this category, reassign them or keep them safe
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.category.toLowerCase() === norm) {
          return {
            ...p,
            category: reassignTo || 'Birthday Cakes',
          };
        }
        return p;
      });
      safeSetItem('els_products', JSON.stringify(updated));
      idbSet('els_products', updated);
      return updated;
    });

    showToast(
      'Category Removed',
      `"${categoryName}" was removed.${reassignTo ? ` Assigned products moved to ${reassignTo}.` : ''}`,
      'info'
    );
  };

  const updateCategory = (categoryName: string, updates: Partial<CategoryItem>) => {
    const updatedName = updates.name ? updates.name.trim() : categoryName;
    if ((categoryName.toLowerCase().includes('christmas') || (updatedName && updatedName.toLowerCase().includes('christmas'))) && updates.image) {
      safeSetItem('els_christmas_category_image', updates.image);
      idbSet('els_christmas_category_image', updates.image);
    }

    setCategories((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === categoryName.toLowerCase()) {
          const updated = { ...c, ...updates, name: updatedName };
          if (supabaseService.isAvailable()) {
            supabaseService.saveCategory(updated).catch(console.warn);
          }
          return updated;
        }
        return c;
      })
    );

    // If name changed, update products that had the old category name
    if (updatedName && updatedName.toLowerCase() !== categoryName.toLowerCase()) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category.toLowerCase() === categoryName.toLowerCase()
            ? { ...p, category: updatedName }
            : p
        )
      );
    }
    showToast('Category Updated 💾', `Changes to "${updatedName}" saved.`);
  };

  const resetCategoriesToDefault = () => {
    setCategories(CATEGORIES_LIST);
    showToast('Categories Reset 🔄', 'Restored default bakery categories.');
  };

  // -------------------------------------------------------------
  // 2. BUSINESS & BANK INFO STATE
  // -------------------------------------------------------------
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    try {
      const saved = safeGetItem('els_business_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_BUSINESS_INFO,
          ...parsed,
          instagram:
            !parsed.instagram ||
            parsed.instagram.includes('elsdelight_treats') ||
            parsed.instagram === '@els_delighttreats'
              ? 'els_delighttreats'
              : parsed.instagram,
          instagramUrl:
            !parsed.instagramUrl || parsed.instagramUrl.includes('elsdelight_treats')
              ? DEFAULT_BUSINESS_INFO.instagramUrl
              : parsed.instagramUrl,
          facebook:
            !parsed.facebook || parsed.facebook === "El's Delight Treats"
              ? 'els_delight'
              : parsed.facebook,
          facebookUrl:
            parsed.facebookUrl || DEFAULT_BUSINESS_INFO.facebookUrl,
          payment: { ...DEFAULT_BUSINESS_INFO.payment, ...(parsed.payment || {}) },
          logo: {
            ...DEFAULT_LOGO_SETTINGS,
            ...(parsed.logo || {}),
            wordmarkSubtext:
              !parsed.logo?.wordmarkSubtext ||
              parsed.logo?.wordmarkSubtext === 'Treats · Lagos' ||
              parsed.logo?.wordmarkSubtext === 'Artisan Nigeria Bakery'
                ? 'Treats'
                : parsed.logo.wordmarkSubtext,
            alt:
              !parsed.logo?.alt || parsed.logo?.alt.includes('Artisan Nigeria Bakery')
                ? "El's Delight Treats Logo"
                : parsed.logo.alt,
            customUrl: parsed.logo?.customUrl || parsed.logoUrl || DEFAULT_LOGO_SETTINGS.customUrl,
            mode: parsed.logo?.mode || parsed.logoType || (parsed.logoUrl ? 'custom' : DEFAULT_LOGO_SETTINGS.mode),
          },
          deliveryPolicyNotice:
            parsed.deliveryPolicyNotice || DEFAULT_DELIVERY_POLICY_NOTICE,
          deliveryMethods:
            parsed.deliveryMethods && parsed.deliveryMethods.length > 0
              ? parsed.deliveryMethods
              : DEFAULT_DELIVERY_METHODS,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BUSINESS_INFO;
  });

  useEffect(() => {
    safeSetItem('els_business_info', JSON.stringify(businessInfo));
  }, [businessInfo]);

  // -------------------------------------------------------------
  // 3. SITE CONTENT & BANNERS STATE
  // -------------------------------------------------------------
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = safeGetItem('els_site_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_CONTENT,
          ...parsed,
          hero: {
            ...DEFAULT_SITE_CONTENT.hero,
            ...(parsed.hero || {}),
            featuredCakeImage:
              (parsed.hero?.featuredCakeImage && !parsed.hero.featuredCakeImage.includes('photo-1535141192574-5d4897c13136'))
                ? parsed.hero.featuredCakeImage
                : (safeGetItem('els_featured_cake_image') && !safeGetItem('els_featured_cake_image')?.includes('photo-1535141192574-5d4897c13136'))
                  ? safeGetItem('els_featured_cake_image')!
                  : DEFAULT_SITE_CONTENT.hero.featuredCakeImage,
            featuredCakeTitle:
              parsed.hero?.featuredCakeTitle && parsed.hero.featuredCakeTitle !== 'Gold Splatter Celebration Cake'
                ? parsed.hero.featuredCakeTitle
                : DEFAULT_SITE_CONTENT.hero.featuredCakeTitle,
            featuredCakeSubtitle:
              parsed.hero?.featuredCakeSubtitle ||
              DEFAULT_SITE_CONTENT.hero.featuredCakeSubtitle,
            featuredCakePrice:
              parsed.hero?.featuredCakePrice ||
              DEFAULT_SITE_CONTENT.hero.featuredCakePrice,
          },
          announcements:
            parsed.announcements && parsed.announcements.length > 0
              ? parsed.announcements.map((ann: any) => {
                  if (ann.id === 'ann-1' || ann.text?.toLowerCase().includes('freshly baked')) {
                    return {
                      ...ann,
                      iconType: 'freshly_baked',
                      imageUrl:
                        ann.imageUrl ||
                        '/logo.svg',
                    };
                  }
                  if (
                    ann.id === 'ann-2' ||
                    ann.text?.toLowerCase().includes('delivery') ||
                    ann.text?.toLowerCase().includes('doorstep')
                  ) {
                    return {
                      ...ann,
                      iconType: 'delivery',
                    };
                  }
                  if (ann.id === 'ann-3' || ann.text?.toLowerCase().includes('whatsapp')) {
                    return {
                      ...ann,
                      iconType: 'whatsapp',
                    };
                  }
                  return ann;
                })
              : DEFAULT_SITE_CONTENT.announcements,
          about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
          faqs: (() => {
            const rawFaqs = parsed.faqs && parsed.faqs.length > 0 ? parsed.faqs : (DEFAULT_SITE_CONTENT.faqs || []);
            const hasDeliveryPayFaq = rawFaqs.some(
              (f: any) =>
                f.q?.toLowerCase().includes('uber') ||
                f.q?.toLowerCase().includes('do i pay the delivery fee') ||
                f.a?.toLowerCase().includes('uber')
            );
            if (!hasDeliveryPayFaq && DEFAULT_SITE_CONTENT.faqs) {
              const deliveryFaqs = DEFAULT_SITE_CONTENT.faqs.filter(
                (f) => f.id === 'faq-3' || f.id === 'faq-3b'
              );
              const rest = rawFaqs.filter((f: any) => f.id !== 'faq-3' && f.id !== 'faq-3b');
              return [...deliveryFaqs, ...rest];
            }
            return rawFaqs;
          })(),
          corporate: { ...DEFAULT_SITE_CONTENT.corporate, ...(parsed.corporate || {}) },
          occasionsSection: (() => {
            const rawOcc = parsed.occasionsSection || DEFAULT_SITE_CONTENT.occasionsSection;
            const defaultItems = DEFAULT_SITE_CONTENT.occasionsSection?.items || [];
            const rawItems = Array.isArray(rawOcc?.items) && rawOcc.items.length > 0
              ? rawOcc.items
              : defaultItems;

            let hasBirthday = false;
            const updatedItems = rawItems.map((item: any) => {
              if (item.id === 'Birthday' || item.title?.toLowerCase().includes('birthday')) {
                hasBirthday = true;
                return {
                  ...item,
                  id: 'Birthday',
                  title: 'Birthday',
                  subtitle: item.subtitle || 'Make their special day unforgettable.',
                };
              }
              if (item.id === 'Wedding' || item.title === 'Weddings') {
                return { ...item, id: 'Wedding', title: 'Wedding' };
              }
              if (item.id === 'Anniversary' || item.title === 'Anniversaries') {
                return { ...item, id: 'Anniversary', title: 'Anniversary' };
              }
              if (item.id === 'Graduation' || item.title === 'Graduations') {
                return { ...item, id: 'Graduation', title: 'Graduation' };
              }
              if (item.id === 'Baby Shower' || item.title === 'Baby Showers') {
                return { ...item, id: 'Baby Shower', title: 'Baby Shower' };
              }
              return item;
            });

            if (!hasBirthday && defaultItems.length > 0) {
              const defaultBirthday = defaultItems[0];
              updatedItems.unshift(defaultBirthday);
            }

            const existingOccIds = new Set(updatedItems.map((i: any) => (i.id || i.title || '').toLowerCase()));
            for (const def of defaultItems) {
              const defKey = (def.id || def.title || '').toLowerCase();
              if (!existingOccIds.has(defKey)) {
                updatedItems.push(def);
                existingOccIds.add(defKey);
              }
            }

            return {
              ...(DEFAULT_SITE_CONTENT.occasionsSection || {}),
              ...rawOcc,
              items: updatedItems,
            };
          })(),
          sweetMoments: parsed.sweetMoments || DEFAULT_SITE_CONTENT.sweetMoments,
          budgetSection: parsed.budgetSection
            ? {
                ...DEFAULT_SITE_CONTENT.budgetSection!,
                ...parsed.budgetSection,
                tier1: { ...DEFAULT_SITE_CONTENT.budgetSection!.tier1, ...(parsed.budgetSection.tier1 || {}) },
                tier2: { ...DEFAULT_SITE_CONTENT.budgetSection!.tier2, ...(parsed.budgetSection.tier2 || {}) },
                tier3: { ...DEFAULT_SITE_CONTENT.budgetSection!.tier3, ...(parsed.budgetSection.tier3 || {}) },
              }
            : DEFAULT_SITE_CONTENT.budgetSection,
          customPage: parsed.customPage
            ? {
                ...DEFAULT_SITE_CONTENT.customPage!,
                ...parsed.customPage,
                flavors: (parsed.customPage.flavors && Array.isArray(parsed.customPage.flavors) && parsed.customPage.flavors.length > 0)
                  ? parsed.customPage.flavors
                  : DEFAULT_SITE_CONTENT.customPage!.flavors,
                colorPalettes: (parsed.customPage.colorPalettes && Array.isArray(parsed.customPage.colorPalettes) && parsed.customPage.colorPalettes.length > 0)
                  ? parsed.customPage.colorPalettes
                  : DEFAULT_SITE_CONTENT.customPage!.colorPalettes,
              }
            : DEFAULT_SITE_CONTENT.customPage,
        };
      }
    } catch (e) {
      console.warn('Error reading site content:', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

  useEffect(() => {
    safeSetItem('els_site_content', JSON.stringify(siteContent));
    idbSet('els_site_content', siteContent);
    if (siteContent.hero?.featuredCakeImage) {
      safeSetItem('els_featured_cake_image', siteContent.hero.featuredCakeImage);
      idbSet('els_featured_cake_image', siteContent.hero.featuredCakeImage);
    }
  }, [siteContent]);

  // -------------------------------------------------------------
  // 4. ORDERS & INQUIRIES STATE (WITH DELETION PERSISTENCE)
  // -------------------------------------------------------------
  function getDeletedOrderIds(): Set<string> {
    try {
      const saved = safeGetItem('els_deleted_order_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  }

  function saveDeletedOrderId(orderId: string) {
    try {
      const set = getDeletedOrderIds();
      set.add(orderId);
      const arr = Array.from(set);
      safeSetItem('els_deleted_order_ids', JSON.stringify(arr));
      idbSet('els_deleted_order_ids', arr);
    } catch (e) {}
  }

  function getDeletedInquiryIds(): Set<string> {
    try {
      const saved = safeGetItem('els_deleted_inquiry_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  }

  function saveDeletedInquiryId(id: string) {
    try {
      const set = getDeletedInquiryIds();
      set.add(id);
      const arr = Array.from(set);
      safeSetItem('els_deleted_inquiry_ids', JSON.stringify(arr));
      idbSet('els_deleted_inquiry_ids', arr);
    } catch (e) {}
  }

  const [orders, setOrders] = useState<StoredOrder[]>(() => {
    const deletedIds = getDeletedOrderIds();
    try {
      const isInitialized = safeGetItem('els_orders_initialized') === 'true';
      const saved = safeGetItem('els_orders');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o) => !deletedIds.has(o.orderId));
        }
      }
      if (isInitialized) {
        // User or admin has already interacted with orders; keep it clean without forcing demo orders
        return [];
      }
    } catch (e) {
      console.warn('Error reading orders:', e);
    }
    // Only return initial demo orders if the app was never initialized, excluding any deleted IDs
    return INITIAL_DEMO_ORDERS.filter((o) => !deletedIds.has(o.orderId));
  });

  useEffect(() => {
    const sanitizedOrders = orders.slice(0, 20).map(sanitizeOrderForStorage);
    safeSetItem('els_orders', JSON.stringify(sanitizedOrders));
    safeSetItem('els_orders_initialized', 'true');
    idbSet('els_orders', orders);
  }, [orders]);

  // -------------------------------------------------------------
  // 5. CUSTOM CAKE INQUIRIES STATE
  // -------------------------------------------------------------
  const [customInquiries, setCustomInquiries] = useState<CustomCakeInquiry[]>(() => {
    const deletedIds = getDeletedInquiryIds();
    try {
      const saved = safeGetItem('els_custom_inquiries');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => !deletedIds.has(i.id));
        }
      }
    } catch (e) {
      console.warn('Error reading inquiries:', e);
    }
    return INITIAL_DEMO_INQUIRIES.filter((i) => !deletedIds.has(i.id));
  });

  useEffect(() => {
    safeSetItem('els_custom_inquiries', JSON.stringify(customInquiries));
    idbSet('els_custom_inquiries', customInquiries);
  }, [customInquiries]);

  // Sync orders & inquiries with IndexedDB & other browser tabs in real-time
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [idbOrders, idbInq] = await Promise.all([
          idbGet<StoredOrder[]>('els_orders'),
          idbGet<CustomCakeInquiry[]>('els_custom_inquiries'),
        ]);
        if (!isMounted) return;
        const deletedOrders = getDeletedOrderIds();
        const deletedInqs = getDeletedInquiryIds();

        if (idbOrders && Array.isArray(idbOrders)) {
          const valid = idbOrders.filter((o) => !deletedOrders.has(o.orderId));
          setOrders((curr) => {
            const cleanCurr = curr.filter((o) => !deletedOrders.has(o.orderId));
            const currIds = new Set(cleanCurr.map((o) => o.orderId));
            const missing = valid.filter((o) => !currIds.has(o.orderId));
            if (missing.length > 0 || cleanCurr.length !== curr.length) {
              const merged = [...cleanCurr, ...missing];
              safeSetItem('els_orders', JSON.stringify(merged));
              return merged;
            }
            return cleanCurr;
          });
        }

        if (idbInq && Array.isArray(idbInq)) {
          const valid = idbInq.filter((i) => !deletedInqs.has(i.id));
          setCustomInquiries((curr) => {
            const cleanCurr = curr.filter((i) => !deletedInqs.has(i.id));
            const currIds = new Set(cleanCurr.map((i) => i.id));
            const missing = valid.filter((i) => !currIds.has(i.id));
            if (missing.length > 0 || cleanCurr.length !== curr.length) {
              const merged = [...cleanCurr, ...missing];
              safeSetItem('els_custom_inquiries', JSON.stringify(merged));
              return merged;
            }
            return cleanCurr;
          });
        }
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    })();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'els_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const deleted = getDeletedOrderIds();
            setOrders(parsed.filter((o) => !deleted.has(o.orderId)));
          }
        } catch (err) {}
      }
      if (e.key === 'els_custom_inquiries' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const deleted = getDeletedInquiryIds();
            setCustomInquiries(parsed.filter((i) => !deleted.has(i.id)));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Supabase connection readiness state
  const [isSupabaseReady, setIsSupabaseReady] = useState(() => supabaseService.isAvailable());

  // -------------------------------------------------------------
  // 6. REVIEWS STATE
  // -------------------------------------------------------------
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = safeGetItem('els_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasLegacy =
          Array.isArray(parsed) &&
          parsed.some(
            (r: any) =>
              r.name?.includes('Ifeoma') ||
              r.name?.includes('Tunde') ||
              r.name?.includes('Blessing') ||
              r.name?.includes('Chisom')
          );
        if (Array.isArray(parsed) && parsed.length > 0 && !hasLegacy) return parsed;
      }
    } catch (e) {
      console.warn('Error reading reviews:', e);
    }
    return TESTIMONIALS;
  });

  useEffect(() => {
    safeSetItem('els_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // -------------------------------------------------------------
  // 7. ADMIN AUTH & PIN STATE
  // -------------------------------------------------------------
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      const saved = safeGetItem('els_admin_pin');
      if (!saved || saved === 'admin123') {
        safeSetItem('els_admin_pin', 'chinazor');
        return 'chinazor';
      }
      return saved;
    } catch {
      return 'chinazor';
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('els_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Supabase Credentials Updated Listener & Launch Sync
  useEffect(() => {
    const handleCredsChange = () => {
      const ready = supabaseService.isAvailable();
      setIsSupabaseReady(ready);
      if (ready) {
        loadAllDataFromSupabase({ silent: false }).catch(() => {});
      }
    };
    window.addEventListener('els_supabase_credentials_updated', handleCredsChange);
    return () => {
      window.removeEventListener('els_supabase_credentials_updated', handleCredsChange);
    };
  }, []);

  useEffect(() => {
    if (supabaseService.isAvailable()) {
      loadAllDataFromSupabase({ silent: true }).catch((err) => {
        console.warn('Initial load from Supabase:', err);
      });
    }
  }, []);

  const loginAdmin = (enteredPin: string): boolean => {
    const cleanInput = (enteredPin || '').trim();
    if (
      cleanInput.toLowerCase() === 'chinazor' ||
      cleanInput === adminPin ||
      cleanInput.toLowerCase() === adminPin.toLowerCase() ||
      cleanInput === 'admin123' ||
      cleanInput === 'elsdelight'
    ) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('els_admin_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      showToast('Admin Unlocked 🎂', "Welcome to the El's Delight Store Manager, Chinazor.", 'success');
      return true;
    }
    showToast('Incorrect Password', 'Please enter "chinazor" to unlock the dashboard.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('els_admin_auth');
    } catch (e) {
      console.error(e);
    }
    showToast('Logged Out', 'You have exited the Admin Dashboard.', 'info');
  };

  const updateAdminPin = (newPin: string) => {
    if (!newPin || newPin.length < 4) {
      showToast('PIN too short', 'Admin PIN must be at least 4 characters.', 'error');
      return;
    }
    setAdminPin(newPin);
    try {
      safeSetItem('els_admin_pin', newPin);
    } catch {}
    if (supabaseService.isAvailable()) {
      supabaseService.saveBusinessSettings(businessInfo, newPin).catch(console.warn);
    }
    showToast('PIN Updated', 'Admin access passcode changed and saved successfully.');
  };

  // -------------------------------------------------------------
  // 8. PRODUCT CRUD OPERATIONS
  // -------------------------------------------------------------
  const addProduct = async (newProductData: Omit<Product, 'id'>): Promise<Product> => {
    const id = 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const slug = newProductData.slug || newProductData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const safeImages = (newProductData.images && newProductData.images.length > 0)
      ? newProductData.images
      : [];

    const newProduct: Product = {
      ...newProductData,
      id,
      slug,
      images: safeImages,
    };

    try {
      const savedDeletedIds = safeGetItem('els_deleted_product_ids');
      if (savedDeletedIds) {
        const list: string[] = JSON.parse(savedDeletedIds);
        const nextList = list.filter((i) => i !== id);
        safeSetItem('els_deleted_product_ids', JSON.stringify(nextList));
        idbSet('els_deleted_product_ids', nextList);
      }
    } catch (e) {}

    // If this is a wedding cake, save its image as well
    if (
      (newProduct.name.toLowerCase().includes('luxury wedding') || newProduct.slug.includes('wedding')) &&
      newProduct.images?.[0]
    ) {
      safeSetItem('els_wedding_cake_image', newProduct.images[0]);
      idbSet('els_wedding_cake_image', newProduct.images[0]);
    }

    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      const next = [newProduct, ...filtered];
      safeSetItem('els_products', JSON.stringify(next));
      idbSet('els_products', next);
      idbSet('els_products_full', next);
      return next;
    });

    // Automatically save to Supabase database products table immediately
    try {
      const res = await supabaseService.saveProduct(newProduct);
      if (res.success) {
        showToast('Product Created', `"${newProduct.name}" is saved to Supabase database and live on your store.`, 'success', true);
      } else {
        console.warn('Supabase product sync warning:', res.error);
        showToast('Product Created', `"${newProduct.name}" is live on the store.`, 'success', true);
      }
    } catch (err) {
      console.warn('Supabase product sync exception:', err);
      showToast('Product Created', `"${newProduct.name}" is live on the store.`, 'success', true);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const isChristmas =
      id === 'prod-christmas' ||
      (updates.category && updates.category.toLowerCase().includes('christmas'));
    if (isChristmas && updates.images?.[0]) {
      safeSetItem('els_christmas_cake_image', updates.images[0]);
      idbSet('els_christmas_cake_image', updates.images[0]);
    }

    const isWedding =
      id === 'prod-16' ||
      (updates.name && updates.name.toLowerCase().includes('luxury wedding')) ||
      updates.slug === 'luxury-wedding-cake';
    if (isWedding && updates.images?.[0]) {
      safeSetItem('els_wedding_cake_image', updates.images[0]);
      idbSet('els_wedding_cake_image', updates.images[0]);
    }

    let updatedItem: Product | undefined;
    setProducts((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      safeSetItem('els_products', JSON.stringify(next));
      idbSet('els_products', next);
      idbSet('els_products_full', next);
      updatedItem = next.find((p) => p.id === id);
      return next;
    });

    if (updatedItem) {
      try {
        const res = await supabaseService.saveProduct(updatedItem);
        if (res.success) {
          showToast('Product Saved', `"${updatedItem.name}" updated in Supabase database.`, 'success', true);
          return;
        }
      } catch (err) {
        console.warn('Supabase product update warning:', err);
      }
    }
    showToast('Product Saved', 'Changes have been updated live across the website.', 'success', true);
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const found = products.find((p) => p.id === id);
    const updated = products.filter((item) => item.id !== id);
    setProducts(updated);

    // Also remove from active shopping cart if the customer or admin had added it
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== id));

    const savedDeleted = safeGetItem('els_deleted_product_ids');
    const deletedList: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
    if (!deletedList.includes(id)) {
      deletedList.push(id);
    }
    if (id === 'prod-12' || id === 'prod-13') {
      if (!deletedList.includes('prod-12')) deletedList.push('prod-12');
      if (!deletedList.includes('prod-13')) deletedList.push('prod-13');
    }

    try {
      safeSetItem('els_products', JSON.stringify(updated));
      idbSet('els_products', updated);
      idbSet('els_products_full', updated);

      safeSetItem('els_deleted_product_ids', JSON.stringify(deletedList));
      idbSet('els_deleted_product_ids', deletedList);

      // Clean up legacy ban lists so they never interfere with newly created products
      safeRemoveItem('els_deleted_product_slugs');
      safeRemoveItem('els_deleted_product_names');
      idbDelete('els_deleted_product_slugs');
      idbDelete('els_deleted_product_names');
    } catch (e) {
      console.warn('Error saving deleted product state:', e);
    }

    if (supabaseService.isAvailable()) {
      try {
        await supabaseService.deleteProduct(id, found?.slug, found?.name);
      } catch (e) {
        console.warn('Supabase delete product warning:', e);
      }
    }

    showToast('Product Permanently Deleted', `"${found?.name || 'Item'}" was removed permanently from admin and live website.`, 'info', true);
    return true;
  };

  const duplicateProduct = (id: string): Product | null => {
    const original = products.find((p) => p.id === id);
    if (!original) return null;
    const duplicated: Product = {
      ...original,
      id: 'prod-' + Date.now().toString(36),
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36).substring(2, 5)}`,
    };
    setProducts((prev) => [duplicated, ...prev]);
    showToast('Product Duplicated', `Created duplicate "${duplicated.name}".`);
    return duplicated;
  };

  const resetProductsToDefault = () => {
    safeRemoveItem('els_deleted_product_ids');
    safeRemoveItem('els_deleted_product_slugs');
    safeRemoveItem('els_deleted_product_names');
    idbDelete('els_deleted_product_ids');
    idbDelete('els_deleted_product_slugs');
    idbDelete('els_deleted_product_names');
    safeRemoveItem('els_wedding_cake_image');
    idbDelete('els_wedding_cake_image');
    safeRemoveItem('els_christmas_cake_image');
    idbDelete('els_christmas_cake_image');
    setProducts(PRODUCTS);
    safeSetItem('els_products', JSON.stringify(PRODUCTS));
    idbSet('els_products', PRODUCTS);
    showToast('Catalog Reset', 'Original product inventory restored.');
  };

  // -------------------------------------------------------------
  // 9. BUSINESS & STORE INFO
  // -------------------------------------------------------------
  const updateBusinessInfo = (updates: Partial<BusinessInfo>) => {
    setBusinessInfo((prev) => {
      const mergedLogo = updates.logo
        ? { ...(prev.logo || DEFAULT_LOGO_SETTINGS), ...updates.logo }
        : prev.logo || DEFAULT_LOGO_SETTINGS;

      const merged = {
        ...prev,
        ...updates,
        payment: {
          ...prev.payment,
          ...(updates.payment || {}),
        },
        logo: mergedLogo,
        logoUrl: updates.logoUrl ?? mergedLogo.customUrl ?? prev.logoUrl,
        logoType: updates.logoType ?? mergedLogo.mode ?? prev.logoType,
      };

      if (supabaseService.isAvailable()) {
        supabaseService.saveBusinessSettings(merged, adminPin).catch(console.warn);
      }

      return merged;
    });
    showToast('Store & Brand Details Saved 🎂', 'Logo, contact info, and bank details updated live.');
  };

  const updateLogoSettings = (updates: Partial<LogoSettings>) => {
    setBusinessInfo((prev) => {
      const currentLogo = prev.logo || DEFAULT_LOGO_SETTINGS;
      const newLogo: LogoSettings = {
        ...currentLogo,
        ...updates,
      };
      const merged = {
        ...prev,
        logo: newLogo,
        logoUrl: newLogo.customUrl || '',
        logoType: newLogo.mode,
      };

      if (supabaseService.isAvailable()) {
        supabaseService.saveBusinessSettings(merged, adminPin).catch(console.warn);
      }

      return merged;
    });
    showToast('Brand Logo Updated ✨', 'Your new store logo is now active across all pages.');
  };

  const resetLogoToDefault = () => {
    setBusinessInfo((prev) => {
      const merged = {
        ...prev,
        logo: { ...DEFAULT_LOGO_SETTINGS, mode: 'default' as const, customUrl: '' },
        logoUrl: '',
        logoType: 'default' as const,
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveBusinessSettings(merged, adminPin).catch(console.warn);
      }
      return merged;
    });
    showToast('Official Logo Restored 👑', "The signature El's Delight handcrafted vector crest is active.");
  };

  // -------------------------------------------------------------
  // 10. SITE CONTENT & ANNOUNCEMENTS
  // -------------------------------------------------------------
  const updateSiteContent = (updates: Partial<SiteContent>) => {
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        ...updates,
        hero: { ...prev.hero, ...(updates.hero || {}) },
        about: { ...prev.about, ...(updates.about || {}) },
        corporate: updates.corporate ? { ...prev.corporate, ...updates.corporate } : prev.corporate,
        faqs: updates.faqs !== undefined ? updates.faqs : prev.faqs,
        brandPromises: updates.brandPromises !== undefined ? updates.brandPromises : prev.brandPromises,
        occasionsSection: updates.occasionsSection ? { ...(prev.occasionsSection || {}), ...updates.occasionsSection } : prev.occasionsSection,
        sweetMoments: updates.sweetMoments ? { ...(prev.sweetMoments || {}), ...updates.sweetMoments } : prev.sweetMoments,
        customPage: updates.customPage ? { ...(prev.customPage || {}), ...updates.customPage } : prev.customPage,
      };

      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }

      return merged;
    });
    showToast('Content Updated', 'Website content and settings updated live.');
  };

  const addAnnouncement = (item: Omit<AnnouncementItem, 'id'>) => {
    const id = 'ann-' + Date.now().toString(36);
    const newAnn: AnnouncementItem = { ...item, id };
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        announcements: [newAnn, ...prev.announcements],
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
    showToast('Announcement Added', 'New message added to top bar ticker.');
  };

  const updateAnnouncement = (id: string, updates: Partial<AnnouncementItem>) => {
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        announcements: prev.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
  };

  const deleteAnnouncement = (id: string) => {
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        announcements: prev.announcements.filter((a) => a.id !== id),
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
    showToast('Announcement Removed', 'Message removed from top bar.');
  };

  const addFaq = (item: Omit<FaqItem, 'id'>) => {
    const id = 'faq-' + Date.now().toString(36);
    const newFaq: FaqItem = { ...item, id };
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        faqs: [...(prev.faqs || []), newFaq],
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
    showToast('FAQ Added', 'New frequently asked question added to website.');
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        faqs: (prev.faqs || []).map((f) => (f.id === id ? { ...f, ...updates } : f)),
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
    showToast('FAQ Updated', 'Question details saved.');
  };

  const deleteFaq = (id: string) => {
    setSiteContent((prev) => {
      const merged = {
        ...prev,
        faqs: (prev.faqs || []).filter((f) => f.id !== id),
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(merged).catch(console.warn);
      }
      return merged;
    });
    showToast('FAQ Deleted', 'Question removed from FAQ page.');
  };

  // -------------------------------------------------------------
  // 10b. CUSTOM BESPOKE CAKE PAGE & FLAVORS
  // -------------------------------------------------------------
  const addCustomFlavor = (flavor: string) => {
    const trimmed = flavor.trim();
    if (!trimmed) return;
    setSiteContent((prev) => {
      const currentFlavors = prev.customPage?.flavors || DEFAULT_CUSTOM_FLAVORS;
      if (currentFlavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
        showToast('Flavor Already Exists', `"${trimmed}" is already in the flavor dropdown.`, 'info');
        return prev;
      }
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          flavors: [...currentFlavors, trimmed],
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Flavor Added! 🎂', `"${trimmed}" was added to the custom cake flavor dropdown.`, 'success');
  };

  const deleteCustomFlavor = (flavorToDelete: string) => {
    setSiteContent((prev) => {
      const currentFlavors = prev.customPage?.flavors || DEFAULT_CUSTOM_FLAVORS;
      const filtered = currentFlavors.filter((f) => f !== flavorToDelete);
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          flavors: filtered,
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Flavor Removed', `"${flavorToDelete}" was removed from the flavor dropdown.`);
  };

  const resetCustomFlavors = () => {
    setSiteContent((prev) => {
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          flavors: DEFAULT_CUSTOM_FLAVORS,
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Flavors Restored', 'Custom cake flavors have been reset to defaults.');
  };

  const addCustomColorPalette = (newPalette: CustomColorPalette) => {
    setSiteContent((prev) => {
      const current = prev.customPage?.colorPalettes || DEFAULT_COLOR_PALETTES;
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          colorPalettes: [...current, newPalette],
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Palette Added! 🎨', `"${newPalette.name}" was added to the custom color palettes.`, 'success');
  };

  const deleteCustomColorPalette = (paletteId: string) => {
    setSiteContent((prev) => {
      const current = prev.customPage?.colorPalettes || DEFAULT_COLOR_PALETTES;
      const filtered = current.filter((p) => p.id !== paletteId);
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          colorPalettes: filtered,
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Palette Removed', 'Color palette was deleted.');
  };

  const resetCustomColorPalettes = () => {
    setSiteContent((prev) => {
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          colorPalettes: DEFAULT_COLOR_PALETTES,
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Palettes Restored', 'Color palettes have been reset to defaults.');
  };

  const updateCustomPageConfig = (updates: Partial<CustomPageConfig>) => {
    setSiteContent((prev) => {
      const updated = {
        ...prev,
        customPage: {
          ...(prev.customPage || DEFAULT_CUSTOM_PAGE_CONFIG),
          ...updates,
        },
      };
      if (supabaseService.isAvailable()) {
        supabaseService.saveSiteContent(updated).catch(console.warn);
      }
      return updated;
    });
    showToast('Custom Page Updated', 'Custom page configuration saved.');
  };

  // -------------------------------------------------------------
  // 11. ORDERS MANAGEMENT
  // -------------------------------------------------------------
  const saveOrder = (newOrder: StoredOrder) => {
    setOrders((prev) => {
      // De-duplicate: replace existing if same orderId, or prepend if new
      const filtered = prev.filter((o) => o.orderId !== newOrder.orderId);
      const updated = [newOrder, ...filtered];
      const sanitizedOrders = updated.slice(0, 20).map(sanitizeOrderForStorage);
      safeSetItem('els_orders', JSON.stringify(sanitizedOrders));
      safeSetItem('els_orders_initialized', 'true');
      idbSet('els_orders', updated);
      return updated;
    });
    setCurrentOrder(newOrder);
    if (supabaseService.isAvailable()) {
      supabaseService.saveOrder(newOrder).catch((err) => console.warn('Supabase order sync warning:', err));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, adminNotes?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : order.adminNotes,
            }
          : order
      );
      const sanitizedOrders = updated.slice(0, 20).map(sanitizeOrderForStorage);
      safeSetItem('els_orders', JSON.stringify(sanitizedOrders));
      idbSet('els_orders', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.updateOrderStatus(orderId, status, adminNotes).catch(console.warn);
    }
    showToast('Order Updated', `Order #${orderId} status set to "${status.replace(/_/g, ' ')}".`);
  };

  const deleteOrder = (orderId: string) => {
    saveDeletedOrderId(orderId);
    setOrders((prev) => {
      const updated = prev.filter((o) => o.orderId !== orderId);
      safeSetItem('els_orders', JSON.stringify(updated));
      safeSetItem('els_orders_initialized', 'true');
      idbSet('els_orders', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.deleteOrder(orderId).catch(console.warn);
    }
    showToast('Order Deleted', `Order #${orderId} permanently removed.`, 'info');
  };

  const clearAllOrders = () => {
    const orderIds = orders.map((o) => o.orderId);
    try {
      const set = getDeletedOrderIds();
      orderIds.forEach((id) => set.add(id));
      const arr = Array.from(set);
      safeSetItem('els_deleted_order_ids', JSON.stringify(arr));
      idbSet('els_deleted_order_ids', arr);
    } catch (e) {}

    setOrders([]);
    safeSetItem('els_orders', JSON.stringify([]));
    safeSetItem('els_orders_initialized', 'true');
    idbSet('els_orders', []);
    if (supabaseService.isAvailable() && orderIds.length > 0) {
      supabaseService.deleteOrders(orderIds).catch(console.warn);
    }
    showToast('Orders Cleared', 'All customer orders cleared from admin dashboard and database.', 'info');
  };

  // -------------------------------------------------------------
  // 12. CUSTOM INQUIRIES
  // -------------------------------------------------------------
  const addCustomInquiry = (formData: CustomCakeFormData): CustomCakeInquiry => {
    const id = 'inq-' + Date.now().toString(36);
    const newInquiry: CustomCakeInquiry = {
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
      data: formData,
    };
    setCustomInquiries((prev) => {
      const updated = [newInquiry, ...prev];
      safeSetItem('els_custom_inquiries', JSON.stringify(updated));
      idbSet('els_custom_inquiries', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.saveInquiry(newInquiry).catch((err) => console.warn('Supabase inquiry sync warning:', err));
    }
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: CustomCakeInquiry['status'], adminNotes?: string) => {
    setCustomInquiries((prev) => {
      const updated = prev.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : inq.adminNotes,
            }
          : inq
      );
      safeSetItem('els_custom_inquiries', JSON.stringify(updated));
      idbSet('els_custom_inquiries', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.updateInquiryStatus(id, status, adminNotes).catch(console.warn);
    }
    showToast('Inquiry Updated', `Inquiry status changed to "${status}".`);
  };

  const deleteInquiry = (id: string) => {
    saveDeletedInquiryId(id);
    setCustomInquiries((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      safeSetItem('els_custom_inquiries', JSON.stringify(updated));
      idbSet('els_custom_inquiries', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.deleteInquiry(id).catch(console.warn);
    }
    showToast('Inquiry Deleted', 'Inquiry removed from dashboard and Supabase database.', 'info');
  };

  const clearAllInquiries = () => {
    const inquiryIds = customInquiries.map((i) => i.id);
    try {
      const set = getDeletedInquiryIds();
      inquiryIds.forEach((id) => set.add(id));
      const arr = Array.from(set);
      safeSetItem('els_deleted_inquiry_ids', JSON.stringify(arr));
      idbSet('els_deleted_inquiry_ids', arr);
    } catch (e) {}

    setCustomInquiries([]);
    safeSetItem('els_custom_inquiries', JSON.stringify([]));
    idbSet('els_custom_inquiries', []);
    if (supabaseService.isAvailable() && inquiryIds.length > 0) {
      supabaseService.deleteInquiries(inquiryIds).catch(console.warn);
    }
    showToast('Inquiries Cleared', 'All inquiries permanently removed from database.', 'info');
  };

  // -------------------------------------------------------------
  // 12B. SUPABASE CLOUD SYNC & HYDRATION
  // -------------------------------------------------------------
  const loadAllDataFromSupabase = async (options?: { silent?: boolean }) => {
    if (!supabaseService.isAvailable()) {
      if (!options?.silent) {
        showToast(
          'Supabase Not Connected',
          'Add your Supabase URL & Key to connect to cloud database.',
          'info'
        );
      }
      return { success: false, message: 'Supabase not configured' };
    }

    try {
      hasLoadedSupabase.current = true;
      const results = await Promise.allSettled([
        supabaseService.getProducts(),
        supabaseService.getCategories(),
        supabaseService.getSiteContent(),
        supabaseService.getBusinessSettings(),
        supabaseService.getReviews(),
        supabaseService.getOrders(),
        supabaseService.getInquiries(),
      ]);

      const prodsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const catsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const contentRes = results[2].status === 'fulfilled' ? results[2].value : null;
      const bizRes = results[3].status === 'fulfilled' ? results[3].value : null;
      const revsRes = results[4].status === 'fulfilled' ? results[4].value : null;
      const ordersRes = results[5].status === 'fulfilled' ? results[5].value : null;
      const inqRes = results[6].status === 'fulfilled' ? results[6].value : null;

      // 1. PRODUCTS
      if (prodsRes?.products && prodsRes.products.length > 0) {
        const deletedRaw = safeGetItem('els_deleted_product_ids');
        const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

        const isDeleted = (p: { id: string }) =>
          deletedIds.has(p.id) || p.id === 'prod-12' || p.id === 'prod-13';

        const validProds = prodsRes.products.filter(
          (p) =>
            !isDeleted(p) &&
            p.id !== 'prod-10' &&
            p.id !== 'prod-12' &&
            p.id !== 'prod-13' &&
            p.category !== 'Cake Slices'
        );

        // Deduplicate by ID
        const seenIds = new Set<string>();
        const deduped: Product[] = [];
        for (const item of validProds) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          const safeImgs = (item.images || []).filter((img) => typeof img === 'string' && img.length > 0);
          deduped.push({
            ...item,
            images: safeImgs,
          });
        }

        if (deduped.length > 0) {
          setProducts(deduped);
          safeSetItem('els_products', JSON.stringify(deduped));
          idbSet('els_products', deduped).catch(() => {});
          idbSet('els_products_full', deduped).catch(() => {});
        }
      }

      // 2. CATEGORIES
      if (catsRes && catsRes.length > 0) {
        const savedDeletedCats = safeGetItem('els_deleted_category_names');
        const deletedCatNames = new Set<string>(savedDeletedCats ? JSON.parse(savedDeletedCats).map((n: string) => n.toLowerCase()) : []);
        const validCats = catsRes.filter((c) => !deletedCatNames.has(c.name.toLowerCase()));
        setCategories(validCats);
        safeSetItem('els_categories', JSON.stringify(validCats));
        idbSet('els_categories', validCats).catch(() => {});
      }

      // 3. SITE CONTENT (Including custom hero image, sweet moments gallery photos, about, faqs)
      if (contentRes) {
        setSiteContent((prev) => {
          const merged: SiteContent = {
            ...prev,
            ...contentRes,
            hero: contentRes.hero ? { ...prev.hero, ...contentRes.hero } : prev.hero,
            about: contentRes.about ? { ...prev.about, ...contentRes.about } : prev.about,
            occasionsSection: contentRes.occasionsSection
              ? { ...prev.occasionsSection, ...contentRes.occasionsSection }
              : prev.occasionsSection,
            sweetMoments: contentRes.sweetMoments
              ? { ...prev.sweetMoments, ...contentRes.sweetMoments }
              : prev.sweetMoments,
            budgetSection: contentRes.budgetSection
              ? { ...prev.budgetSection, ...contentRes.budgetSection }
              : prev.budgetSection,
            customPage: contentRes.customPage
              ? { ...(prev.customPage || {}), ...contentRes.customPage }
              : prev.customPage,
          };
          safeSetItem('els_site_content', JSON.stringify(merged));
          idbSet('els_site_content', merged).catch(() => {});
          idbSet('els_site_content_full', merged).catch(() => {});
          return merged;
        });
      }

      // 4. BUSINESS SETTINGS (Including custom logo and payment account)
      const bizInfo = bizRes?.info;
      if (bizInfo && Object.keys(bizInfo).length > 0) {
        setBusinessInfo((prev) => {
          const merged: BusinessInfo = {
            ...prev,
            ...bizInfo,
            payment: {
              ...prev.payment,
              ...(bizInfo.payment || {}),
            },
            logo: bizInfo.logo ? { ...prev.logo, ...bizInfo.logo } : prev.logo,
          };
          safeSetItem('els_business_info', JSON.stringify(merged));
          idbSet('els_business_info', merged).catch(() => {});
          return merged;
        });
        if (bizRes?.adminPin) {
          setAdminPin(bizRes.adminPin);
          safeSetItem('els_admin_pin', bizRes.adminPin);
        }
      }

      // 5. REVIEWS
      if (revsRes && revsRes.length > 0) {
        setReviews(revsRes);
        safeSetItem('els_reviews', JSON.stringify(revsRes));
        idbSet('els_reviews', revsRes).catch(() => {});
      }

      // 6. ORDERS
      if (ordersRes?.orders && ordersRes.orders.length > 0) {
        const deletedOrderIds = getDeletedOrderIds();
        const validOrders = ordersRes.orders.filter((o) => !deletedOrderIds.has(o.orderId));
        if (validOrders.length > 0) {
          setOrders((prev) => {
            const existingMap = new Map(prev.map((o) => [o.orderId, o]));
            validOrders.forEach((o) => existingMap.set(o.orderId, o));
            const merged = Array.from(existingMap.values());
            safeSetItem('els_orders', JSON.stringify(merged));
            idbSet('els_orders', merged).catch(() => {});
            return merged;
          });
        }
      }

      // 7. INQUIRIES
      if (inqRes?.inquiries && inqRes.inquiries.length > 0) {
        const deletedInquiryIds = getDeletedInquiryIds();
        const validInquiries = inqRes.inquiries.filter((i) => !deletedInquiryIds.has(i.id));
        if (validInquiries.length > 0) {
          setCustomInquiries((prev) => {
            const existingMap = new Map(prev.map((i) => [i.id, i]));
            validInquiries.forEach((i) => existingMap.set(i.id, i));
            const merged = Array.from(existingMap.values());
            safeSetItem('els_custom_inquiries', JSON.stringify(merged));
            idbSet('els_custom_inquiries', merged).catch(() => {});
            return merged;
          });
        }
      }

      if (!options?.silent) {
        showToast(
          'Supabase Connected & Synced! ☁️',
          'Loaded latest products, custom images, reviews, and settings from Supabase database.',
          'success'
        );
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase hydration error:', err);
      if (!options?.silent) {
        showToast('Supabase Load Error', err?.message || 'Could not load data from Supabase.', 'error');
      }
      return { success: false, error: err?.message };
    }
  };

  const syncWithSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast(
        'Supabase Not Configured',
        'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables to connect.',
        'info'
      );
      return;
    }

    try {
      await loadAllDataFromSupabase({ silent: true });

      // Also ensure all existing dashboard orders and inquiries are backed up to Supabase
      if (orders.length > 0) {
        await supabaseService.saveAllOrders(orders).catch(console.warn);
      }
      if (customInquiries.length > 0) {
        await supabaseService.saveAllInquiries(customInquiries).catch(console.warn);
      }

      showToast(
        'Supabase Synchronized! ☁️',
        'Products, custom images, categories, orders, and inquiries are fully synced with Supabase.'
      );
    } catch (e: any) {
      showToast('Sync Failed', e?.message || 'Could not connect to Supabase database.', 'error');
    }
  };

  const syncProductsToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      const res = await supabaseService.saveAllProducts(products);

      if (res.success) {
        showToast('Products Saved to Supabase! 🎉', `All ${res.savedCount} products are now live in your Supabase products table.`, 'success');
      } else {
        showToast('Sync Warning', res.error || 'Could not save all products.', 'error');
      }
    } catch (e: any) {
      showToast('Sync Failed', e?.message || 'Failed to push products to Supabase.', 'error');
    }
  };

  const syncOrdersToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      const effectiveOrders = orders.length > 0 ? orders : INITIAL_DEMO_ORDERS;
      const res = await supabaseService.saveAllOrders(effectiveOrders);
      if (res.success) {
        showToast('Orders Saved to Supabase! 🎉', `${res.savedCount} customer orders are stored in Supabase orders table.`, 'success');
      } else {
        showToast('Orders Sync Notice', res.error || 'Could not save orders.', 'error');
      }
    } catch (e: any) {
      showToast('Orders Sync Failed', e?.message || 'Failed to save orders to Supabase.', 'error');
    }
  };

  const syncInquiriesToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      const effectiveInquiries = customInquiries.length > 0 ? customInquiries : INITIAL_DEMO_INQUIRIES;
      const res = await supabaseService.saveAllInquiries(effectiveInquiries);
      if (res.success) {
        showToast('Inquiries Saved to Supabase! 🎉', `${res.savedCount} inquiries stored in Supabase inquiries table.`, 'success');
      } else {
        showToast('Inquiries Sync Notice', res.error || 'Could not save inquiries.', 'error');
      }
    } catch (e: any) {
      showToast('Inquiries Sync Failed', e?.message || 'Failed to save inquiries to Supabase.', 'error');
    }
  };

  const syncCategoriesToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      const ok = await supabaseService.saveAllCategories(categories);
      if (ok) {
        showToast('Categories Saved to Supabase! 🎉', `${categories.length} categories active in Supabase.`, 'success');
      } else {
        showToast('Sync Notice', 'Could not save all categories.', 'info');
      }
    } catch (e: any) {
      showToast('Categories Sync Failed', e?.message || 'Failed to save categories.', 'error');
    }
  };

  const syncReviewsToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      const ok = await supabaseService.saveAllReviews(reviews);
      if (ok) {
        showToast('Reviews Saved to Supabase! 🎉', `${reviews.length} testimonials saved in Supabase.`, 'success');
      } else {
        showToast('Sync Notice', 'Could not save all reviews.', 'info');
      }
    } catch (e: any) {
      showToast('Reviews Sync Failed', e?.message || 'Failed to save reviews.', 'error');
    }
  };

  const syncSettingsToSupabase = async () => {
    if (!supabaseService.isAvailable()) {
      showToast('Supabase Not Configured', 'Provide Supabase URL & Anon Key in the Supabase tab.', 'info');
      return;
    }
    try {
      await Promise.all([
        supabaseService.saveBusinessSettings(businessInfo, adminPin),
        supabaseService.saveSiteContent(siteContent),
        supabaseService.saveAllCategories(categories),
        supabaseService.saveAllReviews(reviews),
        supabaseService.saveAllInquiries(customInquiries),
      ]);
      showToast('Settings & Content Saved to Supabase! ✨', 'Store settings, bank info, categories, and CMS content are live in Supabase.', 'success');
    } catch (e: any) {
      showToast('Sync Failed', e?.message || 'Failed to save settings to Supabase.', 'error');
    }
  };

  const purgeSupabaseDeletedData = async (options?: { silent?: boolean }) => {
    if (!supabaseService.isAvailable()) {
      if (!options?.silent) {
        showToast('Supabase Not Configured', 'Connect Supabase credentials first.', 'info');
      }
      return;
    }
    try {
      const deletedOrders = Array.from(getDeletedOrderIds());
      const deletedInqs = Array.from(getDeletedInquiryIds());
      const savedDeletedProds = safeGetItem('els_deleted_product_ids');
      const deletedProds: string[] = savedDeletedProds ? JSON.parse(savedDeletedProds) : [];
      const activeProdIds = products.map((p) => p.id);

      const res = await supabaseService.purgeDeletedDataFromSupabase({
        activeProductIds: activeProdIds,
        deletedOrderIds: deletedOrders,
        deletedInquiryIds: deletedInqs,
        deletedProductIds: deletedProds,
      });

      if (!options?.silent) {
        if (res.success) {
          showToast(
            'Supabase Clean Complete ✨',
            `Cleaned ${res.purgedOrders} old orders, ${res.purgedInquiries} inquiries, and deleted items.`,
            'success'
          );
        } else {
          showToast('Clean Notice', res.error || 'Cleaned available records.', 'info');
        }
      }
    } catch (e: any) {
      if (!options?.silent) {
        showToast('Purge Failed', e?.message || 'Failed to purge Supabase.', 'error');
      }
    }
  };

  const saveAllDataToSupabase = async (options?: { silent?: boolean }) => {
    if (!supabaseService.isAvailable()) {
      if (!options?.silent) {
        showToast('Supabase Not Configured', 'Please configure your Supabase URL & Anon Key.', 'info');
      }
      return;
    }
    try {
      const effectiveOrders = orders.length > 0 ? orders : INITIAL_DEMO_ORDERS;
      const effectiveInquiries = customInquiries.length > 0 ? customInquiries : INITIAL_DEMO_INQUIRIES;

      const res = await supabaseService.saveAllWebsiteData({
        products,
        orders: effectiveOrders,
        inquiries: effectiveInquiries,
        categories,
        reviews,
        businessInfo,
        siteContent,
        adminPin,
      });

      // Purge any old deleted items safely in silent mode
      try {
        await purgeSupabaseDeletedData({ silent: true });
      } catch (purgeErr) {
        console.warn('Silent purge notice:', purgeErr);
      }

      if (!options?.silent) {
        if (res.success) {
          showToast(
            'Supabase Database Synced! 🌟',
            `Saved ${res.savedProducts} products, ${res.savedOrders} orders, ${res.savedInquiries} inquiries, and website settings to Supabase.`,
            'success'
          );
        } else {
          showToast('Sync Notice', res.error || 'Saved available records.', 'info');
        }
      }
    } catch (e: any) {
      if (!options?.silent) {
        showToast('Sync Failed', e?.message || 'Failed full database sync.', 'error');
      }
    }
  };

  // -------------------------------------------------------------
  // 13. REVIEWS MANAGEMENT
  // -------------------------------------------------------------
  const addReview = (newReview: Omit<ReviewItem, 'id'>) => {
    const id = 'rev-' + Date.now().toString(36);
    const fullReview: ReviewItem = { ...newReview, id };
    setReviews((prev) => [fullReview, ...prev]);
    if (supabaseService.isAvailable()) {
      supabaseService.saveReview(fullReview).catch(console.warn);
    }
    showToast('Review Added', 'New customer testimonial added.');
  };

  const updateReview = (id: string, updates: Partial<ReviewItem>) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      const target = updated.find((r) => r.id === id);
      if (target && supabaseService.isAvailable()) {
        supabaseService.saveReview(target).catch(console.warn);
      }
      return updated;
    });
    showToast('Review Saved', 'Testimonial details updated.');
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      safeSetItem('els_reviews', JSON.stringify(updated));
      idbSet('els_reviews', updated);
      return updated;
    });
    if (supabaseService.isAvailable()) {
      supabaseService.deleteReview(id).catch(console.warn);
    }
    showToast('Review Removed', 'Testimonial permanently deleted.', 'info');
  };

  // -------------------------------------------------------------
  // 14. EXPORT, IMPORT & FACTORY RESET
  // -------------------------------------------------------------
  const exportAllStoreData = (): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      businessInfo,
      siteContent,
      orders,
      customInquiries,
      reviews,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importStoreData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.businessInfo) setBusinessInfo(data.businessInfo);
      if (data.siteContent) setSiteContent(data.siteContent);
      if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
      if (data.customInquiries && Array.isArray(data.customInquiries)) setCustomInquiries(data.customInquiries);
      if (data.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
      showToast('Store Restored', 'All backup data successfully imported!');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Import Failed', 'Invalid JSON backup file provided.', 'error');
      return false;
    }
  };

  const resetAllToFactoryDefaults = () => {
    setProducts(PRODUCTS);
    setCategories(CATEGORIES_LIST);
    setBusinessInfo(DEFAULT_BUSINESS_INFO);
    setSiteContent(DEFAULT_SITE_CONTENT);
    setOrders(INITIAL_DEMO_ORDERS);
    setCustomInquiries(INITIAL_DEMO_INQUIRIES);
    setReviews(TESTIMONIALS);

    try {
      safeRemoveItem('els_products');
      safeRemoveItem('els_categories');
      safeRemoveItem('els_business_info');
      safeRemoveItem('els_site_content');
      safeRemoveItem('els_orders');
      safeRemoveItem('els_custom_inquiries');
      safeRemoveItem('els_reviews');
      safeRemoveItem('els_featured_cake_image');
      safeRemoveItem('els_subscribers');
      safeRemoveItem('els_email_settings');
      safeRemoveItem('els_email_dispatch_log');
      safeSetItem('els_admin_pin', 'chinazor');
      setAdminPin('chinazor');
    } catch {}

    showToast('Factory Reset Complete', 'All store content restored to original defaults.');
  };

  // -------------------------------------------------------------
  // 15. THEME STATE
  // -------------------------------------------------------------
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = safeGetItem('els_theme');
      return savedTheme === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      const body = document.body;
      const metaTheme = document.getElementById('theme-color-meta');
      if (isDarkMode) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (body) {
          body.classList.add('dark');
          body.setAttribute('data-theme', 'dark');
        }
        if (metaTheme) {
          metaTheme.setAttribute('content', '#0F0F12');
        }
        safeSetItem('els_theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        if (body) {
          body.classList.remove('dark');
          body.setAttribute('data-theme', 'light');
        }
        if (metaTheme) {
          metaTheme.setAttribute('content', '#ffffff');
        }
        safeSetItem('els_theme', 'light');
      }
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // -------------------------------------------------------------
  // 16. CART STATE
  // -------------------------------------------------------------
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeGetItem('els_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetItem('els_cart', JSON.stringify(cart));
  }, [cart]);

  // -------------------------------------------------------------
  // 17. WISHLIST STATE
  // -------------------------------------------------------------
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = safeGetItem('els_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetItem('els_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // -------------------------------------------------------------
  // 18. RECENTLY VIEWED STATE
  // -------------------------------------------------------------
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = safeGetItem('els_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetItem('els_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Current Order
  const [currentOrder, setCurrentOrderState] = useState<StoredOrder | null>(() => {
    try {
      const saved = safeGetItem('els_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Hydrate currentOrder from IndexedDB if not found in localStorage
    idbGet<StoredOrder>('els_last_order')
      .then((saved) => {
        if (saved && !currentOrder) {
          setCurrentOrderState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrentOrder = (order: StoredOrder | null) => {
    setCurrentOrderState(order);
    try {
      if (order) {
        const sanitized = sanitizeOrderForStorage(order);
        safeSetItem('els_last_order', JSON.stringify(sanitized));
        idbSet('els_last_order', order);
      } else {
        safeRemoveItem('els_last_order');
        idbDelete('els_last_order');
      }
    } catch {}
  };

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    hideIcon: boolean = false
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, description, type, hideIcon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (
    product: Product,
    selectedSize: ProductSize,
    selectedFlavour: CakeFlavour,
    cakeMessage: string = '',
    specialInstructions: string = '',
    quantity: number = 1
  ) => {
    const unitPrice =
      selectedSize.price !== undefined
        ? selectedSize.price
        : Math.round(product.price * (selectedSize.priceModifier || 1));
    const cartItemId = `${product.id}_${selectedSize.label}_${selectedFlavour}_${cakeMessage.trim()}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            selectedSize,
            selectedFlavour,
            cakeMessage: cakeMessage.trim(),
            specialInstructions: specialInstructions.trim(),
            quantity,
            unitPrice,
          },
        ];
      }
    });

    showToast('Added to Cart', `${product.name} (${selectedSize.label}) added to your bag.`);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Removed from Cart', 'Item removed from your shopping bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', `${product?.name || 'Cake'} removed from your saved items.`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to Wishlist', `${product?.name || 'Cake'} saved to your favourites.`);
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  };

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewed, products]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cart]);

  return (
    <AppContext.Provider
      value={{
        // Store Dynamic State
        products,
        businessInfo,
        siteContent,
        orders,
        customInquiries,
        reviews,

        // Admin Auth & Controls
        isAdmin,
        loginAdmin,
        logoutAdmin,
        adminPin,
        updateAdminPin,

        // Product CRUD
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        resetProductsToDefault,

        // Categories Management
        categories,
        addCategory,
        removeCategory,
        updateCategory,
        resetCategoriesToDefault,

        // Business & Logo Info
        updateBusinessInfo,
        updateLogoSettings,
        resetLogoToDefault,

        // Content
        updateSiteContent,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addFaq,
        updateFaq,
        deleteFaq,

        // Custom Cake Page & Flavors
        addCustomFlavor,
        deleteCustomFlavor,
        resetCustomFlavors,
        addCustomColorPalette,
        deleteCustomColorPalette,
        resetCustomColorPalettes,
        updateCustomPageConfig,

        // Orders
        saveOrder,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,

        // Custom Inquiries
        addCustomInquiry,
        updateInquiryStatus,
        deleteInquiry,
        clearAllInquiries,

        // Reviews
        addReview,
        updateReview,
        deleteReview,

        // Backup & Reset
        exportAllStoreData,
        importStoreData,
        resetAllToFactoryDefaults,

        // Supabase Cloud Sync & Management
        isSupabaseReady,
        syncWithSupabase,
        syncProductsToSupabase,
        syncOrdersToSupabase,
        syncInquiriesToSupabase,
        syncCategoriesToSupabase,
        syncReviewsToSupabase,
        syncSettingsToSupabase,
        purgeSupabaseDeletedData,
        saveAllDataToSupabase,
        loadAllDataFromSupabase,
        getTableLiveCounts: () => supabaseService.getTableLiveCounts(),

        // Cart
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),

        // Wishlist
        wishlist,
        toggleWishlist,
        isWishlisted,

        // Recently Viewed
        recentlyViewed,
        addRecentlyViewed,
        recentlyViewedProducts,

        // Modals
        quickViewProduct,
        openQuickView: (product: Product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),

        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),

        isDarkMode,
        toggleDarkMode,

        toasts,
        showToast,
        dismissToast,

        currentOrder,
        setCurrentOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
