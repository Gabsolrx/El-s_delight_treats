import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Cake,
  ShoppingBag,
  Palette,
  FileText,
  Building2,
  Star,
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Heart,
  ArrowRight,
  Save,
  RotateCcw,
  Download,
  Upload,
  UploadCloud,
  Cloud,
  RefreshCw,
  Terminal,
  Lock,
  Eye,
  EyeOff,
  Phone,
  CreditCard,
  X,
  MessageSquare,
  Check,
  Percent,
  HelpCircle,
  HeartHandshake,
  Award,
  ShieldCheck,
  Flame,
  Mail,
  BookOpen,
  Briefcase,
  Image as ImageIcon,
  Sliders,
  Type,
  Sun,
  Moon,
  Crown,
  Layers,
  FolderTree,
  FolderPlus,
  Tag,
  Calendar,
  Sparkles,
  Instagram,
  Camera,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Globe,
  Unlink,
  Plug,
  PowerOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  checkSupabaseConnection,
  setSupabaseCredentials,
  clearSupabaseCredentials,
  disconnectSupabase,
  getSupabaseConfig,
} from '../lib/supabase';
import { processGalleryImage } from '../utils/imageUpload';
import { getPromiseSvgIcon } from '../components/BrandPromiseIcons';
import {
  Product,
  CakeCategory,
  CakeFlavour,
  OccasionType,
  StoredOrder,
  OrderStatus,
  CustomCakeInquiry,
  ReviewItem,
  AnnouncementItem,
  FaqItem,
  BrandPromiseItem,
  SiteAboutValue,
  CorporatePerkItem,
  LogoSettings,
  CategoryItem,
  SiteOccasionItem,
  SiteOccasionsContent,
  SiteGalleryItem,
  SiteGalleryContent,
  DeliveryMethodOption,
  SiteBudgetSectionContent,
  SiteBudgetTierItem,
} from '../types';
import { formatNaira } from '../utils/format';
import { ElsDelightLogo, ElsDelightVectorLogo } from '../components/ElsDelightLogo';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SafeImage } from '../components/SafeImage';
import {
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_SITE_CONTENT,
  DEFAULT_BUDGET_SECTION,
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_DELIVERY_POLICY_NOTICE,
} from '../data/defaultSiteContent';
import { SUPABASE_SQL_SCHEMA_SCRIPT } from '../data/supabaseSchemaSql';
import { safeSetItem, safeRemoveItem, idbSet } from '../utils/safeStorage';

// Preset curated images for creating/replacing cake categories
const PRESET_CATEGORY_IMAGES = [
  { label: 'Celebration Masterpiece', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=400&q=80' },
  { label: 'Celebration Cakes', url: '/og-logo.png' },
  { label: 'Wedding Luxe', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Mini Celebration Cakes', url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Anniversary Luxe', url: 'https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=400&q=80' },
  { label: 'Corporate / Office', url: '/og-logo.png' },
  { label: 'Graduation Special', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Baby Shower Special', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80' },
  { label: 'Christmas Festive', url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80' },
  { label: 'Birthday Special', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Custom Artistry', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80' },
  { label: 'Pastries & Tarts', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
  { label: 'Berry & Fruit Treats', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80' },
];

// Preset curated images for About Us and Bakery Story showcase
const PRESET_BAKERY_STORY_IMAGES = [
  { label: 'Artisan Baking Kitchen', url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=900&q=80' },
  { label: 'Cake Decorating Studio', url: '/logo.svg' },
  { label: 'Fresh Oven Pastries', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80' },
  { label: 'Wedding Cake Showcase', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80' },
];

const FLAVOUR_OPTIONS: CakeFlavour[] = [
  'Vanilla Buttercream',
  'Rich Chocolate Ganache',
  'Velvet Red Velvet',
  'Fresh Strawberry Cream',
  'Toasted Coconut',
  'Spiced Carrot & Walnut',
  'Zesty Lemon Curd',
  'Marble Swirl',
  'Salted Caramel',
];

const OCCASION_OPTIONS: OccasionType[] = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Baby Shower',
  'Naming Ceremony',
  'Graduation',
  'Corporate',
  'Valentine',
  "Mother's Day",
  "Father's Day",
  'Christmas',
  'Church',
  'School',
  'General',
];

// Preset curated cake photography for 1-click selection
const PRESET_CAKE_IMAGES = [
  { label: 'Sister NK Gold Splatter', url: '/assets/sister-nk-cake.svg' },
  { label: 'Gold Splatter Artisan', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chocolate Fudge', url: '/og-logo.png' },
  { label: 'Red Velvet Crown', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pastel Celebration Cake', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80' },
  { label: '3-Tier Wedding Cake', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Strawberry Cream', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisan Pastry Treat', url: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80' },
  { label: 'Carrot & Walnut', url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vanilla Floral', url: 'https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=800&q=80' },
];

export const AdminPage: React.FC = () => {
  const {
    products,
    businessInfo,
    siteContent,
    orders,
    customInquiries,
    reviews,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    adminPin,
    updateAdminPin,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    resetProductsToDefault,
    categories,
    addCategory,
    removeCategory,
    updateCategory,
    resetCategoriesToDefault,
    updateBusinessInfo,
    updateLogoSettings,
    resetLogoToDefault,
    updateSiteContent,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addFaq,
    updateFaq,
    deleteFaq,
    updateOrderStatus,
    deleteOrder,
    clearAllOrders,
    saveOrder,
    updateInquiryStatus,
    deleteInquiry,
    clearAllInquiries,
    addReview,
    updateReview,
    deleteReview,
    exportAllStoreData,
    importStoreData,
    resetAllToFactoryDefaults,
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
    getTableLiveCounts,
    showToast,
  } = useApp();

  // Supabase State
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isSavingProductsSupabase, setIsSavingProductsSupabase] = useState(false);
  const [isSavingOrdersSupabase, setIsSavingOrdersSupabase] = useState(false);
  const [isSavingInquiriesSupabase, setIsSavingInquiriesSupabase] = useState(false);
  const [isSavingCategoriesSupabase, setIsSavingCategoriesSupabase] = useState(false);
  const [isSavingReviewsSupabase, setIsSavingReviewsSupabase] = useState(false);
  const [isSavingSettingsSupabase, setIsSavingSettingsSupabase] = useState(false);
  const [isPurgingSupabase, setIsPurgingSupabase] = useState(false);
  const [isLoadingSupabaseData, setIsLoadingSupabaseData] = useState(false);
  const [showSqlSchemaModal, setShowSqlSchemaModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'inquiries' | 'content' | 'store' | 'reviews' | 'backup'
  >('overview');

  // Live Supabase Tables Counts Inspector
  const [liveCounts, setLiveCounts] = useState<{
    products: number | null;
    orders: number | null;
    inquiries: number | null;
    categories: number | null;
    reviews: number | null;
    businessSettings: number | null;
    siteContent: number | null;
    errors?: Record<string, string>;
  } | null>(null);
  const [isLoadingLiveCounts, setIsLoadingLiveCounts] = useState(false);

  const refreshLiveCounts = useCallback(async () => {
    if (!isSupabaseReady) return;
    setIsLoadingLiveCounts(true);
    try {
      const res = await getTableLiveCounts();
      setLiveCounts(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingLiveCounts(false);
    }
  }, [isSupabaseReady, getTableLiveCounts]);

  useEffect(() => {
    if (isSupabaseReady && activeTab === 'backup') {
      refreshLiveCounts();
    }
  }, [isSupabaseReady, activeTab, refreshLiveCounts]);

  // Dynamic Supabase Credentials Editor
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);

  // Login form state
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Categories Tab State
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryItem>({
    name: '',
    label: '',
    count: '',
    image: '',
    description: '',
  });
  const [categoryImageTab, setCategoryImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [reassignCategoryTarget, setReassignCategoryTarget] = useState<string>('Birthday Cakes');
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const categoryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Products Tab State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);

  // New/Edit Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    slug: '',
    category: 'Birthday Cakes',
    price: 25000,
    oldPrice: undefined,
    description: '',
    fullDescription: '',
    images: [PRESET_CAKE_IMAGES[0].url],
    flavours: ['Rich Chocolate Ganache', 'Vanilla Buttercream'],
    sizes: [
      { name: '6 inch (Feeds 6–8)', label: '6 inch', priceModifier: 1, isBase: true },
      { name: '8 inch (Feeds 12–16)', label: '8 inch', priceModifier: 1.35 },
      { name: '10 inch (Feeds 20–25)', label: '10 inch', priceModifier: 1.75 },
    ],
    occasion: ['Birthday'],
    budgetRange: '₦20,000–₦40,000',
    preparationTime: 'Same-day available (order before 12 PM)',
    bestseller: false,
    featured: false,
    isNew: false,
    rating: 5,
    reviewCount: 14,
  });

  // Product Image Upload & Gallery State
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productImageTab, setProductImageTab] = useState<'gallery_upload' | 'presets' | 'url'>('gallery_upload');
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // Featured Today Hero Cake State
  const [isUploadingFeaturedCakeImage, setIsUploadingFeaturedCakeImage] = useState(false);
  const [featuredCakeImageTab, setFeaturedCakeImageTab] = useState<'upload' | 'presets' | 'products' | 'url'>('upload');
  const featuredCakeInputRef = useRef<HTMLInputElement | null>(null);

  // Orders Tab State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<StoredOrder | null>(null);

  // Site Content Form State
  const [contentSubTab, setContentSubTab] = useState<
    'hero' | 'budget' | 'occasions' | 'moments' | 'announcements' | 'about' | 'promises' | 'faqs' | 'corporate'
  >('hero');
  const [budgetForm, setBudgetForm] = useState<SiteBudgetSectionContent>(
    siteContent.budgetSection || DEFAULT_BUDGET_SECTION
  );
  const [heroForm, setHeroForm] = useState(siteContent.hero);
  const [aboutForm, setAboutForm] = useState(siteContent.about);
  const [brandPromisesForm, setBrandPromisesForm] = useState<BrandPromiseItem[]>(
    siteContent.brandPromises || []
  );
  const [corporateForm, setCorporateForm] = useState(
    siteContent.corporate || {
      headline: 'Sweeter Business Moments',
      subheadline: 'Corporate Gifting & Event Catering across Lagos',
      intro:
        "From staff birthdays and office meetings to client appreciation and end-of-year celebrations, El's Delight Treats creates beautiful cakes and treats for your business across Lagos.",
      perks: [],
    }
  );

  // Occasions Section Form State
  const [occasionsForm, setOccasionsForm] = useState<SiteOccasionsContent>(
    siteContent.occasionsSection || DEFAULT_SITE_CONTENT.occasionsSection!
  );
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [editingOccasionIndex, setEditingOccasionIndex] = useState<number | null>(null);
  const [occasionItemForm, setOccasionItemForm] = useState<SiteOccasionItem>({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    link: '',
  });
  const [occasionImageTab, setOccasionImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploadingOccasionImage, setIsUploadingOccasionImage] = useState(false);
  const [customOccasionImageUrl, setCustomOccasionImageUrl] = useState('');
  const occasionFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sweet Moments Form State
  const [sweetMomentsForm, setSweetMomentsForm] = useState<SiteGalleryContent>(
    siteContent.sweetMoments || DEFAULT_SITE_CONTENT.sweetMoments!
  );
  const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);
  const [editingMomentIndex, setEditingMomentIndex] = useState<number | null>(null);
  const [momentItemForm, setMomentItemForm] = useState<SiteGalleryItem>({
    id: '',
    image: '',
    tag: '',
    likes: '',
    category: 'Birthday Cakes',
  });
  const [momentImageTab, setMomentImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploadingMomentImage, setIsUploadingMomentImage] = useState(false);
  const [customMomentImageUrl, setCustomMomentImageUrl] = useState('');
  const momentFileInputRef = useRef<HTMLInputElement | null>(null);

  // Universal Delete Confirmation Modal State
  const [genericDeleteModal, setGenericDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDetails?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: 'Are you sure you want to delete this?',
    message: 'This action cannot be undone.',
    onConfirm: () => {},
  });

  const requestDelete = (
    title: string,
    message: string,
    onConfirm: () => void,
    itemDetails?: string
  ) => {
    setGenericDeleteModal({
      isOpen: true,
      title,
      message,
      itemDetails,
      onConfirm,
    });
  };

  // FAQs Manager State
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [newFaq, setNewFaq] = useState<{ q: string; a: string; category: string }>({
    q: '',
    a: '',
    category: 'Ordering & Notice',
  });

  // Values & Perks item states
  const [newAboutValue, setNewAboutValue] = useState<SiteAboutValue>({
    id: '',
    emoji: '✨',
    title: '',
    desc: '',
  });
  const [newCorporatePerk, setNewCorporatePerk] = useState<CorporatePerkItem>({
    id: '',
    title: '',
    desc: '',
  });

  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [newAnnouncementLink, setNewAnnouncementLink] = useState('/shop');
  const [newAnnouncementLinkText, setNewAnnouncementLinkText] = useState('Shop Now');

  // Announcement Editing State
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [editingAnnouncementForm, setEditingAnnouncementForm] = useState<{
    text: string;
    link: string;
    linkText: string;
    enabled: boolean;
  }>({
    text: '',
    link: '',
    linkText: '',
    enabled: true,
  });

  // About Page Showcase Image Upload State
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [aboutImageTab, setAboutImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const aboutFileInputRef = useRef<HTMLInputElement | null>(null);

  // Store & Bank Info Form State
  const [storeForm, setStoreForm] = useState(businessInfo);

  useEffect(() => {
    setStoreForm(businessInfo);
  }, [businessInfo]);

  useEffect(() => {
    setHeroForm(siteContent.hero);
  }, [siteContent.hero]);

  useEffect(() => {
    if (siteContent.budgetSection) {
      setBudgetForm(siteContent.budgetSection);
    }
  }, [siteContent.budgetSection]);

  useEffect(() => {
    if (siteContent.occasionsSection) {
      setOccasionsForm(siteContent.occasionsSection);
    }
  }, [siteContent.occasionsSection]);

  useEffect(() => {
    if (siteContent.sweetMoments) {
      setSweetMomentsForm(siteContent.sweetMoments);
    }
  }, [siteContent.sweetMoments]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File Format', 'Please upload a valid image file (PNG, JPG, SVG, WebP, GIF).', 'error');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Large File Warning', 'Images under 2MB are recommended for optimal loading performance.', 'warning');
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      setStoreForm((prev) => ({
        ...prev,
        logo: {
          ...(prev.logo || DEFAULT_LOGO_SETTINGS),
          mode: 'custom',
          customUrl: base64Url,
        },
        logoUrl: base64Url,
        logoType: 'custom',
      }));
      showToast('Image Loaded Successfully', `${file.name} ready to be previewed and saved.`);
    };
    reader.readAsDataURL(file);
  };

  const LOGO_PRESETS = [
    {
      name: 'Official Vector Crest',
      mode: 'default' as const,
      url: '',
      shape: 'transparent' as const,
      desc: 'Handcrafted gold arch & cake',
    },
    {
      name: 'Luxe Gold Emblem',
      mode: 'custom' as const,
      url: '/og-logo.png',
      shape: 'circle' as const,
      desc: 'Circular gold pastry monogram',
    },
    {
      name: 'Modern Confectionery',
      mode: 'custom' as const,
      url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80',
      shape: 'rounded' as const,
      desc: 'Pink artisan bakery seal',
    },
    {
      name: 'Boutique Patisserie',
      mode: 'custom' as const,
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      shape: 'card' as const,
      desc: 'Clean bordered treat studio card',
    },
  ];

  // Reviews Tab State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<Omit<ReviewItem, 'id'>>({
    name: '',
    location: 'Festac Town, Lagos',
    occasion: 'Birthday Celebration',
    rating: 5,
    date: 'Just now',
    text: '',
    productName: 'Classic Chocolate Birthday Cake',
    verified: true,
  });

  // PIN change state
  const [newPinInput, setNewPinInput] = useState('');

  // Backup Import State
  const [importJsonText, setImportJsonText] = useState('');

  // -------------------------------------------------------------
  // AUTHENTICATION GUARD
  // -------------------------------------------------------------
  if (!isAdmin) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      loginAdmin(pinInput);
    };

    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F0F12] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#18181C] rounded-3xl p-8 sm:p-10 border border-rose-100 dark:border-rose-950/60 shadow-xl space-y-6 text-center">
          <div className="flex justify-center">
            <ElsDelightLogo className="w-20 h-20 drop-shadow-sm" />
          </div>

          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-pink-600 dark:text-pink-400">
              Admin & Store Portal
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {businessInfo?.logo?.wordmarkText || businessInfo.name || "El's Delight"} Manager
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Enter your password to access the store management dashboard.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Store Manager</span>
            </button>
          </form>

          <div className="pt-2 border-t border-rose-50 dark:border-stone-800">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-pink-600 transition-colors inline-flex items-center gap-1"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CALC OVERVIEW METRICS
  // -------------------------------------------------------------
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_payment_verification').length;
  const newInquiriesCount = customInquiries.filter((i) => i.status === 'new').length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchesSearch =
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const basePrice = prod.price || 25000;
    const sizesWithExplicitPrices = (prod.sizes || []).map((s) => ({
      ...s,
      price: s.price !== undefined ? s.price : Math.round(basePrice * (s.priceModifier || 1)),
    }));
    setProductForm({
      ...prod,
      sizes: sizesWithExplicitPrices.length > 0 ? sizesWithExplicitPrices : [
        { name: '6 inch (Feeds 6–8)', label: '6 inch', price: basePrice, priceModifier: 1, isBase: true },
        { name: '8 inch (Feeds 12–16)', label: '8 inch', price: Math.round(basePrice * 1.35), priceModifier: 1.35 },
        { name: '10 inch (Feeds 20–25)', label: '10 inch', price: Math.round(basePrice * 1.75), priceModifier: 1.75 },
      ],
    });
    setIsProductModalOpen(true);
  };

  // Open Create Product Modal
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      category: 'Birthday Cakes',
      price: 25000,
      oldPrice: undefined,
      description: '',
      fullDescription: '',
      images: [PRESET_CAKE_IMAGES[0].url],
      flavours: ['Rich Chocolate Ganache', 'Vanilla Buttercream'],
      sizes: [
        { name: '6 inch (Feeds 6–8)', label: '6 inch', price: 25000, priceModifier: 1, isBase: true },
        { name: '8 inch (Feeds 12–16)', label: '8 inch', price: 35000, priceModifier: 1.4 },
        { name: '10 inch (Feeds 20–25)', label: '10 inch', price: 45000, priceModifier: 1.8 },
      ],
      occasion: ['Birthday'],
      budgetRange: '₦20,000–₦40,000',
      preparationTime: 'Same-day available (order before 12 PM)',
      bestseller: false,
      featured: false,
      isNew: true,
      rating: 5,
      reviewCount: 1,
    });
    setIsProductModalOpen(true);
  };

  // Save Product Form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      showToast('Cake name is required', '', 'error');
      return;
    }

    const baseSize = (productForm.sizes || []).find((s) => s.isBase) || (productForm.sizes || [])[0];
    const finalBasePrice = baseSize?.price !== undefined ? Number(baseSize.price) : Number(productForm.price || 25000);

    const updatedSizes = (productForm.sizes || []).map((s) => {
      const p = s.price !== undefined ? Number(s.price) : Math.round(finalBasePrice * (s.priceModifier || 1));
      return {
        ...s,
        price: p,
        priceModifier: finalBasePrice > 0 ? Number((p / finalBasePrice).toFixed(2)) : 1,
      };
    });

    const finalProduct = {
      ...productForm,
      price: finalBasePrice,
      sizes: updatedSizes,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, finalProduct);
    } else {
      addProduct(finalProduct as Omit<Product, 'id'>);
    }
    setIsProductModalOpen(false);
  };

  // Direct Gallery Photo Upload Handler
  const handleProductGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingProductImage(true);
    try {
      const processedImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processGalleryImage(file);
        processedImages.push(dataUrl);
      }

      setProductForm((prev) => {
        const existing = prev.images || [];
        return {
          ...prev,
          images: [...processedImages, ...existing],
        };
      });

      showToast(
        'Photo Uploaded from Gallery! 📸',
        `${files.length} photo${files.length > 1 ? 's' : ''} added successfully.`
      );
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process gallery image.', 'error');
    } finally {
      setIsUploadingProductImage(false);
      e.target.value = '';
    }
  };

  // Request Delete Product Modal
  const handleRequestDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteProductModalOpen(true);
  };

  // Confirm Delete Product Permanently
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    setIsDeleteProductModalOpen(false);
    setProductToDelete(null);
    if (isProductModalOpen && editingProduct?.id === productToDelete.id) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
    }
  };

  // -------------------------------------------------------------
  // OCCASIONS SECTION HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddOccasion = () => {
    setEditingOccasionIndex(null);
    setOccasionItemForm({
      id: 'New Occasion',
      title: '',
      subtitle: '',
      image: PRESET_CATEGORY_IMAGES[0].url,
      link: '',
    });
    setCustomOccasionImageUrl('');
    setOccasionImageTab('upload');
    setIsOccasionModalOpen(true);
  };

  const handleOpenEditOccasion = (occ: SiteOccasionItem, idx: number) => {
    setEditingOccasionIndex(idx);
    setOccasionItemForm({ ...occ });
    setCustomOccasionImageUrl('');
    setOccasionImageTab('upload');
    setIsOccasionModalOpen(true);
  };

  const handleOccasionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingOccasionImage(true);
    try {
      const dataUrl = await processGalleryImage(file, 960, 960, 0.82);
      setOccasionItemForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('Image Uploaded ✨', 'Occasion photo processed successfully.');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process image', 'error');
    } finally {
      setIsUploadingOccasionImage(false);
      e.target.value = '';
    }
  };

  const handleSaveOccasionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionItemForm.title.trim()) {
      showToast('Title Required', 'Please enter a title for the occasion card.', 'error');
      return;
    }
    const currentItems = occasionsForm.items ? [...occasionsForm.items] : [];
    const formattedItem: SiteOccasionItem = {
      ...occasionItemForm,
      id: occasionItemForm.id?.trim() || occasionItemForm.title.trim(),
      title: occasionItemForm.title.trim(),
      subtitle: occasionItemForm.subtitle.trim(),
      image: occasionItemForm.image || PRESET_CATEGORY_IMAGES[0].url,
    };

    let updatedItems: SiteOccasionItem[];
    if (editingOccasionIndex !== null && editingOccasionIndex >= 0) {
      updatedItems = currentItems.map((item, i) =>
        i === editingOccasionIndex ? formattedItem : item
      );
    } else {
      updatedItems = [...currentItems, formattedItem];
    }

    const updatedOccasions = { ...occasionsForm, items: updatedItems };
    setOccasionsForm(updatedOccasions);
    updateSiteContent({ occasionsSection: updatedOccasions });
    setIsOccasionModalOpen(false);
    setEditingOccasionIndex(null);
    showToast(
      'Occasion Card Saved! ✨',
      `"${formattedItem.title}" updated live on the website.`
    );
  };

  const handleDeleteOccasionItem = (idx: number) => {
    const currentItems = occasionsForm.items ? [...occasionsForm.items] : [];
    const item = currentItems[idx];
    requestDelete(
      'Delete Occasion Card?',
      `Are you sure you want to delete the occasion card "${item?.title || 'this item'}" from the Find a Cake for Every Occasion section?`,
      () => {
        const updatedItems = currentItems.filter((_, i) => i !== idx);
        const updatedOccasions = { ...occasionsForm, items: updatedItems };
        setOccasionsForm(updatedOccasions);
        updateSiteContent({ occasionsSection: updatedOccasions });
        showToast('Occasion Card Deleted', `"${item?.title || 'Card'}" was removed.`, 'info');
      },
      item?.subtitle ? `“${item.subtitle}”` : undefined
    );
  };

  const handleMoveOccasion = (idx: number, direction: 'up' | 'down') => {
    const currentItems = occasionsForm.items ? [...occasionsForm.items] : [];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentItems.length) return;
    const temp = currentItems[idx];
    currentItems[idx] = currentItems[targetIdx];
    currentItems[targetIdx] = temp;
    const updatedOccasions = { ...occasionsForm, items: currentItems };
    setOccasionsForm(updatedOccasions);
    updateSiteContent({ occasionsSection: updatedOccasions });
  };

  const handleSaveOccasionsSection = () => {
    updateSiteContent({ occasionsSection: occasionsForm });
    showToast('Occasions Section Saved! ✨', 'Homepage celebrations section updated live.');
  };

  const handleResetOccasionsDefault = () => {
    if (DEFAULT_SITE_CONTENT.occasionsSection) {
      setOccasionsForm(DEFAULT_SITE_CONTENT.occasionsSection);
      updateSiteContent({ occasionsSection: DEFAULT_SITE_CONTENT.occasionsSection });
      showToast('Occasions Reset', 'Restored factory default occasions list and copy.');
    }
  };

  // -------------------------------------------------------------
  // BUDGET & CELEBRATION TIERS HANDLERS
  // -------------------------------------------------------------
  const handleSaveBudgetSection = () => {
    updateSiteContent({ budgetSection: budgetForm });
    showToast('Budget Tiers Saved! ✨', 'Homepage budget & celebration tiers updated live.');
  };

  const handleResetBudgetDefault = () => {
    setBudgetForm(DEFAULT_BUDGET_SECTION);
    updateSiteContent({ budgetSection: DEFAULT_BUDGET_SECTION });
    showToast('Budget Tiers Reset', 'Restored default celebration tiers.');
  };

  // -------------------------------------------------------------
  // SWEET MOMENTS (INSTAGRAM GALLERY) HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddMoment = () => {
    setEditingMomentIndex(null);
    setMomentItemForm({
      id: 'gal-' + Date.now().toString(36),
      image: PRESET_CAKE_IMAGES[0].url,
      tag: '#SweetMoments',
      likes: '220',
      category: 'Birthday Cakes',
    });
    setCustomMomentImageUrl('');
    setMomentImageTab('upload');
    setIsMomentModalOpen(true);
  };

  const handleOpenEditMoment = (item: SiteGalleryItem, idx: number) => {
    setEditingMomentIndex(idx);
    setMomentItemForm({ ...item });
    setCustomMomentImageUrl('');
    setMomentImageTab('upload');
    setIsMomentModalOpen(true);
  };

  const handleMomentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMomentImage(true);
    try {
      const dataUrl = await processGalleryImage(file, 960, 960, 0.82);
      setMomentItemForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('Photo Uploaded ✨', 'Gallery image processed successfully.');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process image', 'error');
    } finally {
      setIsUploadingMomentImage(false);
      e.target.value = '';
    }
  };

  const handleSaveMomentItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentItemForm.image) {
      showToast('Image Required', 'Please select or upload a photo for the gallery moment.', 'error');
      return;
    }
    const currentItems = sweetMomentsForm.items ? [...sweetMomentsForm.items] : [];
    const formattedItem: SiteGalleryItem = {
      ...momentItemForm,
      id: momentItemForm.id || 'gal-' + Date.now().toString(36),
      tag: momentItemForm.tag?.startsWith('#') ? momentItemForm.tag : `#${momentItemForm.tag || 'SweetMoments'}`,
      likes: momentItemForm.likes || '150',
      category: momentItemForm.category || 'Birthday Cakes',
    };

    let updatedItems: SiteGalleryItem[];
    if (editingMomentIndex !== null && editingMomentIndex >= 0) {
      updatedItems = currentItems.map((item, i) =>
        i === editingMomentIndex ? formattedItem : item
      );
    } else {
      updatedItems = [...currentItems, formattedItem];
    }

    const updatedGallery = { ...sweetMomentsForm, items: updatedItems };
    setSweetMomentsForm(updatedGallery);
    updateSiteContent({ sweetMoments: updatedGallery });
    setIsMomentModalOpen(false);
    setEditingMomentIndex(null);
    showToast(
      'Sweet Moment Saved! ✨',
      `"${formattedItem.tag}" updated live in website gallery.`
    );
  };

  const handleDeleteMomentItem = (idx: number) => {
    const currentItems = sweetMomentsForm.items ? [...sweetMomentsForm.items] : [];
    const item = currentItems[idx];
    requestDelete(
      'Delete Sweet Moment?',
      `Are you sure you want to delete "${item?.tag || 'this moment photo'}" from Sweet Moments at El's?`,
      () => {
        const updatedItems = currentItems.filter((_, i) => i !== idx);
        const updatedGallery = { ...sweetMomentsForm, items: updatedItems };
        setSweetMomentsForm(updatedGallery);
        updateSiteContent({ sweetMoments: updatedGallery });
        showToast('Photo Removed', `"${item?.tag || 'Moment'}" was removed from the gallery.`, 'info');
      },
      item?.category ? `Category: ${item.category} · Likes: ${item.likes}` : undefined
    );
  };

  const handleMoveMoment = (idx: number, direction: 'up' | 'down') => {
    const currentItems = sweetMomentsForm.items ? [...sweetMomentsForm.items] : [];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentItems.length) return;
    const temp = currentItems[idx];
    currentItems[idx] = currentItems[targetIdx];
    currentItems[targetIdx] = temp;
    const updatedGallery = { ...sweetMomentsForm, items: currentItems };
    setSweetMomentsForm(updatedGallery);
    updateSiteContent({ sweetMoments: updatedGallery });
  };

  const handleSaveSweetMoments = () => {
    updateSiteContent({ sweetMoments: sweetMomentsForm });
    showToast('Sweet Moments Updated! ✨', 'Instagram gallery section updated live across the website.');
  };

  const handleResetSweetMomentsDefault = () => {
    if (DEFAULT_SITE_CONTENT.sweetMoments) {
      setSweetMomentsForm(DEFAULT_SITE_CONTENT.sweetMoments);
      updateSiteContent({ sweetMoments: DEFAULT_SITE_CONTENT.sweetMoments });
      showToast('Sweet Moments Reset', 'Restored factory default Instagram gallery copy and items.');
    }
  };

  // -------------------------------------------------------------
  // ABOUT PAGE BAKERY STORY SHOWCASE IMAGE HANDLERS
  // -------------------------------------------------------------
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAboutImage(true);
    try {
      const dataUrl = await processGalleryImage(file, 1200, 900, 0.85);
      const updated = { ...aboutForm, imageUrl: dataUrl };
      setAboutForm(updated);
      updateSiteContent({ about: updated });
      showToast('Showcase Image Uploaded! 📸✨', 'Bakery story showcase photo updated successfully.');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process image', 'error');
    } finally {
      setIsUploadingAboutImage(false);
      e.target.value = '';
    }
  };

  // -------------------------------------------------------------
  // ANNOUNCEMENTS EDIT HANDLERS
  // -------------------------------------------------------------
  const handleOpenEditAnnouncement = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setEditingAnnouncementForm({
      text: ann.text,
      link: ann.link || '',
      linkText: ann.linkText || '',
      enabled: ann.enabled,
    });
  };

  const handleSaveEditAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    if (!editingAnnouncementForm.text.trim()) {
      showToast('Text Required', 'Announcement message cannot be empty.', 'error');
      return;
    }
    updateAnnouncement(editingAnnouncement.id, {
      text: editingAnnouncementForm.text.trim(),
      link: editingAnnouncementForm.link.trim(),
      linkText: editingAnnouncementForm.linkText.trim(),
      enabled: editingAnnouncementForm.enabled,
    });
    setEditingAnnouncement(null);
    showToast('Announcement Updated! ✨', 'Message saved and updated on website.');
  };

  // -------------------------------------------------------------
  // CATEGORIES MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      label: 'Artisan handcrafted flavours',
      count: 'Fresh daily',
      image: PRESET_CATEGORY_IMAGES[0].url,
      description: '',
    });
    setCategoryImageTab('upload');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      label: cat.label || 'Artisan handcrafted flavours',
      count: cat.count || 'Fresh daily',
      image: cat.image || PRESET_CATEGORY_IMAGES[0].url,
      description: cat.description || '',
    });
    setCategoryImageTab('upload');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Category Name Required', 'Please enter a name for the category.', 'warning');
      return;
    }

    const payload: CategoryItem = {
      ...categoryForm,
      name: categoryForm.name.trim(),
      label: categoryForm.label.trim() || 'Artisan handcrafted flavours',
      count: categoryForm.count?.trim() || 'Fresh daily',
      image:
        categoryForm.image?.trim() ||
        '/og-logo.png',
    };

    if (editingCategory) {
      updateCategory(editingCategory.name, payload);
    } else {
      addCategory(payload);
    }

    if (payload.name.toLowerCase().includes('christmas') && payload.image) {
      safeSetItem('els_christmas_category_image', payload.image);
      idbSet('els_christmas_category_image', payload.image);
    }

    setIsCategoryModalOpen(false);
  };

  const handleOpenDeleteCategory = (cat: CategoryItem) => {
    setCategoryToDelete(cat);
    const other = categories.find((c) => c.name.toLowerCase() !== cat.name.toLowerCase());
    setReassignCategoryTarget(other ? other.name : 'Birthday Cakes');
    setIsDeleteCategoryModalOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    removeCategory(categoryToDelete.name, reassignCategoryTarget);
    setIsDeleteCategoryModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleCategoryGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCategoryImage(true);
    try {
      const dataUrl = await processGalleryImage(file);
      setCategoryForm((prev) => ({
        ...prev,
        image: dataUrl,
      }));
      showToast('Category Photo Uploaded! 📸', 'Optimized image ready to save.');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process gallery image.', 'error');
    } finally {
      setIsUploadingCategoryImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4F2] dark:bg-[#0E0B0D] text-stone-900 dark:text-stone-100 flex flex-col">
      {/* ========================================================= */}
      {/* TOP ADMIN BAR                                             */}
      {/* ========================================================= */}
      <header className="bg-white dark:bg-[#16161A] border-b border-rose-100 dark:border-stone-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ElsDelightLogo className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
            <div className="-ml-0.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold text-rose-950 dark:text-rose-100 leading-none">
                  {businessInfo?.logo?.wordmarkText || businessInfo.name || "El's Delight"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[10px] font-bold uppercase tracking-wider">
                  Admin Studio
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Real-time Live Website Editor & Order Manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-rose-50 dark:border-stone-800/60 py-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount },
            { id: 'inquiries', label: `Custom Inquiries (${customInquiries.length})`, badge: newInquiriesCount },
            { id: 'content', label: 'Site Content & Banners', icon: FileText },
            { id: 'store', label: 'Store & Brand Settings', icon: Building2 },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
            { id: 'backup', label: 'Backup & Settings', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-rose-50/70 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE                                      */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ------------------------------------------------------- */}
        {/* 1. OVERVIEW TAB                                         */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Total Order Value
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {formatNaira(totalRevenue)}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    ● Stanbic IBTC bank verified
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Customer Orders
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {orders.length}
                  </h3>
                  <span className="text-[11px] text-pink-600 font-semibold mt-1 inline-block">
                    {pendingOrdersCount} pending verification
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Live Products
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {products.length}
                  </h3>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    Across {categories.length} categories
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Custom Requests
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {customInquiries.length}
                  </h3>
                  <span className="text-[11px] text-pink-600 font-semibold mt-1 inline-block">
                    {newInquiriesCount} new WhatsApp inquiries
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase Cloud Connection & Sync Banner */}
            <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-purple-50/50 dark:from-emerald-950/30 dark:via-stone-900 dark:to-purple-950/20 p-5 sm:p-6 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      Supabase PostgreSQL Cloud Storage
                    </h4>
                    {isSupabaseReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Setup Available
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Sync all {products.length} catalog products, customer orders ({orders.length}), inquiries ({customInquiries.length}), categories ({categories.length}), and settings.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingProductsSupabase || isSavingOrdersSupabase || isSavingSettingsSupabase}
                  onClick={async () => {
                    setIsSavingProductsSupabase(true);
                    setIsSavingOrdersSupabase(true);
                    setIsSavingSettingsSupabase(true);
                    await saveAllDataToSupabase();
                    setIsSavingProductsSupabase(false);
                    setIsSavingOrdersSupabase(false);
                    setIsSavingSettingsSupabase(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSavingProductsSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingProductsSupabase ? 'Syncing Everything...' : 'Sync Everything to Supabase'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlSchemaModal(true)}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-stone-500" />
                  <span>View Schema (SQL)</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
              <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Quick Store Actions
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <button
                  onClick={handleOpenCreateProduct}
                  className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Add New Cake</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Categories ({categories.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className="p-4 rounded-2xl bg-pink-50/50 dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Hero Featured Cake</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Review Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Customize Logo</span>
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-left font-semibold text-xs transition-colors flex flex-col gap-2"
                >
                  <span>Bank & Contact</span>
                </button>
              </div>
            </div>

            {/* Overview Quick Controls: Featured Cake & Categories Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Widget 1: Featured Today Cake Controls */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                        Featured Today Cake (Hero Visual)
                      </h4>
                      <p className="text-[11px] text-stone-500">Live showcase on homepage hero</p>
                    </div>

                    {heroForm.showFeaturedCake !== false && Boolean(heroForm.featuredCakeImage) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live on Site
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold">
                        Removed / Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-rose-50/40 dark:bg-stone-900/60 p-3 rounded-2xl border border-rose-100 dark:border-stone-800 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                      {heroForm.featuredCakeImage && heroForm.showFeaturedCake !== false ? (
                        <img
                          src={heroForm.featuredCakeImage}
                          alt={heroForm.featuredCakeTitle || 'Featured Cake'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-1 text-center">
                          <Cake className="w-6 h-6 mb-1 text-stone-300" />
                          <span className="text-[9px] leading-tight">No Cake</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {heroForm.featuredCakeTitle || 'Sister NK Birthday Cake'}
                      </p>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        {heroForm.featuredCakePrice || '₦38,000'}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                        {heroForm.featuredCakeSubtitle || 'Handcrafted Fresh · 500+ Lagos Celebrations'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-50 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('content');
                      setFeaturedCakeImageTab('upload');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Replace Cake</span>
                  </button>

                  {heroForm.showFeaturedCake !== false && Boolean(heroForm.featuredCakeImage) ? (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedHero = {
                          ...heroForm,
                          featuredCakeImage: '',
                          showFeaturedCake: false,
                        };
                        setHeroForm(updatedHero);
                        updateSiteContent({ hero: updatedHero });
                        safeRemoveItem('els_featured_cake_image');
                        showToast('Featured Cake Removed 🗑️', 'Showcase removed from homepage hero.');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove from Homepage</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedHero = {
                          ...heroForm,
                          showFeaturedCake: true,
                          featuredCakeImage: '/assets/sister-nk-cake.svg',
                          featuredCakeTitle: 'Gold Splatter "Happy Birthday Sister NK" Cake',
                        };
                        setHeroForm(updatedHero);
                        updateSiteContent({ hero: updatedHero });
                        safeSetItem('els_featured_cake_image', '/assets/sister-nk-cake.svg');
                        idbSet('els_featured_cake_image', '/assets/sister-nk-cake.svg');
                        showToast('Featured Cake Restored ✨', 'Sister NK cake is now live on the homepage.');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-pink-200 dark:border-pink-900/60 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Cake</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1 ml-auto"
                  >
                    <span>Full Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Widget 2: Website Categories Spotlight */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                          Website Categories ({categories.length})
                        </h4>
                        <p className="text-[11px] text-stone-500">Navigation styles & shop catalogue</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1"
                    >
                      <span>Manage All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Horizontal mini gallery of categories */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
                    {categories.slice(0, 6).map((cat) => (
                      <div
                        key={cat.name}
                        onClick={() => {
                          setActiveTab('categories');
                          handleOpenEditCategory(cat);
                        }}
                        className="group flex flex-col items-center shrink-0 cursor-pointer p-1.5 rounded-xl hover:bg-rose-50/70 dark:hover:bg-stone-800 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-rose-200 dark:border-stone-700 p-0.5 bg-white dark:bg-stone-900">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200 mt-1 max-w-[60px] truncate text-center">
                          {cat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-rose-50 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={handleOpenCreateCategory}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Category</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View & Organize All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    Latest Incoming Orders
                  </h4>
                  <p className="text-xs text-stone-500">Live feed from checkout & WhatsApp payment flow</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-rose-50 dark:divide-stone-800">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.orderId} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {order.customer.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                          {order.orderId}
                        </span>
                      </div>
                      <p className="text-stone-500 mt-0.5">
                        {order.items.map((i) => `${i.product.name} (${i.selectedSize.label})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold tabular-nums text-stone-900 dark:text-stone-100 text-sm">
                        {formatNaira(order.total)}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.status === 'baking'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 2. PRODUCTS TAB                                         */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Products & Inventory
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Add, edit, change pricing, upload pictures, and toggle bestsellers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-pink-950/30 hover:bg-pink-100 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors flex items-center justify-center"
                >
                  <span>Categories ({categories.length})</span>
                </button>

                <button
                  onClick={resetProductsToDefault}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors flex items-center justify-center"
                >
                  <span>Reset Catalog</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingProductsSupabase}
                  onClick={async () => {
                    setIsSavingProductsSupabase(true);
                    await syncProductsToSupabase();
                    setIsSavingProductsSupabase(false);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-stone-900 hover:bg-pink-50 dark:hover:bg-rose-950/40 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors flex items-center justify-center shadow-2xs"
                  title="Upload all website products and active images into Supabase database"
                >
                  <span>{isSavingProductsSupabase ? 'Saving to Supabase...' : 'Save Products to Supabase'}</span>
                </button>

                <button
                  onClick={handleOpenCreateProduct}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center"
                >
                  <span>Add New Cake</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-[#16161A] p-4 rounded-2xl border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or description..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#16161A] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative aspect-4/3 bg-stone-100 dark:bg-stone-900 overflow-hidden">
                      <SafeImage
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                          {product.name}
                        </h4>
                        <span className="font-bold text-sm text-pink-600 dark:text-pink-400 tabular-nums shrink-0">
                          {formatNaira(product.price)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-1">
                        {product.flavours.slice(0, 3).map((f) => (
                          <span key={f} className="text-[10px] bg-rose-50 dark:bg-stone-800 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md">
                            {f}
                          </span>
                        ))}
                        {product.flavours.length > 3 && (
                          <span className="text-[10px] text-stone-400">+{product.flavours.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-stone-50/50 dark:bg-stone-900/40 border-t border-rose-50 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateProduct(product.id, { bestseller: !product.bestseller })}
                        className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                          product.bestseller
                            ? 'bg-pink-100 text-pink-700 border-pink-200'
                            : 'bg-white dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {product.bestseller ? '★ Bestseller' : 'Mark Bestseller'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateProduct(product.id)}
                        title="Duplicate cake"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditProduct(product)}
                        title="Edit cake details"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-pink-600 hover:bg-rose-50 dark:hover:bg-stone-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRequestDeleteProduct(product)}
                        title="Permanently delete cake"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 2B. CATEGORIES TAB                                      */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Cake Categories & Catalogue Styles
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold">
                    {categories.length} Active
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Manage the categories displayed in the Homepage <strong>"Explore Our Cake Catalogue"</strong> carousel, Shop filter bar, and product editor.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSavingCategoriesSupabase}
                  onClick={async () => {
                    setIsSavingCategoriesSupabase(true);
                    await syncCategoriesToSupabase();
                    setIsSavingCategoriesSupabase(false);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-stone-900 hover:bg-pink-50 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Upload all categories into the Supabase categories table"
                >
                  <Database className={`w-3.5 h-3.5 ${isSavingCategoriesSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingCategoriesSupabase ? 'Saving to Supabase...' : `Save All ${categories.length} Categories to Supabase`}</span>
                </button>

                <button
                  type="button"
                  onClick={resetCategoriesToDefault}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateCategory}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>
            </div>

            {/* Storefront Integration Info Banner */}
            <div className="bg-gradient-to-r from-pink-50 via-rose-50/60 to-amber-50/40 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-stone-900 p-4 rounded-2xl border border-pink-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    Live Storefront Sync Active
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Any category added, edited, or removed here immediately updates the homepage circle carousel and the shop catalogue filter.
                  </p>
                </div>
              </div>

              <Link
                to="/#categories"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-pink-200 dark:border-stone-700 hover:bg-pink-50 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <span>Preview on Homepage</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-[#16161A] p-4 rounded-2xl border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories by name, tagline, or style..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="text-xs text-stone-500 shrink-0">
                Total Products: <strong>{products.length}</strong> cakes categorized
              </div>
            </div>

            {/* Categories Cards Grid */}
            {categories.filter((cat) =>
              cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
              (cat.label && cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
            ).length === 0 ? (
              <div className="bg-white dark:bg-[#16161A] rounded-3xl border border-rose-100 dark:border-stone-800 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  No Categories Found
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {categorySearch
                    ? `No categories match "${categorySearch}". Try a different search term.`
                    : 'There are currently no categories on your website.'}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCreateCategory}
                    className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetCategoriesToDefault}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                  >
                    Restore Defaults
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categories
                  .filter((cat) =>
                    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                    (cat.label && cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
                  )
                  .map((cat) => {
                    const assignedProductsCount = products.filter(
                      (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={cat.name}
                        className="bg-white dark:bg-[#16161A] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                      >
                        {/* Category Visual Banner with overlay badges & actions */}
                        <div className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-900">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                          {/* Top-left: Products count badge */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <Cake className="w-3 h-3 text-pink-400" />
                            <span>{assignedProductsCount} Cake{assignedProductsCount === 1 ? '' : 's'}</span>
                          </div>

                          {/* Top-right: Floating quick actions */}
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              title="Edit this category"
                              className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteCategory(cat)}
                              title="Remove this category"
                              className="p-1.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bottom title overlay */}
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h4 className="font-serif text-base font-bold drop-shadow-sm line-clamp-1">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-stone-200 drop-shadow-sm line-clamp-1 mt-0.5">
                              {cat.label || 'Artisan style'}
                            </p>
                          </div>
                        </div>

                        {/* Card Info & Navigation Link */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3" />
                              <span>{cat.count || 'Catalogue Style'}</span>
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Live on Carousel
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-rose-50 dark:border-stone-800/80">
                            <Link
                              to={`/shop?category=${encodeURIComponent(cat.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>View in Shop</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteCategory(cat)}
                              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Remove category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 3. ORDERS TAB                                           */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Customer Orders ({orders.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Track payments, update baking and dispatch status, and WhatsApp customers directly.
                </p>
              </div>

              {/* Quick test order creator */}
              <button
                onClick={() => {
                  const testOrder: StoredOrder = {
                    orderId: 'ELD-' + Math.floor(10000 + Math.random() * 90000),
                    createdAt: new Date().toISOString(),
                    items: [
                      {
                        id: 'test_item_' + Date.now(),
                        productId: products[0].id,
                        product: products[0],
                        selectedSize: products[0].sizes[0],
                        selectedFlavour: products[0].flavours[0],
                        cakeMessage: 'Congratulations!',
                        quantity: 1,
                        unitPrice: products[0].price,
                      },
                    ],
                    customer: {
                      fullName: 'Olumide Jacobs',
                      phone: '08123456789',
                      email: 'olumide@example.com',
                      fulfillmentType: 'delivery',
                      address: '24 Admiralty Way',
                      area: 'Lekki Phase 1',
                      deliveryDate: 'Friday',
                      deliveryTime: 'Morning',
                    },
                    subtotal: products[0].price,
                    deliveryFee: 3500,
                    total: products[0].price + 3500,
                    status: 'pending_payment_verification',
                  };
                  saveOrder(testOrder);
                  showToast('Test Order Added', `Generated test order ${testOrder.orderId}`);
                }}
                className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Demo Order</span>
              </button>

              <button
                type="button"
                disabled={isSavingOrdersSupabase}
                onClick={async () => {
                  setIsSavingOrdersSupabase(true);
                  await syncOrdersToSupabase();
                  setIsSavingOrdersSupabase(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Save all customer orders in the dashboard into the Supabase orders table"
              >
                <Database className={`w-3.5 h-3.5 ${isSavingOrdersSupabase ? 'animate-spin' : ''}`} />
                <span>{isSavingOrdersSupabase ? 'Saving to Supabase...' : `Save All ${orders.length} Orders to Supabase`}</span>
              </button>

              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all customer orders? This will permanently remove them from the dashboard and from Supabase.')) {
                      clearAllOrders();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Permanently remove all orders"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All Orders</span>
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
              {[
                'All',
                'pending_payment_verification',
                'confirmed',
                'baking',
                'out_for_delivery',
                'completed',
                'cancelled',
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  {st === 'All' ? 'All Orders' : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#16161A] rounded-3xl border border-rose-100 dark:border-stone-800">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No orders matching this filter.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const customerWhatsAppMsg = `Hello ${order.customer.fullName}, this is El's Delight Treats regarding your Order #${order.orderId}. Your order status is: ${order.status.replace(/_/g, ' ')}.`;
                  const waUrl = `https://wa.me/234${order.customer.phone.replace(/^0/, '')}?text=${encodeURIComponent(customerWhatsAppMsg)}`;

                  return (
                    <div
                      key={order.orderId}
                      className="bg-white dark:bg-[#16161A] p-5 sm:p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-50 dark:border-stone-800/80 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                              {order.customer.fullName}
                            </span>
                            <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded">
                              #{order.orderId}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} · {order.customer.phone} · {order.customer.email || 'No email provided'}
                          </p>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="pending_payment_verification">Pending Payment Verification</option>
                            <option value="confirmed">Payment Confirmed</option>
                            <option value="baking">Baking in Studio</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="completed">Completed / Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => {
                              requestDelete(
                                'Delete Order Record?',
                                `Are you sure you want to delete order #${order.orderId}? This record will be permanently deleted from admin logs.`,
                                () => deleteOrder(order.orderId),
                                `Customer: ${order.customer.fullName} · Total: ${formatNaira(order.total)}`
                              );
                            }}
                            title="Delete order"
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items & Fulfillment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">Items Ordered:</span>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-stone-900 dark:text-stone-100">
                                    {item.product.name} (x{item.quantity})
                                  </p>
                                  <p className="text-[11px] text-stone-500">
                                    {item.selectedSize.label} · {item.selectedFlavour}
                                  </p>
                                  {item.cakeMessage && (
                                    <p className="text-[11px] text-pink-600 italic">"{item.cakeMessage}"</p>
                                  )}
                                </div>
                                <span className="font-bold tabular-nums">
                                  {formatNaira(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 bg-rose-50/40 dark:bg-stone-900/40 p-3.5 rounded-2xl border border-rose-100/60 dark:border-stone-800">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">Fulfillment & Delivery:</span>
                          <p><strong>Type:</strong> {order.customer.fulfillmentType === 'pickup' ? 'Self-Pickup at Studio' : 'Lagos Delivery'}</p>
                          {order.customer.address && (
                            <p><strong>Address:</strong> {order.customer.address}, {order.customer.area} {order.customer.landmark ? `(${order.customer.landmark})` : ''}</p>
                          )}
                          <p><strong>Scheduled:</strong> {order.customer.deliveryDate} · {order.customer.deliveryTime}</p>
                          {order.customer.specialInstructions && (
                            <p className="text-stone-600 dark:text-stone-400"><strong>Note:</strong> {order.customer.specialInstructions}</p>
                          )}
                          <div className="pt-2 border-t border-rose-100/60 dark:border-stone-800 flex justify-between font-bold text-sm text-pink-600 dark:text-pink-400">
                            <span>Total Amount:</span>
                            <span className="tabular-nums">{formatNaira(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-stone-500 italic">
                          {order.adminNotes ? `Admin note: ${order.adminNotes}` : 'No notes attached.'}
                        </div>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          <WhatsAppIcon className="w-4 h-4 fill-white" />
                          <span>Chat Customer on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 4. CUSTOM INQUIRIES TAB                                 */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Custom Cake Inquiries ({customInquiries.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Bespoke requests submitted through the custom cake builder form.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {customInquiries.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        requestDelete(
                          'Clear All Inquiries & Messages?',
                          'This will permanently delete all customer inquiries from the dashboard and from the Supabase inquiries table.',
                          () => clearAllInquiries(),
                          `${customInquiries.length} total inquiries will be permanently removed.`
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold transition-colors flex items-center justify-center border border-rose-200/60 dark:border-rose-900/40 shadow-2xs"
                      title="Permanently remove all inquiries from admin and Supabase database"
                    >
                      <span>Delete All from DB</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSavingInquiriesSupabase}
                      onClick={async () => {
                        setIsSavingInquiriesSupabase(true);
                        await syncInquiriesToSupabase();
                        setIsSavingInquiriesSupabase(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors flex items-center justify-center shadow-2xs"
                      title="Upload all custom cake inquiries into the Supabase inquiries table"
                    >
                      <span>{isSavingInquiriesSupabase ? 'Saving to Supabase...' : `Save All ${customInquiries.length} Inquiries to Supabase`}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {customInquiries.map((inq) => {
                const quoteWhatsApp = `Hello ${inq.data.fullName}, thank you for contacting El's Delight Treats for your ${inq.data.occasion} cake. We have reviewed your request for ${inq.data.cakeSize} with theme "${inq.data.colourTheme}".`;
                const waUrl = `https://wa.me/234${inq.data.phone.replace(/^0/, '')}?text=${encodeURIComponent(quoteWhatsApp)}`;

                return (
                  <div
                    key={inq.id}
                    className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-50 dark:border-stone-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {inq.data.fullName}
                          </h4>
                          <span className="text-xs text-pink-600 font-semibold bg-rose-50 dark:bg-stone-800 px-2 py-0.5 rounded">
                            {inq.data.occasion}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {inq.data.phone} · {inq.data.email || 'No email'} · Needed by: <strong>{inq.data.preferredDate}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="new">New Inquiry</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quote Sent</option>
                          <option value="deposit_paid">Deposit Paid</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button
                          onClick={() => {
                            requestDelete(
                              'Delete Custom Cake Inquiry?',
                              `Are you sure you want to delete inquiry #${inq.id}? This will delete it permanently from the admin dashboard and Supabase database.`,
                              () => deleteInquiry(inq.id),
                              `Customer: ${inq.data.fullName} · Phone: ${inq.data.phone} · Event Date: ${inq.data.preferredDate}`
                            );
                          }}
                          title="Delete inquiry"
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl">
                      <div>
                        <p className="text-stone-500">Size & Tiers:</p>
                        <p className="font-bold text-stone-900 dark:text-stone-100">{inq.data.cakeSize} · {inq.data.tiers}</p>
                        <p className="text-stone-500 mt-2">Flavour:</p>
                        <p className="font-bold text-stone-900 dark:text-stone-100">{inq.data.flavour}</p>
                      </div>

                      <div>
                        <p className="text-stone-500">Theme & Palette:</p>
                        <p className="font-bold text-stone-900 dark:text-stone-100">{inq.data.colourTheme}</p>
                        <p className="text-stone-500 mt-2">Budget Range:</p>
                        <p className="font-bold text-pink-600 dark:text-pink-400">{inq.data.budgetRange}</p>
                      </div>

                      <div>
                        <p className="text-stone-500">Cake Inscription:</p>
                        <p className="italic text-stone-900 dark:text-stone-100">"{inq.data.cakeMessage || 'None'}"</p>
                        <p className="text-stone-500 mt-2">Delivery Target:</p>
                        <p className="font-bold">{inq.data.deliveryType === 'delivery' ? inq.data.deliveryArea : 'Studio Pickup'}</p>
                      </div>
                    </div>

                    {inq.data.themeDescription && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 bg-rose-50/50 dark:bg-stone-800/40 p-3 rounded-xl border border-rose-100/60 dark:border-stone-800">
                        <strong>Description:</strong> {inq.data.themeDescription}
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-stone-400">
                        Received on {new Date(inq.createdAt).toLocaleString()}
                      </span>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-white" />
                        <span>Send WhatsApp Proposal</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 5. SITE CONTENT & BANNERS TAB                           */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Website Content Management
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Full control over all text, banners, story pages, brand promises, FAQs, and corporate packages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingSettingsSupabase}
                  onClick={async () => {
                    setIsSavingSettingsSupabase(true);
                    await syncSettingsToSupabase();
                    setIsSavingSettingsSupabase(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Save all website content and CMS banners to Supabase"
                >
                  <Database className={`w-3.5 h-3.5 ${isSavingSettingsSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingSettingsSupabase ? 'Saving to Supabase...' : 'Save Content to Supabase'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 hover:bg-pink-100 text-xs font-semibold transition-colors shrink-0"
                >
                  <Palette className="w-4 h-4 text-pink-600" />
                  <span>Customize Brand Logo & Crest →</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation Ribbon */}
            <div className="flex flex-wrap gap-2 border-b border-rose-100 dark:border-stone-800 pb-3">
              {[
                { id: 'hero', label: 'Hero Banner', icon: Cake },
                { id: 'budget', label: 'Budget & Celebration Tiers', icon: Sparkles },
                { id: 'occasions', label: `Occasions (${(occasionsForm.items || []).length})`, icon: Calendar },
                { id: 'moments', label: `Sweet Moments (${(sweetMomentsForm.items || []).length})`, icon: Instagram },
                { id: 'announcements', label: `Announcements (${siteContent.announcements.length})` },
                { id: 'about', label: 'About Us & Story', icon: BookOpen },
                { id: 'promises', label: 'Brand Promises', icon: Award },
                { id: 'faqs', label: `FAQs (${(siteContent.faqs || []).length})`, icon: HelpCircle },
                { id: 'corporate', label: 'Corporate Solutions', icon: Briefcase },
              ].map((sub) => {
                const SubIcon = sub.icon;
                const isCurrent = contentSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setContentSubTab(sub.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SUBTAB 1: HERO BANNER */}
            {contentSubTab === 'hero' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      Homepage Hero Banner Copy & Actions
                    </h4>
                    <p className="text-xs text-stone-500">The first high-converting impression customers see on arrival.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteContent({ hero: heroForm });
                      showToast('Hero Copy Saved! ✨', 'Homepage hero banner updated successfully.');
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Hero Copy</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Top Kicker Badge Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.kicker}
                      onChange={(e) => setHeroForm({ ...heroForm, kicker: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={heroForm.headline}
                      onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-serif"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Supporting Description
                    </label>
                    <textarea
                      rows={3}
                      value={heroForm.supportingCopy}
                      onChange={(e) => setHeroForm({ ...heroForm, supportingCopy: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.primaryCtaText}
                      onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      value={heroForm.primaryCtaLink || '/shop'}
                      onChange={(e) => setHeroForm({ ...heroForm, primaryCtaLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Secondary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.secondaryCtaText}
                      onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={heroForm.secondaryCtaLink || '/treats'}
                      onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Custom Cake Consultations Button Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.customCakeCtaText || 'Design Bespoke Cake'}
                      onChange={(e) => setHeroForm({ ...heroForm, customCakeCtaText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Trust Badge 1
                    </label>
                    <input
                      type="text"
                      value={heroForm.badge1 || 'Lagos Island & Mainland Express Dispatch'}
                      onChange={(e) => setHeroForm({ ...heroForm, badge1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Trust Badge 2
                    </label>
                    <input
                      type="text"
                      value={heroForm.badge2 || 'Stanbic IBTC Direct Verification'}
                      onChange={(e) => setHeroForm({ ...heroForm, badge2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Trust Badge 3
                    </label>
                    <input
                      type="text"
                      value={heroForm.badge3 || 'Freshly Baked Daily'}
                      onChange={(e) => setHeroForm({ ...heroForm, badge3: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  {/* ========================================================= */}
                  {/* FEATURED TODAY CAKE (HERO RIGHT VISUAL)                   */}
                  {/* ========================================================= */}
                  <div className="sm:col-span-2 pt-6 border-t border-rose-200/80 dark:border-stone-800 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>Featured Today Cake (Hero Showcase)</span>
                          {heroForm.showFeaturedCake !== false && Boolean(heroForm.featuredCakeImage) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live on Homepage
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-150 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold">
                              Hidden / Removed
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          Easily remove or replace the hero cake anytime. You can upload photos from your phone gallery, pick any cake from your store, or toggle visibility.
                        </p>
                      </div>

                      {/* Header Actions: Toggle & Publish */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Visibility Toggle Switch */}
                        <label className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={heroForm.showFeaturedCake !== false && Boolean(heroForm.featuredCakeImage)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const updatedHero = {
                                ...heroForm,
                                showFeaturedCake: isChecked,
                                featuredCakeImage: isChecked
                                  ? (heroForm.featuredCakeImage || '/assets/sister-nk-cake.svg')
                                  : '',
                              };
                              setHeroForm(updatedHero);
                              updateSiteContent({ hero: updatedHero });
                              if (!isChecked) {
                                safeRemoveItem('els_featured_cake_image');
                                showToast('Featured Cake Removed 🗑️', 'Showcase is hidden. Hero copy now displays across full width.');
                              } else {
                                safeSetItem('els_featured_cake_image', updatedHero.featuredCakeImage);
                                idbSet('els_featured_cake_image', updatedHero.featuredCakeImage);
                                showToast('Featured Cake Activated ✨', 'Featured showcase is now live on the homepage.');
                              }
                            }}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            Show on Homepage
                          </span>
                        </label>

                        {/* Top Publish Button */}
                        <button
                          type="button"
                          onClick={() => {
                            updateSiteContent({ hero: heroForm });
                            if (heroForm.featuredCakeImage) {
                              safeSetItem('els_featured_cake_image', heroForm.featuredCakeImage);
                              idbSet('els_featured_cake_image', heroForm.featuredCakeImage);
                            }
                            showToast('Featured Cake Published! 🎂✨', 'Homepage hero banner updated live.');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Publish Cake</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode Tabs for Replacing the Cake */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setFeaturedCakeImageTab('upload')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          featuredCakeImageTab === 'upload'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Gallery Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedCakeImageTab('products')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          featuredCakeImageTab === 'products'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Store Catalog ({products.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedCakeImageTab('presets')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          featuredCakeImageTab === 'presets'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <Cake className="w-3.5 h-3.5" />
                        <span>Presets</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedCakeImageTab('url')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          featuredCakeImageTab === 'url'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                      </button>
                    </div>

                    {/* Visual Preview + Editor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-rose-50/40 dark:bg-stone-900/60 p-5 rounded-3xl border border-rose-100 dark:border-stone-800">
                      {/* Left: Live Visual Preview Card */}
                      <div className="md:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 bg-white dark:bg-stone-900 aspect-4/5 group">
                        {heroForm.featuredCakeImage && heroForm.showFeaturedCake !== false ? (
                          <>
                            <img
                              src={heroForm.featuredCakeImage}
                              alt={heroForm.featuredCakeTitle || 'Featured Cake'}
                              className="w-full h-full object-cover"
                            />

                            {/* Floating Action Buttons over preview: Replace & Remove */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                              <button
                                type="button"
                                onClick={() => featuredCakeInputRef.current?.click()}
                                className="px-2 py-1 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs"
                                title="Replace with photo from gallery"
                              >
                                <UploadCloud className="w-3 h-3" />
                                <span>Replace</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  requestDelete(
                                    'Remove Featured Cake?',
                                    'Are you sure you want to remove the featured cake photo from the homepage hero banner?',
                                    () => {
                                      const updatedHero = {
                                        ...heroForm,
                                        featuredCakeImage: '',
                                        showFeaturedCake: false,
                                      };
                                      setHeroForm(updatedHero);
                                      updateSiteContent({ hero: updatedHero });
                                      safeRemoveItem('els_featured_cake_image');
                                      showToast('Featured Cake Removed 🗑️', 'Cake removed and hidden from homepage.');
                                    }
                                  );
                                }}
                                className="p-1 rounded-xl bg-red-600/80 hover:bg-red-700 text-white transition-all shadow-xs"
                                title="Remove this cake photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price badge */}
                            <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-2 rounded-xl shadow-xs border border-rose-100 dark:border-stone-800 text-right">
                              <p className="text-[8px] uppercase font-semibold text-pink-600 dark:text-pink-400 tracking-wider">
                                {heroForm.featuredCakeTag || 'Featured Today'}
                              </p>
                              <p className="text-[10px] font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                                {heroForm.featuredCakeTitle || 'Sister NK Birthday Cake'}
                              </p>
                              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                {heroForm.featuredCakePrice || '₦38,000'}
                              </p>
                            </div>
                          </>
                        ) : (
                          /* Empty / Removed State */
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50 dark:bg-stone-900/80">
                            <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-rose-950/60 text-pink-600 flex items-center justify-center mb-3">
                              <Cake className="w-7 h-7" />
                            </div>
                            <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                              Featured Cake is Removed
                            </h5>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-[200px]">
                              The homepage hero currently displays clean full-width copy.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setFeaturedCakeImageTab('upload');
                                featuredCakeInputRef.current?.click();
                              }}
                              className="mt-4 px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Replacement Photo</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Controls & Replace Options */}
                      <div className="md:col-span-7 space-y-4 text-xs">
                        {/* Hidden file input for programmatic replace triggers */}
                        <input
                          ref={featuredCakeInputRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingFeaturedCakeImage(true);
                            try {
                              const dataUrl = await processGalleryImage(file);
                              const updatedHero = {
                                ...heroForm,
                                showFeaturedCake: true,
                                featuredCakeImage: dataUrl,
                              };
                              setHeroForm(updatedHero);
                              updateSiteContent({ hero: updatedHero });
                              safeSetItem('els_featured_cake_image', dataUrl);
                              idbSet('els_featured_cake_image', dataUrl);
                              showToast('Photo Replaced & Live! 📸🎂', 'Your new photo is now live on the homepage hero.');
                            } catch (err: any) {
                              showToast('Upload Failed', err?.message || 'Could not process image.', 'error');
                            } finally {
                              setIsUploadingFeaturedCakeImage(false);
                              e.target.value = '';
                            }
                          }}
                          disabled={isUploadingFeaturedCakeImage}
                          className="hidden"
                        />

                        {/* Replace Mode 1: Gallery Upload */}
                        {featuredCakeImageTab === 'upload' && (
                          <div>
                            <label className="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-pink-300 dark:border-pink-900/80 rounded-2xl bg-white dark:bg-stone-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 transition-all text-center group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingFeaturedCakeImage(true);
                                  try {
                                    const dataUrl = await processGalleryImage(file);
                                    const updatedHero = {
                                      ...heroForm,
                                      showFeaturedCake: true,
                                      featuredCakeImage: dataUrl,
                                    };
                                    setHeroForm(updatedHero);
                                    updateSiteContent({ hero: updatedHero });
                                    safeSetItem('els_featured_cake_image', dataUrl);
                                    idbSet('els_featured_cake_image', dataUrl);
                                    showToast('Photo Replaced & Live! 📸🎂', 'Your new photo is now live on the homepage hero.');
                                  } catch (err: any) {
                                    showToast('Upload Failed', err?.message || 'Could not process image.', 'error');
                                  } finally {
                                    setIsUploadingFeaturedCakeImage(false);
                                    e.target.value = '';
                                  }
                                }}
                                disabled={isUploadingFeaturedCakeImage}
                                className="hidden"
                              />
                              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-rose-950/60 text-pink-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                {isUploadingFeaturedCakeImage ? (
                                  <RefreshCw className="w-5 h-5 animate-spin text-pink-600" />
                                ) : (
                                  <UploadCloud className="w-5 h-5 text-pink-600" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                {isUploadingFeaturedCakeImage ? 'Compressing & Publishing Live...' : 'Tap to Choose Replacement Photo from Gallery'}
                              </span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                Select cake image (JPG, PNG) · Auto-compressed & updated live
                              </span>
                            </label>
                          </div>
                        )}

                        {/* Replace Mode 2: Store Catalog Products */}
                        {featuredCakeImageTab === 'products' && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                              Click any cake from your store catalog to replace the featured cake instantly:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                              {products.map((prod) => (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => {
                                    const prodImg = prod.images?.[0] || '/assets/sister-nk-cake.svg';
                                    const updated = {
                                      ...heroForm,
                                      showFeaturedCake: true,
                                      featuredCakeImage: prodImg,
                                      featuredCakeTitle: prod.name,
                                      featuredCakePrice: formatNaira(prod.price),
                                      featuredCakeTag: 'Featured Today',
                                      featuredCakeRating: `${prod.rating ? prod.rating.toFixed(1) : '5.0'} / 5.0 Rating`,
                                      featuredCakeSubtitle: prod.category || 'Celebration Cake',
                                    };
                                    setHeroForm(updatedHero => ({ ...updatedHero, ...updated }));
                                    updateSiteContent({ hero: updated });
                                    safeSetItem('els_featured_cake_image', prodImg);
                                    idbSet('els_featured_cake_image', prodImg);
                                    showToast('Featured Cake Replaced! 🎂', `Now featuring "${prod.name}" from your store.`);
                                  }}
                                  className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                                    heroForm.featuredCakeTitle === prod.name
                                      ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/40 ring-1 ring-pink-600'
                                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-300'
                                  }`}
                                >
                                  <img
                                    src={prod.images?.[0] || '/assets/sister-nk-cake.svg'}
                                    alt={prod.name}
                                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold text-stone-900 dark:text-stone-100 truncate">{prod.name}</p>
                                    <p className="text-[9px] font-semibold text-rose-600 dark:text-rose-400">{formatNaira(prod.price)}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Replace Mode 3: Presets */}
                        {featuredCakeImageTab === 'presets' && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                              Choose from Presets (click to replace & publish live):
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {PRESET_CAKE_IMAGES.slice(0, 6).map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    const updatedHero = {
                                      ...heroForm,
                                      showFeaturedCake: true,
                                      featuredCakeImage: preset.url,
                                      featuredCakeTitle: preset.label.includes('Sister NK')
                                        ? 'Gold Splatter "Happy Birthday Sister NK" Cake'
                                        : preset.label,
                                    };
                                    setHeroForm(updatedHero);
                                    updateSiteContent({ hero: updatedHero });
                                    safeSetItem('els_featured_cake_image', preset.url);
                                    idbSet('els_featured_cake_image', preset.url);
                                    showToast('Preset Applied & Live! ✨', `${preset.label} is now active on the homepage.`);
                                  }}
                                  className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                                    heroForm.featuredCakeImage === preset.url
                                      ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/40 ring-1 ring-pink-600'
                                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-300'
                                  }`}
                                >
                                  <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                  <span className="text-[10px] font-semibold truncate">{preset.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Replace Mode 4: Web URL */}
                        {featuredCakeImageTab === 'url' && (
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Image URL
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={heroForm.featuredCakeImage || ''}
                                onChange={(e) => setHeroForm({ ...heroForm, featuredCakeImage: e.target.value })}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedHero = { ...heroForm, showFeaturedCake: true };
                                  setHeroForm(updatedHero);
                                  updateSiteContent({ hero: updatedHero });
                                  if (heroForm.featuredCakeImage) {
                                    safeSetItem('els_featured_cake_image', heroForm.featuredCakeImage);
                                    idbSet('els_featured_cake_image', heroForm.featuredCakeImage);
                                  }
                                  showToast('URL Saved & Published! 🌐', 'Hero image updated with URL.');
                                }}
                                className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Text Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Featured Cake Name
                            </label>
                            <input
                              type="text"
                              value={heroForm.featuredCakeTitle || ''}
                              onChange={(e) => setHeroForm({ ...heroForm, featuredCakeTitle: e.target.value })}
                              placeholder="e.g. Gold Splatter Sister NK Cake"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Price Tag Text
                            </label>
                            <input
                              type="text"
                              value={heroForm.featuredCakePrice || ''}
                              onChange={(e) => setHeroForm({ ...heroForm, featuredCakePrice: e.target.value })}
                              placeholder="e.g. ₦38,000"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-bold text-rose-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Floating Tag Badge
                            </label>
                            <input
                              type="text"
                              value={heroForm.featuredCakeTag || ''}
                              onChange={(e) => setHeroForm({ ...heroForm, featuredCakeTag: e.target.value })}
                              placeholder="e.g. Featured Today"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Customer Rating Text
                            </label>
                            <input
                              type="text"
                              value={heroForm.featuredCakeRating || ''}
                              onChange={(e) => setHeroForm({ ...heroForm, featuredCakeRating: e.target.value })}
                              placeholder="e.g. 5.0 / 5.0 Rating"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Rating Subtitle
                            </label>
                            <input
                              type="text"
                              value={heroForm.featuredCakeSubtitle || ''}
                              onChange={(e) => setHeroForm({ ...heroForm, featuredCakeSubtitle: e.target.value })}
                              placeholder="e.g. Over 500+ Lagos Celebrations"
                              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs"
                            />
                          </div>
                        </div>

                        {/* Direct Bottom Action Bar */}
                        <div className="pt-3 border-t border-rose-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => {
                                requestDelete(
                                  'Remove Featured Cake?',
                                  'Are you sure you want to remove the featured cake showcase from the homepage?',
                                  () => {
                                    const updatedHero = {
                                      ...heroForm,
                                      featuredCakeImage: '',
                                      showFeaturedCake: false,
                                    };
                                    setHeroForm(updatedHero);
                                    updateSiteContent({ hero: updatedHero });
                                    safeRemoveItem('els_featured_cake_image');
                                    showToast('Featured Cake Removed 🗑️', 'The cake showcase is removed from the homepage.');
                                  }
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Cake</span>
                            </button>

                            {/* Restore Sister NK Cake */}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedHero = {
                                  ...heroForm,
                                  showFeaturedCake: true,
                                  featuredCakeImage: '/assets/sister-nk-cake.svg',
                                  featuredCakeTitle: 'Gold Splatter "Happy Birthday Sister NK" Cake',
                                  featuredCakePrice: '₦38,000',
                                  featuredCakeTag: 'Featured Today',
                                  featuredCakeRating: '5.0 / 5.0 Rating',
                                  featuredCakeSubtitle: 'Over 500+ Lagos Celebrations',
                                };
                                setHeroForm(updatedHero);
                                updateSiteContent({ hero: updatedHero });
                                safeSetItem('els_featured_cake_image', '/assets/sister-nk-cake.svg');
                                idbSet('els_featured_cake_image', '/assets/sister-nk-cake.svg');
                                showToast('Sister NK Cake Restored 🎂', 'The signature Sister NK cake is live.');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Sister NK Cake</span>
                            </button>
                          </div>

                          {/* Save & Publish All Changes */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSiteContent({ hero: heroForm });
                              if (heroForm.featuredCakeImage) {
                                safeSetItem('els_featured_cake_image', heroForm.featuredCakeImage);
                                idbSet('els_featured_cake_image', heroForm.featuredCakeImage);
                              }
                              showToast('Featured Cake Showcase Published! 🎂✨', 'Homepage hero banner updated live.');
                            }}
                            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow flex items-center gap-1.5 transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save & Publish Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: BUDGET & CELEBRATION TIERS */}
            {contentSubTab === 'budget' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-4 gap-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                      <span>Homepage Budget & Celebration Tiers</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Edit prices, writeups, bullet points, and buttons for Petite Celebrations, Celebration, and Luxury & Weddings tiers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetBudgetDefault}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBudgetSection}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Budget Tiers</span>
                    </button>
                  </div>
                </div>

                {/* Section Header Settings */}
                <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-rose-100/60 dark:border-stone-800 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Section Headline & Introduction
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Eyebrow / Badge Text
                      </label>
                      <input
                        type="text"
                        value={budgetForm.badge || ''}
                        onChange={(e) => setBudgetForm({ ...budgetForm, badge: e.target.value })}
                        placeholder="e.g. Affordable Luxury"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Main Section Headline
                      </label>
                      <input
                        type="text"
                        value={budgetForm.headline || ''}
                        onChange={(e) => setBudgetForm({ ...budgetForm, headline: e.target.value })}
                        placeholder="e.g. Something Sweet for Every Budget"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Supporting Subtitle / Paragraph
                      </label>
                      <textarea
                        rows={2}
                        value={budgetForm.subtitle || ''}
                        onChange={(e) => setBudgetForm({ ...budgetForm, subtitle: e.target.value })}
                        placeholder="Whether it's an impromptu solo indulgence..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Tier Editor Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* TIER 1: Pocket-Friendly & Quick / Petite Celebrations */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-rose-200 dark:border-stone-800 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                        Tier 1: Pocket-Friendly
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                        Petite
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Eyebrow Writeup
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier1?.eyebrow || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier1: { ...budgetForm.tier1, eyebrow: e.target.value },
                            })
                          }
                          placeholder="e.g. Pocket-Friendly & Quick"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Tier Title
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier1?.title || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier1: { ...budgetForm.tier1, title: e.target.value },
                            })
                          }
                          placeholder="e.g. Petite Celebrations"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                          Price Display (Editable)
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier1?.price || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier1: { ...budgetForm.tier1, price: e.target.value },
                            })
                          }
                          placeholder="e.g. ₦20,000 – ₦30,000"
                          className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-stone-950 font-bold text-xs text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-pink-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Included Features (1 per line)
                        </label>
                        <textarea
                          rows={4}
                          value={(budgetForm.tier1?.features || []).join('\n')}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier1: {
                                ...budgetForm.tier1,
                                features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                              },
                            })
                          }
                          placeholder="Single-tier 6-inch layer cakes&#10;Feeds 6–8 family and friends&#10;Free customized piped inscription&#10;Same-day express pickup & dispatch"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500 leading-relaxed font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier1?.buttonText || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier1: { ...budgetForm.tier1, buttonText: e.target.value },
                              })
                            }
                            placeholder="Shop Petite Cakes"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier1?.buttonLink || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier1: { ...budgetForm.tier1, buttonLink: e.target.value },
                              })
                            }
                            placeholder="/shop?price=20k-40k"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TIER 2: Unforgettable Memories / Celebration */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-pink-400 dark:border-pink-800 space-y-4 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                        Tier 2: Celebration
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-600 text-white">
                        Most Popular
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Eyebrow Writeup
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier2?.eyebrow || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier2: { ...budgetForm.tier2, eyebrow: e.target.value },
                            })
                          }
                          placeholder="e.g. Unforgettable Memories"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Tier Title
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier2?.title || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier2: { ...budgetForm.tier2, title: e.target.value },
                            })
                          }
                          placeholder="e.g. Celebration"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                          Price Display (Editable)
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier2?.price || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier2: { ...budgetForm.tier2, price: e.target.value },
                            })
                          }
                          placeholder="e.g. ₦10,000 – ₦40,000"
                          className="w-full px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-stone-950 font-bold text-xs text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-pink-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Included Features (1 per line)
                        </label>
                        <textarea
                          rows={4}
                          value={(budgetForm.tier2?.features || []).join('\n')}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier2: {
                                ...budgetForm.tier2,
                                features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                              },
                            })
                          }
                          placeholder="Signature chocolate, red velvet & vanilla&#10;6, 8, and 10-inch birthday cakes&#10;Free customized piped inscription&#10;Anniversaries, graduations & family cakes"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500 leading-relaxed font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier2?.buttonText || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier2: { ...budgetForm.tier2, buttonText: e.target.value },
                              })
                            }
                            placeholder="Shop Celebration"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier2?.buttonLink || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier2: { ...budgetForm.tier2, buttonLink: e.target.value },
                              })
                            }
                            placeholder="/shop?price=10k-40k"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TIER 3: Grand Occasions / Luxury & Weddings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900/60 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-100 dark:border-stone-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Tier 3: Grand Occasions
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        Luxury & Weddings
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Eyebrow Writeup
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier3?.eyebrow || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier3: { ...budgetForm.tier3, eyebrow: e.target.value },
                            })
                          }
                          placeholder="e.g. Grand Occasions"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Tier Title
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier3?.title || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier3: { ...budgetForm.tier3, title: e.target.value },
                            })
                          }
                          placeholder="e.g. Luxury & Weddings"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                          Price Display (Editable)
                        </label>
                        <input
                          type="text"
                          value={budgetForm.tier3?.price || ''}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier3: { ...budgetForm.tier3, price: e.target.value },
                            })
                          }
                          placeholder="e.g. ₦80,000+"
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-stone-950 font-bold text-xs text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-pink-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Included Features (1 per line)
                        </label>
                        <textarea
                          rows={4}
                          value={(budgetForm.tier3?.features || []).join('\n')}
                          onChange={(e) =>
                            setBudgetForm({
                              ...budgetForm,
                              tier3: {
                                ...budgetForm.tier3,
                                features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                              },
                            })
                          }
                          placeholder="2-Tier & 3-Tier luxury wedding cakes&#10;Hand-crafted sugar flora & 24k gold leaf&#10;Large corporate event sheet cakes&#10;White-glove setup & dedicated delivery"
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500 leading-relaxed font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier3?.buttonText || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier3: { ...budgetForm.tier3, buttonText: e.target.value },
                              })
                            }
                            placeholder="Shop Luxury"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={budgetForm.tier3?.buttonLink || ''}
                            onChange={(e) =>
                              setBudgetForm({
                                ...budgetForm,
                                tier3: { ...budgetForm.tier3, buttonLink: e.target.value },
                              })
                            }
                            placeholder="/shop?price=80k-plus"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="pt-4 border-t border-rose-100 dark:border-stone-800 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBudgetSection}
                    className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish Budget Tiers</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBTAB: OCCASIONS SECTION ("Find a Cake for Every Occasion") */}
            {contentSubTab === 'occasions' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-4 gap-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      "Find a Cake for Every Occasion" Section
                    </h4>
                    <p className="text-xs text-stone-500">
                      Customize the homepage celebration collections, headlines, and occasion photography.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetOccasionsDefault}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveOccasionsSection}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Occasions Copy</span>
                    </button>
                  </div>
                </div>

                {/* Section Header Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-rose-100/60 dark:border-stone-800">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Kicker / Badge Text
                    </label>
                    <input
                      type="text"
                      value={occasionsForm.badge}
                      onChange={(e) => setOccasionsForm({ ...occasionsForm, badge: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Curated for Nigerian Celebrations"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Main Section Headline
                    </label>
                    <input
                      type="text"
                      value={occasionsForm.headline}
                      onChange={(e) => setOccasionsForm({ ...occasionsForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-serif font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Find a Cake for Every Occasion"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      "View All" Button Link Text
                    </label>
                    <input
                      type="text"
                      value={occasionsForm.viewAllText}
                      onChange={(e) => setOccasionsForm({ ...occasionsForm, viewAllText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. View All Occasion Collections"
                    />
                  </div>
                </div>

                {/* Occasion Cards Header */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      Occasion Collections ({occasionsForm.items?.length || 0})
                    </h5>
                    <p className="text-xs text-stone-500">
                      Cards rendered in the homepage grid. Customers click these to view curated cakes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddOccasion}
                    className="px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-rose-950/60 text-pink-600 dark:text-pink-300 hover:bg-pink-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Occasion Card</span>
                  </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {occasionsForm.items?.map((occ, idx) => (
                    <div
                      key={occ.id || idx}
                      className="group relative rounded-2xl border border-rose-100 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-16/9 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <img
                          src={occ.image}
                          alt={occ.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                            #{idx + 1} · {occ.id}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleMoveOccasion(idx, 'up')}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-30"
                            title="Move earlier"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOccasion(idx, 'down')}
                            disabled={idx === occasionsForm.items.length - 1}
                            className="w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-30"
                            title="Move later"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h6 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {occ.title}
                        </h6>
                        <p className="text-xs text-stone-500 line-clamp-2">{occ.subtitle}</p>
                        {occ.link && (
                          <p className="text-[10px] text-pink-600 dark:text-pink-400 truncate">
                            Target: {occ.link}
                          </p>
                        )}
                      </div>
                      <div className="px-3.5 py-2.5 bg-stone-50/70 dark:bg-stone-900/60 border-t border-rose-50 dark:border-stone-800 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditOccasion(occ, idx)}
                          className="px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 hover:text-pink-600 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOccasionItem(idx)}
                          className="px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: SWEET MOMENTS SECTION ("Sweet Moments at El's") */}
            {contentSubTab === 'moments' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-4 gap-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      "Sweet Moments at El's" (Instagram Gallery Section)
                    </h4>
                    <p className="text-xs text-stone-500">
                      Manage customer moments, Instagram profile button, headlines, hashtags, and likes displayed on the frontend.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetSweetMomentsDefault}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSweetMoments}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Moments</span>
                    </button>
                  </div>
                </div>

                {/* Section Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-rose-100/60 dark:border-stone-800">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Instagram Handle / Badge
                    </label>
                    <input
                      type="text"
                      value={sweetMomentsForm.badge || ''}
                      onChange={(e) => setSweetMomentsForm({ ...sweetMomentsForm, badge: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. els_delighttreats"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Section Headline
                    </label>
                    <input
                      type="text"
                      value={sweetMomentsForm.headline}
                      onChange={(e) => setSweetMomentsForm({ ...sweetMomentsForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-serif font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Sweet Moments at El's"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={sweetMomentsForm.buttonText}
                      onChange={(e) => setSweetMomentsForm({ ...sweetMomentsForm, buttonText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Follow Us on Instagram"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={sweetMomentsForm.buttonUrl || ''}
                      onChange={(e) => setSweetMomentsForm({ ...sweetMomentsForm, buttonUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500 font-mono text-[11px]"
                      placeholder="https://www.instagram.com/..."
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Subtitle / Narrative
                    </label>
                    <textarea
                      rows={2}
                      value={sweetMomentsForm.subtitle}
                      onChange={(e) => setSweetMomentsForm({ ...sweetMomentsForm, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-pink-500"
                      placeholder="Follow our daily baking journey, live frosting reels, and client setups in Lagos."
                    />
                  </div>
                </div>

                {/* Gallery Photos Header */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      Moments Gallery Photos ({sweetMomentsForm.items?.length || 0})
                    </h5>
                    <p className="text-xs text-stone-500">
                      Photography displayed in the interactive grid with Instagram link overlays.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddMoment}
                    className="px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-rose-950/60 text-pink-600 dark:text-pink-300 hover:bg-pink-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sweet Moment</span>
                  </button>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {sweetMomentsForm.items?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="group relative rounded-2xl border border-rose-100 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.tag}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleMoveMoment(idx, 'up')}
                            disabled={idx === 0}
                            className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-30"
                            title="Move left"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMoment(idx, 'down')}
                            disabled={idx === sweetMomentsForm.items.length - 1}
                            className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-30"
                            title="Move right"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <span className="inline-block text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-rose-50 dark:bg-stone-800 px-1.5 py-0.5 rounded truncate max-w-full">
                          {item.tag}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span className="truncate">{item.category}</span>
                          <span className="font-semibold text-rose-500 shrink-0">♥ {item.likes}</span>
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-stone-50/70 dark:bg-stone-900/60 border-t border-rose-50 dark:border-stone-800 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMoment(item, idx)}
                          className="p-1 rounded text-stone-500 hover:text-pink-600 transition-colors"
                          title="Edit photo & caption"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMomentItem(idx)}
                          className="p-1 rounded text-stone-500 hover:text-rose-600 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {contentSubTab === 'announcements' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="border-b border-rose-100 dark:border-stone-800 pb-3">
                  <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    Top Announcement Bar Messages
                  </h4>
                  <p className="text-xs text-stone-500">These rotate automatically across the top banner of all pages.</p>
                </div>

                {/* Add New Announcement */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 space-y-3">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Add New Announcement Message:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Free delivery on orders above ₦80,000 this weekend!"
                      value={newAnnouncementText}
                      onChange={(e) => setNewAnnouncementText(e.target.value)}
                      className="sm:col-span-6 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Link (e.g. /shop)"
                      value={newAnnouncementLink}
                      onChange={(e) => setNewAnnouncementLink(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Link Text (e.g. Order Now)"
                      value={newAnnouncementLinkText}
                      onChange={(e) => setNewAnnouncementLinkText(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAnnouncementText) return;
                        addAnnouncement({
                          text: newAnnouncementText,
                          link: newAnnouncementLink,
                          linkText: newAnnouncementLinkText,
                          enabled: true,
                        });
                        setNewAnnouncementText('');
                        showToast('Announcement Added', 'The new message is now active on the top bar.');
                      }}
                      className="sm:col-span-2 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Existing Announcements */}
                <div className="divide-y divide-rose-50 dark:divide-stone-800">
                  {siteContent.announcements.map((ann) => (
                    <div key={ann.id} className="py-3 text-xs">
                      {editingAnnouncement?.id === ann.id ? (
                        <form onSubmit={handleSaveEditAnnouncement} className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                              Edit Announcement Message
                            </span>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
                              <input
                                type="checkbox"
                                checked={editingAnnouncementForm.enabled}
                                onChange={(e) => setEditingAnnouncementForm({ ...editingAnnouncementForm, enabled: e.target.checked })}
                                className="rounded text-pink-600 focus:ring-pink-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>Active</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <input
                              type="text"
                              required
                              value={editingAnnouncementForm.text}
                              onChange={(e) => setEditingAnnouncementForm({ ...editingAnnouncementForm, text: e.target.value })}
                              placeholder="Announcement text"
                              className="sm:col-span-6 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium"
                            />
                            <input
                              type="text"
                              value={editingAnnouncementForm.link}
                              onChange={(e) => setEditingAnnouncementForm({ ...editingAnnouncementForm, link: e.target.value })}
                              placeholder="Link (e.g. /shop)"
                              className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono"
                            />
                            <input
                              type="text"
                              value={editingAnnouncementForm.linkText}
                              onChange={(e) => setEditingAnnouncementForm({ ...editingAnnouncementForm, linkText: e.target.value })}
                              placeholder="Link Text (e.g. Shop Now)"
                              className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                            />
                            <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  requestDelete(
                                    'Delete Announcement Message?',
                                    'Are you sure you want to delete this message? It will be permanently removed from the top announcement bar.',
                                    () => {
                                      deleteAnnouncement(ann.id);
                                      setEditingAnnouncement(null);
                                      showToast('Announcement Deleted', 'Message removed from top bar.');
                                    },
                                    `"${editingAnnouncementForm.text}"`
                                  );
                                }}
                                className="px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold mr-auto"
                              >
                                Delete
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAnnouncement(null)}
                                className="px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={ann.enabled}
                              onChange={(e) => updateAnnouncement(ann.id, { enabled: e.target.checked })}
                              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                            {/* NO ICON beside message */}
                            <span className={`break-words ${ann.enabled ? 'font-medium text-stone-900 dark:text-stone-100' : 'text-stone-400 line-through'}`}>
                              {ann.text}
                            </span>
                            {ann.link && (
                              <span className="text-[10px] text-pink-500 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded shrink-0">
                                {ann.link}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAnnouncement(ann)}
                              className="p-1.5 text-stone-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1"
                              title="Edit this announcement"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                requestDelete(
                                  'Delete Announcement Message?',
                                  'Are you sure you want to delete this message? It will be permanently removed from the top announcement bar.',
                                  () => {
                                    deleteAnnouncement(ann.id);
                                    showToast('Announcement Deleted', 'Message removed from top bar.');
                                  },
                                  `"${ann.text}"`
                                );
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: ABOUT US & STORY */}
            {contentSubTab === 'about' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      About Us & Bakery Story Page
                    </h4>
                    <p className="text-xs text-stone-500">Edit the bakery's history, founder information, and 4 core values.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteContent({ about: aboutForm });
                      showToast('About Page Saved! 📖', 'Our story and values updated successfully.');
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save About Page</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Page Main Headline
                    </label>
                    <input
                      type="text"
                      value={aboutForm.headline}
                      onChange={(e) => setAboutForm({ ...aboutForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Story Tagline
                    </label>
                    <input
                      type="text"
                      value={aboutForm.tagline}
                      onChange={(e) => setAboutForm({ ...aboutForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Story Paragraph 1 (Welcome & Mission)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutForm.paragraph1}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Story Paragraph 2 (Artisanal Craft & Flavour Philosophy)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutForm.paragraph2}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Story Paragraph 3 (Lagos Delivery & Community Promise)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutForm.paragraph3}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph3: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Founder / Head Baker Name
                    </label>
                    <input
                      type="text"
                      value={aboutForm.founderName}
                      onChange={(e) => setAboutForm({ ...aboutForm, founderName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Founder Title / Role
                    </label>
                    <input
                      type="text"
                      value={aboutForm.founderRole}
                      onChange={(e) => setAboutForm({ ...aboutForm, founderRole: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-rose-100 dark:border-stone-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                          Bakery Story Showcase Image
                        </h5>
                        <p className="text-xs text-stone-500">
                          This is the centerpiece photo featured on the About Us & Bakery Story page.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => aboutFileInputRef.current?.click()}
                          disabled={isUploadingAboutImage}
                          className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingAboutImage ? 'Uploading...' : 'Upload from Gallery'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Hidden file input for phone gallery or file uploads */}
                    <input
                      ref={aboutFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAboutImageUpload}
                      disabled={isUploadingAboutImage}
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Left: Current Image Preview Frame */}
                      <div className="md:col-span-5 space-y-2">
                        <div className="relative rounded-2xl overflow-hidden border border-rose-100 dark:border-stone-800 bg-rose-50/40 dark:bg-stone-900 aspect-4/3 flex items-center justify-center p-2 shadow-xs group">
                          <SafeImage
                            src={aboutForm.imageUrl || "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=900&q=80"}
                            alt="Bakery Story Showcase"
                            category="Bakery Craft"
                            fitMode="auto"
                            className="w-full h-full rounded-xl"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                            Live on About Page
                          </div>
                          {aboutForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                requestDelete(
                                  'Remove Showcase Image?',
                                  'Are you sure you want to remove the bakery story showcase image? The About Us page will revert to the default bakery photo.',
                                  () => {
                                    const updated = { ...aboutForm, imageUrl: '' };
                                    setAboutForm(updated);
                                    updateSiteContent({ about: updated });
                                    showToast('Image Removed', 'Showcase photo reset to default.');
                                  }
                                );
                              }}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs transition-colors"
                              title="Remove showcase image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 text-center">
                          Automatically fits any height or aspect ratio on the frontend.
                        </p>
                      </div>

                      {/* Right: Upload Tabs & Curated Options */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setAboutImageTab('upload')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              aboutImageTab === 'upload'
                                ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                          >
                            📁 Upload from Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => setAboutImageTab('preset')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              aboutImageTab === 'preset'
                                ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                          >
                            ✨ Bakery Presets
                          </button>
                          <button
                            type="button"
                            onClick={() => setAboutImageTab('url')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              aboutImageTab === 'url'
                                ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                            }`}
                          >
                            🔗 Paste URL
                          </button>
                        </div>

                        {aboutImageTab === 'upload' && (
                          <div>
                            <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-pink-900/80 rounded-2xl bg-white dark:bg-stone-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 transition-all text-center group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAboutImageUpload}
                                disabled={isUploadingAboutImage}
                                className="hidden"
                              />
                              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                                {isUploadingAboutImage ? 'Optimizing & Uploading Photo...' : 'Click to Upload from Phone Gallery or Computer'}
                              </span>
                              <span className="text-[11px] text-stone-500 mt-1">
                                High-resolution photo upload. Supports JPG, PNG, WEBP.
                              </span>
                            </label>
                          </div>
                        )}

                        {aboutImageTab === 'preset' && (
                          <div className="space-y-2">
                            <p className="text-[11px] text-stone-500">Select a curated artisan bakery scene:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {PRESET_BAKERY_STORY_IMAGES.map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...aboutForm, imageUrl: preset.url };
                                    setAboutForm(updated);
                                    updateSiteContent({ about: updated });
                                    showToast('Preset Selected ✨', `Applied "${preset.label}"`);
                                  }}
                                  className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                                    aboutForm.imageUrl === preset.url
                                      ? 'border-pink-600 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                                      : 'border-stone-200 dark:border-stone-800 hover:border-pink-300'
                                  }`}
                                >
                                  <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">{preset.label}</p>
                                    <p className="text-[10px] text-stone-500 truncate">Artisan Patisserie</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {aboutImageTab === 'url' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={aboutForm.imageUrl || ''}
                              onChange={(e) => setAboutForm({ ...aboutForm, imageUrl: e.target.value })}
                              placeholder="https://..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateSiteContent({ about: aboutForm });
                                showToast('Image URL Saved', 'Showcase photo updated.');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs"
                            >
                              Apply URL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Values Manager */}
                <div className="pt-4 border-t border-rose-100 dark:border-stone-800 space-y-4">
                  <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    The 4 Core Values & Standards
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(aboutForm.values || []).map((val, idx) => (
                      <div key={val.id || idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={val.emoji}
                            onChange={(e) => {
                              const updated = [...(aboutForm.values || [])];
                              updated[idx] = { ...updated[idx], emoji: e.target.value };
                              setAboutForm({ ...aboutForm, values: updated });
                            }}
                            className="w-12 px-2 py-1 text-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-lg"
                          />
                          <input
                            type="text"
                            value={val.title}
                            onChange={(e) => {
                              const updated = [...(aboutForm.values || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setAboutForm({ ...aboutForm, values: updated });
                            }}
                            placeholder="Value Title"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={val.desc}
                          onChange={(e) => {
                            const updated = [...(aboutForm.values || [])];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setAboutForm({ ...aboutForm, values: updated });
                          }}
                          placeholder="Description"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: BRAND PROMISES */}
            {contentSubTab === 'promises' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      Brand Promises & Trust Badges
                    </h4>
                    <p className="text-xs text-stone-500">The 4 assurance pillars displayed prominently on the homepage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteContent({ brandPromises: brandPromisesForm });
                      showToast('Brand Promises Saved! ⭐', 'Homepage promise pillars updated.');
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Brand Promises</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brandPromisesForm.map((bp, idx) => {
                    const SvgIcon = getPromiseSvgIcon(bp.iconName, bp.id, bp.title);
                    return (
                      <div key={bp.id || idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-rose-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                              <SvgIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400">
                              Pillar #{idx + 1}
                            </span>
                          </div>
                          <select
                            value={bp.iconName || 'Award'}
                            onChange={(e) => {
                              const updated = [...brandPromisesForm];
                              updated[idx] = { ...updated[idx], iconName: e.target.value };
                              setBrandPromisesForm(updated);
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                          >
                            <option value="Flame">Freshly Baked SVG (Oven Cloche)</option>
                            <option value="Award">Quality Ingredients SVG (Artisan Whisk)</option>
                            <option value="Palette">Beautiful Designs SVG (Piping Bag)</option>
                            <option value="ShieldCheck">Reliable Service SVG (Trust Shield)</option>
                            <option value="HeartHandshake">Made for Your Moment SVG (Cake & Candle)</option>
                          </select>
                        </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Promise Title
                        </label>
                        <input
                          type="text"
                          value={bp.title}
                          onChange={(e) => {
                            const updated = [...brandPromisesForm];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setBrandPromisesForm(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Promise Description
                        </label>
                        <textarea
                          rows={2}
                          value={bp.desc}
                          onChange={(e) => {
                            const updated = [...brandPromisesForm];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setBrandPromisesForm(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* SUBTAB 5: FAQS KNOWLEDGEBASE */}
            {contentSubTab === 'faqs' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      Frequently Asked Questions (FAQ) Manager
                    </h4>
                    <p className="text-xs text-stone-500">Edit, add, or remove questions displayed on the FAQ help page.</p>
                  </div>
                </div>

                {/* Add New FAQ Card */}
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Frequently Asked Question</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Category
                      </label>
                      <select
                        value={newFaq.category}
                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium"
                      >
                        <option value="Ordering & Notice">Ordering & Notice</option>
                        <option value="Payment">Payment</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Care">Care</option>
                        <option value="Customization">Customization</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Can you bake gluten-free or eggless cakes in Lagos?"
                        value={newFaq.q}
                        onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Type comprehensive guidance for customers..."
                        value={newFaq.a}
                        onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-12 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFaq.q || !newFaq.a) {
                            showToast('Missing details', 'Please enter question and answer.', 'error');
                            return;
                          }
                          addFaq(newFaq);
                          setNewFaq({ q: '', a: '', category: 'Ordering & Notice' });
                          showToast('FAQ Added! 💡', 'New question published to the Help Center.');
                        }}
                        className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Publish Question</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['All', 'Ordering & Notice', 'Payment', 'Delivery', 'Pickup', 'Care', 'Customization', 'Corporate'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFaqCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        faqCategoryFilter === cat
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* FAQ List */}
                <div className="divide-y divide-rose-100 dark:divide-stone-800 space-y-4">
                  {(siteContent.faqs || [])
                    .filter((f) => faqCategoryFilter === 'All' || f.category === faqCategoryFilter)
                    .map((faq) => (
                      <div key={faq.id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                              {faq.category || 'General'}
                            </span>
                            <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                              {faq.q}
                            </h5>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              requestDelete(
                                'Delete FAQ Question?',
                                'Are you sure you want to delete this FAQ question from the website?',
                                () => {
                                  deleteFaq(faq.id);
                                  showToast('Deleted', 'FAQ item removed.');
                                },
                                `Q: "${faq.q}"`
                              );
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SUBTAB 6: CORPORATE SOLUTIONS */}
            {contentSubTab === 'corporate' && (
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      Corporate Gifting & B2B Solutions
                    </h4>
                    <p className="text-xs text-stone-500">Edit company packages, staff celebration retainers, and client gift cards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteContent({ corporate: corporateForm });
                      showToast('Corporate Settings Saved! 🏢', 'Corporate landing page updated.');
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Corporate Copy</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Corporate Headline
                    </label>
                    <input
                      type="text"
                      value={corporateForm.headline}
                      onChange={(e) => setCorporateForm({ ...corporateForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-serif"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Subheadline / Badge
                    </label>
                    <input
                      type="text"
                      value={corporateForm.subheadline}
                      onChange={(e) => setCorporateForm({ ...corporateForm, subheadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Introduction Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={corporateForm.intro}
                      onChange={(e) => setCorporateForm({ ...corporateForm, intro: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>
                </div>

                {/* Corporate Perks List */}
                <div className="pt-4 border-t border-rose-100 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      Corporate Packages & Value Propositions
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newPerk: CorporatePerkItem = {
                          id: `cp-${Date.now()}`,
                          title: 'New Corporate Package',
                          desc: 'Description of package offerings for Lagos offices.',
                        };
                        setCorporateForm({
                          ...corporateForm,
                          perks: [...(corporateForm.perks || []), newPerk],
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Package</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(corporateForm.perks || []).map((perk, idx) => (
                      <div key={perk.id || idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={perk.title}
                            onChange={(e) => {
                              const updated = [...(corporateForm.perks || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setCorporateForm({ ...corporateForm, perks: updated });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = corporateForm.perks.filter((_, i) => i !== idx);
                              setCorporateForm({ ...corporateForm, perks: updated });
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={perk.desc}
                          onChange={(e) => {
                            const updated = [...(corporateForm.perks || [])];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setCorporateForm({ ...corporateForm, perks: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 6. STORE & BRAND SETTINGS TAB                           */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Store & Brand Settings
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Customize your store logo, Stanbic IBTC bank account details, bakery studio address, and contact lines.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingSettingsSupabase}
                onClick={async () => {
                  setIsSavingSettingsSupabase(true);
                  await syncSettingsToSupabase();
                  setIsSavingSettingsSupabase(false);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
                title="Save store and brand settings to Supabase"
              >
                <Database className={`w-3.5 h-3.5 ${isSavingSettingsSupabase ? 'animate-spin' : ''}`} />
                <span>{isSavingSettingsSupabase ? 'Saving to Supabase...' : 'Save Settings to Supabase'}</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBusinessInfo(storeForm);
              }}
              className="space-y-6"
            >
              {/* ========================================================= */}
              {/* BRAND LOGO & VISUAL IDENTITY CONTROL CENTER               */}
              {/* ========================================================= */}
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                        Brand Logo & Visual Identity
                      </h4>
                      <p className="text-xs text-stone-500">
                        Upload custom logos, switch to the official vector crest, customize sizing, and fine-tune wordmarks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetLogoToDefault();
                        setStoreForm((prev) => ({
                          ...prev,
                          logo: {
                            ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                            mode: 'default',
                            customUrl: '',
                          },
                          logoUrl: '',
                          logoType: 'default',
                        }));
                      }}
                      className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-rose-50 hover:text-pink-600 dark:hover:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Official Vector Logo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateBusinessInfo(storeForm);
                        showToast('Logo Changes Saved ✨', 'Brand logo updated across the header, footer, and store pages.');
                      }}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Logo</span>
                    </button>
                  </div>
                </div>

                {/* Logo Mode Selection: Default Vector vs Custom Image */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Logo Type & Format
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Official Handcrafted Vector Crest */}
                    <button
                      type="button"
                      onClick={() => {
                        setStoreForm((prev) => ({
                          ...prev,
                          logo: {
                            ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                            mode: 'default',
                          },
                          logoType: 'default',
                        }));
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex gap-3.5 ${
                        storeForm.logo?.mode === 'default'
                          ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20'
                          : 'border-stone-200 dark:border-stone-800 hover:border-pink-300 bg-stone-50/60 dark:bg-stone-900/60'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <ElsDelightVectorLogo className="w-12 h-12" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>Official Vector Crest</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                              1:1 Replica
                            </span>
                          </span>
                          {storeForm.logo?.mode === 'default' && (
                            <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          Circular gold filigree arch, 3-tiered confectionery pink cake, cherry topper, and signature calligraphy. Scalable SVG that never pixelates.
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Custom Uploaded / Image URL Logo */}
                    <button
                      type="button"
                      onClick={() => {
                        setStoreForm((prev) => ({
                          ...prev,
                          logo: {
                            ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                            mode: 'custom',
                          },
                          logoType: 'custom',
                        }));
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex gap-3.5 ${
                        storeForm.logo?.mode === 'custom'
                          ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20'
                          : 'border-stone-200 dark:border-stone-800 hover:border-pink-300 bg-stone-50/60 dark:bg-stone-900/60'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 flex items-center justify-center shrink-0 shadow-xs">
                        {storeForm.logo?.customUrl ? (
                          <img
                            src={storeForm.logo.customUrl}
                            alt="Custom Logo Thumbnail"
                            className="w-12 h-12 object-contain rounded-lg"
                          />
                        ) : (
                          <UploadCloud className="w-6 h-6 text-pink-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>Custom Uploaded Logo</span>
                            <span className="px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[9px] font-bold">
                              PNG / SVG / WebP
                            </span>
                          </span>
                          {storeForm.logo?.mode === 'custom' && (
                            <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          Upload your bakery logo file from computer/phone, or paste any hosted image link. Supports transparent background PNGs and SVGs.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Image Upload & URL Inputs (Active if Custom Logo is selected) */}
                {storeForm.logo?.mode === 'custom' && (
                  <div className="bg-rose-50/40 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-rose-950 dark:text-rose-200 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-pink-600" />
                        <span>Upload or Provide Custom Logo Image</span>
                      </h5>
                      {storeForm.logo?.customUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setStoreForm((prev) => ({
                              ...prev,
                              logo: { ...(prev.logo || DEFAULT_LOGO_SETTINGS), customUrl: '' },
                              logoUrl: '',
                            }));
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear Custom Image</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* File Drag & Drop / Click zone */}
                      <div className="md:col-span-7">
                        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-rose-800 rounded-2xl bg-white dark:bg-stone-900/90 hover:bg-pink-50/50 dark:hover:bg-rose-950/30 transition-all cursor-pointer group text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleLogoFileUpload}
                          />
                          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-rose-950 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            Click to browse or drag & drop logo file
                          </p>
                          <p className="text-[10px] text-stone-500 mt-1">
                            PNG (transparent recommended), SVG, WebP, or JPG up to 2.5MB
                          </p>
                        </label>
                      </div>

                      {/* OR Divider & URL Paste */}
                      <div className="md:col-span-5 space-y-2">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Or Paste Web Image URL:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            value={storeForm.logo?.customUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStoreForm((prev) => ({
                                ...prev,
                                logo: {
                                  ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                                  mode: 'custom',
                                  customUrl: val,
                                },
                                logoUrl: val,
                                logoType: 'custom',
                              }));
                            }}
                            className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <p className="text-[10px] text-stone-500">
                          Direct links to logos hosted on Cloudinary, Imgur, AWS S3, or company websites.
                        </p>
                      </div>
                    </div>

                    {/* Preset Inspirations */}
                    <div className="pt-2 border-t border-rose-100/70 dark:border-rose-900/40">
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-2">
                        Quick Preset Samples (Click to test):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LOGO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setStoreForm((prev) => ({
                                ...prev,
                                logo: {
                                  ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                                  mode: preset.mode,
                                  customUrl: preset.url,
                                  shape: preset.shape,
                                },
                                logoUrl: preset.url,
                                logoType: preset.mode,
                              }));
                              showToast(`Applied preset: ${preset.name}`, 'You can save or customize further.');
                            }}
                            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-400 text-left transition-colors"
                          >
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block truncate">
                              {preset.name}
                            </span>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {preset.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Display Styling & Framing Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-rose-100 dark:border-stone-800">
                  {/* Frame Shape */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Logo Framing Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'transparent', label: 'Transparent', desc: 'No frame' },
                        { id: 'rounded', label: 'Rounded Box', desc: 'Curved box' },
                        { id: 'circle', label: 'Circle Badge', desc: 'Avatar circular' },
                        { id: 'card', label: 'Soft Card', desc: 'Light card box' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setStoreForm((prev) => ({
                              ...prev,
                              logo: {
                                ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                                shape: s.id as any,
                              },
                            }));
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                            (storeForm.logo?.shape || 'transparent') === s.id
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span className="block leading-tight">{s.label}</span>
                          <span className="text-[10px] font-normal text-stone-500 block">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizing Preset in Header */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Navbar Logo Scale
                    </label>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'compact', label: 'Compact (44px)', desc: 'Subtle and space-efficient' },
                        { id: 'standard', label: 'Standard (56px)', desc: 'Balanced default appearance' },
                        { id: 'prominent', label: 'Prominent (68px)', desc: 'Bold, statement brand mark' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => {
                            setStoreForm((prev) => ({
                              ...prev,
                              logo: {
                                ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                                sizePreset: sz.id as any,
                              },
                            }));
                          }}
                          className={`px-3 py-2 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                            (storeForm.logo?.sizePreset || 'standard') === sz.id
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span>{sz.label}</span>
                          <span className="text-[10px] font-normal text-stone-500">{sz.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Wordmark & Text Customization */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Wordmark Text in Header
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={storeForm.logo?.showWordmark ?? true}
                          onChange={(e) => {
                            setStoreForm((prev) => ({
                              ...prev,
                              logo: {
                                ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                                showWordmark: e.target.checked,
                              },
                            }));
                          }}
                          className="w-3.5 h-3.5 text-pink-600 rounded border-stone-300 focus:ring-pink-500"
                        />
                        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                          Show Text
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                        Brand Name Title
                      </label>
                      <input
                        type="text"
                        value={storeForm.logo?.wordmarkText ?? storeForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStoreForm((prev) => ({
                            ...prev,
                            name: val,
                            logo: {
                              ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                              wordmarkText: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-bold text-stone-800 dark:text-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                        Subtitle / Tagline Line
                      </label>
                      <input
                        type="text"
                        value={storeForm.logo?.wordmarkSubtext ?? storeForm.tagline}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStoreForm((prev) => ({
                            ...prev,
                            tagline: val,
                            logo: {
                              ...(prev.logo || DEFAULT_LOGO_SETTINGS),
                              wordmarkSubtext: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Multi-Theme Sandbox Preview */}
                <div className="pt-4 border-t border-rose-100 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-pink-600" />
                      <span>Live Real-Time Logo Preview Sandbox</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Changes immediately render across your entire site on save
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Header Light Mode Preview */}
                    <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>Navbar · Light Mode</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                          Day Theme
                        </span>
                      </div>
                      <div className="py-2 flex items-center gap-1.5 sm:gap-2">
                        <ElsDelightLogo
                          ignoreContext={true}
                          mode={storeForm.logo?.mode}
                          customUrl={storeForm.logo?.customUrl}
                          shape={storeForm.logo?.shape}
                          alt={storeForm.logo?.alt}
                          className={
                            storeForm.logo?.sizePreset === 'compact'
                              ? 'w-10 h-10'
                              : storeForm.logo?.sizePreset === 'prominent'
                              ? 'w-16 h-16'
                              : 'w-13 h-13'
                          }
                        />
                        {(storeForm.logo?.showWordmark ?? true) && (
                          <div className="flex flex-col -ml-0.5">
                            <span className="font-serif text-lg font-bold tracking-tight text-rose-950 leading-none">
                              {storeForm.logo?.wordmarkText || storeForm.name || "El's Delight"}
                            </span>
                            <span className="text-[9px] tracking-[0.16em] font-semibold uppercase text-pink-600 mt-0.5">
                              {storeForm.logo?.wordmarkSubtext || 'Treats'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Header Dark Mode Preview */}
                    <div className="p-4 rounded-2xl bg-[#16161A] border border-rose-950/80 shadow-xs flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          <span>Navbar · Dark Mode</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold">
                          Night Theme
                        </span>
                      </div>
                      <div className="py-2 flex items-center gap-1.5 sm:gap-2">
                        <ElsDelightLogo
                          ignoreContext={true}
                          mode={storeForm.logo?.mode}
                          customUrl={storeForm.logo?.customUrl}
                          shape={storeForm.logo?.shape}
                          alt={storeForm.logo?.alt}
                          className={
                            storeForm.logo?.sizePreset === 'compact'
                              ? 'w-10 h-10'
                              : storeForm.logo?.sizePreset === 'prominent'
                              ? 'w-16 h-16'
                              : 'w-13 h-13'
                          }
                        />
                        {(storeForm.logo?.showWordmark ?? true) && (
                          <div className="flex flex-col -ml-0.5">
                            <span className="font-serif text-lg font-bold tracking-tight text-rose-100 leading-none">
                              {storeForm.logo?.wordmarkText || storeForm.name || "El's Delight"}
                            </span>
                            <span className="text-[9px] tracking-[0.16em] font-semibold uppercase text-pink-400 mt-0.5">
                              {storeForm.logo?.wordmarkSubtext || 'Treats'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Footer Charcoal Preview */}
                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-xs flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-pink-400" />
                          <span>Footer · Charcoal</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">
                          Footer Strip
                        </span>
                      </div>
                      <div className="py-2 flex items-center gap-1.5 sm:gap-2">
                        <ElsDelightLogo
                          ignoreContext={true}
                          mode={storeForm.logo?.mode}
                          customUrl={storeForm.logo?.customUrl}
                          shape={storeForm.logo?.shape}
                          alt={storeForm.logo?.alt}
                          className={
                            storeForm.logo?.sizePreset === 'compact'
                              ? 'w-11 h-11'
                              : storeForm.logo?.sizePreset === 'prominent'
                              ? 'w-16 h-16'
                              : 'w-14 h-14'
                          }
                        />
                        {(storeForm.logo?.showWordmark ?? true) && (
                          <div className="flex flex-col -ml-0.5">
                            <span className="font-serif text-xl font-bold tracking-tight text-white leading-none">
                              {storeForm.logo?.wordmarkText || storeForm.name || "El's Delight"}
                            </span>
                            <span className="text-[10px] tracking-[0.16em] font-semibold uppercase text-pink-400 mt-0.5">
                              {storeForm.logo?.wordmarkSubtext || 'Treats'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details Card */}
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-rose-100 dark:border-stone-800 pb-3">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    Stanbic IBTC Bank Transfer Details (Checkout Payment Card)
                  </h4>
                </div>
                <p className="text-xs text-stone-500">
                  Customers copy these details when paying for cakes. Any change here immediately updates the checkout, invoice, and payment receipt.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.payment.bank}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          payment: { ...storeForm.payment, bank: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.payment.accountName}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          payment: { ...storeForm.payment, accountName: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Account Number (NUBAN)
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.payment.accountNumber}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          payment: { ...storeForm.payment, accountNumber: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-mono font-bold tracking-wider"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CAKE DELIVERY METHODS & PAY-ON-DELIVERY POLICY MANAGER      */}
              {/* ========================================================= */}
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                        Cake Delivery Options & Pay-on-Delivery Policy (Nigeria)
                      </h4>
                      <p className="text-xs text-stone-500">
                        Configure Nigerian delivery services (Uber, Bolt, Store Pickup, Dispatch Riders, Driver, Interstate) and edit customer pay-on-delivery instructions.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateBusinessInfo(storeForm);
                      showToast('Delivery Settings Saved! 🚚', 'Delivery options and policy notice updated across all payment pages.');
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Delivery Settings</span>
                  </button>
                </div>

                {/* 1. Editable Delivery Fee Policy Notice */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Customer Delivery Fee Instruction Notice (Form Filling Banner) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStoreForm((prev) => ({
                          ...prev,
                          deliveryPolicyNotice: DEFAULT_DELIVERY_POLICY_NOTICE,
                        }));
                        showToast('Default Notice Restored', 'Restored official Uber pay-on-delivery instruction.');
                      }}
                      className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore Default Notice</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    This instruction appears prominently on all payment forms, checkout pages, and custom cake pages so customers know delivery is paid to the driver on delivery based on Uber live rates, and is NOT added to the cake payment.
                  </p>

                  <textarea
                    rows={3}
                    value={storeForm.deliveryPolicyNotice ?? DEFAULT_DELIVERY_POLICY_NOTICE}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, deliveryPolicyNotice: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-medium leading-relaxed"
                  />

                  {/* Real-Time Live Preview */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                        Live Preview (As Customers See It on Payment Pages):
                      </span>
                      <p className="mt-0.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        {storeForm.deliveryPolicyNotice || DEFAULT_DELIVERY_POLICY_NOTICE}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Configurable Nigerian Delivery Methods Manager */}
                <div className="space-y-4 pt-4 border-t border-rose-100 dark:border-stone-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        Nigerian Delivery Methods Selector Options
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        Enable, disable, or customize delivery methods displayed to customers during cake ordering.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStoreForm((prev) => ({
                            ...prev,
                            deliveryMethods: DEFAULT_DELIVERY_METHODS,
                          }));
                          showToast('Delivery Methods Reset', 'Restored default Nigerian cake delivery options.');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-rose-50 hover:text-pink-600 text-xs font-semibold text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Defaults</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentMethods = storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS;
                          const newMethod: DeliveryMethodOption = {
                            id: `custom-${Date.now()}`,
                            name: 'New Delivery Service (e.g. GIG / Dispatch)',
                            description: 'Reliable doorstep cake dispatch.',
                            pricingNote: 'Pay courier directly on delivery',
                            isPickup: false,
                            enabled: true,
                            iconType: 'dispatch',
                          };
                          setStoreForm({
                            ...storeForm,
                            deliveryMethods: [...currentMethods, newMethod],
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60 hover:bg-pink-100 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Delivery Method</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS).map((method, idx) => (
                      <div
                        key={method.id || idx}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          method.enabled !== false
                            ? 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-950/40 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-rose-950 text-pink-700 dark:text-pink-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              {method.name}
                            </span>
                            {method.isPickup ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Free Pickup
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                Pay on Delivery
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-400">
                              <input
                                type="checkbox"
                                checked={method.enabled !== false}
                                onChange={(e) => {
                                  const currentMethods = [
                                    ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                  ];
                                  currentMethods[idx] = {
                                    ...currentMethods[idx],
                                    enabled: e.target.checked,
                                  };
                                  setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                                }}
                                className="w-3.5 h-3.5 text-pink-600 rounded border-stone-300"
                              />
                              <span>Enabled in Checkout</span>
                            </label>

                            {(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentMethods = (
                                    storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS
                                  ).filter((_, i) => i !== idx);
                                  setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                                }}
                                className="p-1 rounded text-stone-400 hover:text-rose-600"
                                title="Remove delivery method"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Method Display Name *
                            </label>
                            <input
                              type="text"
                              value={method.name}
                              onChange={(e) => {
                                const currentMethods = [
                                  ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                ];
                                currentMethods[idx] = { ...currentMethods[idx], name: e.target.value };
                                setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Short Description
                            </label>
                            <input
                              type="text"
                              value={method.description}
                              onChange={(e) => {
                                const currentMethods = [
                                  ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                ];
                                currentMethods[idx] = {
                                  ...currentMethods[idx],
                                  description: e.target.value,
                                };
                                setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                              Pricing Note / Badge
                            </label>
                            <input
                              type="text"
                              value={method.pricingNote}
                              onChange={(e) => {
                                const currentMethods = [
                                  ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                ];
                                currentMethods[idx] = {
                                  ...currentMethods[idx],
                                  pricingNote: e.target.value,
                                };
                                setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-600 dark:text-stone-400">
                            <input
                              type="checkbox"
                              checked={!!method.isPickup}
                              onChange={(e) => {
                                const currentMethods = [
                                  ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                ];
                                currentMethods[idx] = {
                                  ...currentMethods[idx],
                                  isPickup: e.target.checked,
                                };
                                setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                              }}
                              className="w-3.5 h-3.5 text-emerald-600 rounded"
                            />
                            <span>Is Studio / Self-Pickup (Free of charge)</span>
                          </label>

                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <span>Icon Style:</span>
                            <select
                              value={method.iconType || 'uber'}
                              onChange={(e) => {
                                const currentMethods = [
                                  ...(storeForm.deliveryMethods || DEFAULT_DELIVERY_METHODS),
                                ];
                                currentMethods[idx] = {
                                  ...currentMethods[idx],
                                  iconType: e.target.value,
                                };
                                setStoreForm({ ...storeForm, deliveryMethods: currentMethods });
                              }}
                              className="px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-[11px]"
                            >
                              <option value="uber">Uber / Truck</option>
                              <option value="bolt">Bolt / Car</option>
                              <option value="pickup">Bakery Store</option>
                              <option value="dispatch">Dispatch Bike</option>
                              <option value="driver">Private Driver</option>
                              <option value="interstate">Interstate Parcel</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* General Store Information */}
              <div className="bg-white dark:bg-[#16161A] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-rose-100 dark:border-stone-800 pb-3">
                  Store Contact & Bakery Studio
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={storeForm.tagline}
                      onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp Phone (Local format: e.g. 09138761465)
                    </label>
                    <input
                      type="text"
                      value={storeForm.whatsappNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp URL Prefix (e.g. 2349138761465)
                    </label>
                    <input
                      type="text"
                      value={storeForm.whatsappUrlNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappUrlNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Direct Calling Phone
                    </label>
                    <input
                      type="text"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={storeForm.instagram}
                      onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
                      placeholder="els_delighttreats"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Instagram Direct Profile Link
                    </label>
                    <input
                      type="url"
                      value={storeForm.instagramUrl || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA=="
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Facebook Handle
                    </label>
                    <input
                      type="text"
                      value={storeForm.facebook || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, facebook: e.target.value })}
                      placeholder="els_delight"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Facebook Page Link
                    </label>
                    <input
                      type="url"
                      value={storeForm.facebookUrl || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                      placeholder="https://www.facebook.com/share/1CDErKS8QJ/"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Operating Hours (Weekdays & Weekends)
                    </label>
                    <input
                      type="text"
                      value={storeForm.openingHours}
                      onChange={(e) => setStoreForm({ ...storeForm, openingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Studio Physical Address
                    </label>
                    <input
                      type="text"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Self-Pickup Customer Instructions
                    </label>
                    <input
                      type="text"
                      value={storeForm.pickupNote}
                      onChange={(e) => setStoreForm({ ...storeForm, pickupNote: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Store & Bank Information</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 7. REVIEWS TAB                                          */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Customer Testimonials ({reviews.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage social proof and reviews displayed on the homepage.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {reviews.length > 0 && (
                  <button
                    type="button"
                    disabled={isSavingReviewsSupabase}
                    onClick={async () => {
                      setIsSavingReviewsSupabase(true);
                      await syncReviewsToSupabase();
                      setIsSavingReviewsSupabase(false);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-stone-900 hover:bg-pink-50 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Upload all customer reviews into Supabase reviews table"
                  >
                    <Database className={`w-3.5 h-3.5 ${isSavingReviewsSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSavingReviewsSupabase ? 'Saving to Supabase...' : `Save All ${reviews.length} Reviews to Supabase`}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setReviewForm({
                      name: '',
                      location: 'Amuwo-Odofin, Lagos',
                      occasion: 'Birthday Celebration',
                      rating: 5,
                      date: 'Just now',
                      text: '',
                      productName: 'Classic Chocolate Birthday Cake',
                      verified: true,
                    });
                    setIsReviewModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Testimonial</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-[#16161A] p-5 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 italic leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-rose-50 dark:border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {rev.name} · <span className="text-stone-500 font-normal">{rev.location}</span>
                      </p>
                      <p className="text-[11px] text-pink-600">{rev.occasion} · {rev.productName}</p>
                    </div>

                    <button
                      onClick={() => {
                        requestDelete(
                          'Delete Customer Review?',
                          'Are you sure you want to delete this customer review testimonial from the website?',
                          () => deleteReview(rev.id),
                          `"${rev.text.slice(0, 80)}..." — ${rev.name}`
                        );
                      }}
                      title="Delete review"
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 8. BACKUP & SETTINGS TAB                                */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                Backend Cloud Database & Store Backup
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Connect and sync with Supabase PostgreSQL, export website snapshots, or manage your admin passcode.
              </p>
            </div>

            {/* Supabase Cloud Backend Integration Card */}
            <div className="bg-white dark:bg-[#16161A] p-6 sm:p-7 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isSupabaseReady
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900'
                  }`}>
                    {isSupabaseReady ? <Cloud className="w-6 h-6" /> : <Unlink className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
                      <span>Supabase Cloud Backend</span>
                      {isSupabaseReady ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Disconnected (Standalone Local Mode)
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {isSupabaseReady
                        ? 'Active PostgreSQL cloud connection for orders, bespoke inquiries, testimonials, and cake catalog.'
                        : 'The website is unlinked from Supabase. All orders and store changes are safely preserved in local storage.'}
                    </p>
                  </div>
                </div>

                {isSupabaseReady && (
                  <button
                    type="button"
                    onClick={() => setShowDisconnectConfirm(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
                  >
                    <Unlink className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Disconnect Website from Supabase</span>
                  </button>
                )}
              </div>

              {/* Inline Disconnect Confirmation Dialog */}
              {showDisconnectConfirm && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-rose-900 dark:text-rose-200">
                        Confirm Disconnecting from Current Supabase Account?
                      </p>
                      <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                        This will remove your current Supabase credentials and put the website into offline/standalone mode.
                        Your catalog, demo orders, and settings will remain completely safe in your browser, ready to be linked to your new Supabase project.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 pl-7">
                    <button
                      type="button"
                      onClick={() => {
                        disconnectSupabase();
                        setSupabaseUrlInput('');
                        setSupabaseKeyInput('');
                        setSupabaseTestStatus(null);
                        setLiveCounts(null);
                        setShowDisconnectConfirm(false);
                        showToast(
                          'Website Disconnected from Supabase 🔌',
                          'Successfully unlinked from previous Supabase account. The store is now in local mode, ready to connect to your new Supabase account.',
                          'info'
                        );
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Yes, Disconnect Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDisconnectConfirm(false)}
                      className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Disconnected Notice & 3-Step Wizard for Connecting to Another Account */}
              {!isSupabaseReady ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                    <p className="font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200 text-sm">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                      <span>Website is Disconnected from Supabase</span>
                    </p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      The website is currently unhooked from any Supabase account. Follow these 3 easy steps below to connect it to your new Supabase account:
                    </p>
                  </div>

                  {/* Step 1: SQL Schema */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <h6 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            Run Database Schema in Your New Supabase Project
                          </h6>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            Open your new Supabase dashboard &rarr; <strong>SQL Editor</strong> &rarr; <strong>New query</strong>. Paste and run this script to create all 7 tables (<code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">products</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">orders</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">inquiries</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">categories</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">reviews</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">business_settings</code>, <code className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">site_content</code>) with Row Level Security.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
                              setSqlCopied(true);
                              showToast('SQL Schema Copied! 📋', 'Complete schema with all 7 tables and 18 products copied to clipboard.');
                              setTimeout(() => setSqlCopied(false), 3000);
                            } catch {
                              showToast('Copy Notice', 'Please view schema modal and copy manually.', 'info');
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{sqlCopied ? 'Copied!' : 'Copy SQL Schema'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSqlSchemaModal(true)}
                          className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl transition-colors"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>View SQL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 & 3: Enter New Credentials & Connect */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        <h6 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          Enter Your New Supabase Project Credentials
                        </h6>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Find these in your new Supabase project: <strong>Project Settings &rarr; API</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          New Supabase Project URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://your-new-project-ref.supabase.co"
                          value={supabaseUrlInput}
                          onChange={(e) => setSupabaseUrlInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">Example: https://abcdefghijklmn.supabase.co</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                            New Supabase Anon / Public API Key
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowKeySecret(!showKeySecret)}
                            className="text-[10px] text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                          >
                            {showKeySecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showKeySecret ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>
                        <input
                          type={showKeySecret ? 'text' : 'password'}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={supabaseKeyInput}
                          onChange={(e) => setSupabaseKeyInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">Anon public key from Project Settings &rarr; API</p>
                      </div>
                    </div>

                    {/* Step 3: Connect Button */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Connect and initialize cloud database
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isSavingCredentials}
                          onClick={async () => {
                            if (!supabaseUrlInput.trim()) {
                              showToast('Missing URL', 'Please enter your new Supabase Project URL.', 'warning');
                              return;
                            }
                            if (!supabaseKeyInput.trim()) {
                              showToast('Missing API Key', 'Please enter your new Supabase Anon Key.', 'warning');
                              return;
                            }
                            setIsSavingCredentials(true);
                            const res = setSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
                            if (res.success) {
                              showToast('Connected to New Supabase Account! 🔑', 'Initializing database and uploading all 18 products + store data...', 'success');
                              await saveAllDataToSupabase();
                              await refreshLiveCounts();
                            } else {
                              showToast('Connection Warning', res.message, 'warning');
                            }
                            setIsSavingCredentials(false);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
                        >
                          <Plug className={`w-4 h-4 ${isSavingCredentials ? 'animate-spin' : ''}`} />
                          <span>{isSavingCredentials ? 'Connecting & Syncing...' : 'Connect to New Supabase Account & Sync Everything'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isTestingSupabase || !supabaseUrlInput.trim()}
                          onClick={async () => {
                            setIsTestingSupabase(true);
                            setSupabaseTestStatus(null);
                            try {
                              const res = await checkSupabaseConnection(supabaseUrlInput, supabaseKeyInput);
                              setSupabaseTestStatus(res.message);
                              if (res.connected) {
                                showToast('Connection Active! 🟢', res.message, 'success');
                              } else {
                                showToast('Connection Notice', res.message, 'info');
                              }
                            } catch (e: any) {
                              setSupabaseTestStatus(e?.message || 'Failed to ping Supabase.');
                            } finally {
                              setIsTestingSupabase(false);
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                          <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Connected State Configuration Card */
                <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div>
                      <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>Connected Project Details</span>
                      </h5>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Active Supabase project stream. You can modify credentials or disconnect below.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Connected to {getSupabaseConfig().url.replace('https://', '').split('.')[0] || 'Supabase'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Active Supabase Project URL
                      </label>
                      <input
                        type="text"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Active Anon Key
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeySecret(!showKeySecret)}
                          className="text-[10px] text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                          {showKeySecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showKeySecret ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showKeySecret ? 'text' : 'password'}
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isSavingCredentials}
                        onClick={async () => {
                          setIsSavingCredentials(true);
                          const res = setSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
                          if (res.success) {
                            showToast('Credentials Updated! 🔑', 'Updating connection and syncing tables...', 'success');
                            await saveAllDataToSupabase();
                            refreshLiveCounts();
                          } else {
                            showToast('Configuration Warning', res.message, 'warning');
                          }
                          setIsSavingCredentials(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingCredentials ? 'Updating & Syncing...' : 'Update Credentials & Sync'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isTestingSupabase}
                        onClick={async () => {
                          setIsTestingSupabase(true);
                          setSupabaseTestStatus(null);
                          try {
                            const res = await checkSupabaseConnection(supabaseUrlInput, supabaseKeyInput);
                            setSupabaseTestStatus(res.message);
                            if (res.connected) {
                              showToast('Supabase Connection Live', res.message, 'success');
                            } else {
                              showToast('Supabase Notice', res.message, 'info');
                            }
                          } catch (e: any) {
                            setSupabaseTestStatus(e?.message || 'Failed to ping Supabase.');
                          } finally {
                            setIsTestingSupabase(false);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                        <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDisconnectConfirm(true)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect Website from Supabase</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Test Status Feedback Display */}
              {supabaseTestStatus && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  supabaseTestStatus.includes('Successfully connected') || supabaseTestStatus.includes('Live')
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span><strong>Status:</strong> {supabaseTestStatus}</span>
                </div>
              )}

              {/* Status Banner */}
              {isSupabaseReady ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Supabase connection credentials verified & active
                  </p>
                  <p className="text-[11px] opacity-90">
                    Your bakery storefront and admin dashboard stream customer orders, bespoke inquiries, and live catalog changes directly to your Supabase PostgreSQL database.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Connect Your Supabase Project
                  </p>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Paste your Supabase URL and Anon Key into the form above, or set <code className="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-100">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-100">VITE_SUPABASE_ANON_KEY</code> in environment variables. Run the schema SQL script in your Supabase SQL editor to create all tables.
                  </p>
                </div>
              )}

              {/* Discrepancy & Health Diagnostic Banner */}
              {isSupabaseReady && liveCounts && (
                <>
                  {liveCounts.products !== null && liveCounts.products < 18 && (
                    <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 text-xs text-pink-900 dark:text-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <p className="font-bold flex items-center gap-1.5 text-pink-800 dark:text-pink-300">
                          <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
                          <span>Catalog Discrepancy Detected: Only {liveCounts.products} of 18 products are saved in Supabase</span>
                        </p>
                        <p className="text-[11px] text-pink-700/90 dark:text-pink-300/80 mt-0.5">
                          {18 - liveCounts.products} website catalog cakes need to be synced to your Supabase products table.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isSavingProductsSupabase}
                        onClick={async () => {
                          setIsSavingProductsSupabase(true);
                          await syncProductsToSupabase();
                          setIsSavingProductsSupabase(false);
                          refreshLiveCounts();
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                      >
                        <UploadCloud className={`w-3.5 h-3.5 ${isSavingProductsSupabase ? 'animate-bounce' : ''}`} />
                        <span>{isSavingProductsSupabase ? 'Uploading Products...' : `Sync All 18 Products to Supabase`}</span>
                      </button>
                    </div>
                  )}

                  {liveCounts.orders !== null && liveCounts.orders === 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <p className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                          <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Orders Table Empty in Supabase (0 orders recorded)</span>
                        </p>
                        <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 mt-0.5">
                          Push your current customer orders and demo bakery orders so your order log is backed up in the cloud.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isSavingOrdersSupabase}
                        onClick={async () => {
                          setIsSavingOrdersSupabase(true);
                          await syncOrdersToSupabase();
                          setIsSavingOrdersSupabase(false);
                          refreshLiveCounts();
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                      >
                        <ShoppingBag className={`w-3.5 h-3.5 ${isSavingOrdersSupabase ? 'animate-spin' : ''}`} />
                        <span>{isSavingOrdersSupabase ? 'Saving Orders...' : `Upload Orders to Supabase`}</span>
                      </button>
                    </div>
                  )}

                  {liveCounts.errors && Object.keys(liveCounts.errors).length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Supabase Schema or Permission Notice</span>
                      </p>
                      <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                        Some tables returned errors during count check: {Object.entries(liveCounts.errors).map(([tbl, err]) => `${tbl}: ${err}`).join(', ')}.
                        Make sure you have run the latest SQL Schema script in your Supabase SQL editor.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowSqlSchemaModal(true)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>View Updated SQL Schema</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Table-by-Table Status & Sync Control Card */}
              <div className="bg-stone-50 dark:bg-stone-900/60 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Supabase Database Tables Status</span>
                    </h5>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Verify each table's live count and sync individual content areas or all 7 tables in one click.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isLoadingLiveCounts || !isSupabaseReady}
                      onClick={() => refreshLiveCounts()}
                      className="px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-stone-100 transition-colors"
                      title="Fetch live row counts directly from your Supabase database"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveCounts ? 'animate-spin text-purple-600' : ''}`} />
                      <span>{isLoadingLiveCounts ? 'Checking...' : 'Refresh DB Counts'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSavingProductsSupabase || isSavingOrdersSupabase || isSavingSettingsSupabase}
                      onClick={async () => {
                        setIsSavingProductsSupabase(true);
                        setIsSavingOrdersSupabase(true);
                        setIsSavingSettingsSupabase(true);
                        setIsPurgingSupabase(true);
                        await saveAllDataToSupabase();
                        setIsSavingProductsSupabase(false);
                        setIsSavingOrdersSupabase(false);
                        setIsSavingSettingsSupabase(false);
                        setIsPurgingSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSavingProductsSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingProductsSupabase ? 'Syncing...' : 'Sync Everything (All Tables)'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Products Table */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Cake className="w-4 h-4 text-pink-600" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">public.products</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">All 18 Catalog Products</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[10px] font-bold block">
                          {products.length} in Catalog
                        </span>
                        {liveCounts && liveCounts.products !== null && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${liveCounts.products >= 18 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                            {liveCounts.products >= 18 ? `✓ ${liveCounts.products} live in Supabase` : `⚠️ ${liveCounts.products}/18 in Supabase`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingProductsSupabase}
                      onClick={async () => {
                        setIsSavingProductsSupabase(true);
                        await syncProductsToSupabase();
                        setIsSavingProductsSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className={`w-3.5 h-3.5 ${isSavingProductsSupabase ? 'animate-bounce' : ''}`} />
                      <span>{isSavingProductsSupabase ? 'Saving...' : liveCounts && liveCounts.products !== null && liveCounts.products < 18 ? `Upload All 18 Products (${18 - liveCounts.products} missing)` : `Save All ${products.length} Products`}</span>
                    </button>
                  </div>

                  {/* Orders Table */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">public.orders</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Customer & Demo Orders</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold block">
                          {orders.length > 0 ? orders.length : 3} Orders
                        </span>
                        {liveCounts && liveCounts.orders !== null && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${liveCounts.orders > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                            {liveCounts.orders > 0 ? `✓ ${liveCounts.orders} live in Supabase` : '⚠️ 0 in Supabase'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingOrdersSupabase}
                      onClick={async () => {
                        setIsSavingOrdersSupabase(true);
                        await syncOrdersToSupabase();
                        setIsSavingOrdersSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className={`w-3.5 h-3.5 ${isSavingOrdersSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingOrdersSupabase ? 'Saving...' : `Save ${orders.length > 0 ? orders.length : 3} Orders to Supabase`}</span>
                    </button>
                  </div>

                  {/* Inquiries Table */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">public.inquiries</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Custom Cake Requests</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold block">
                          {customInquiries.length > 0 ? customInquiries.length : 2} Inquiries
                        </span>
                        {liveCounts && liveCounts.inquiries !== null && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${liveCounts.inquiries > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {liveCounts.inquiries > 0 ? `✓ ${liveCounts.inquiries} live in Supabase` : '⚠️ 0 in Supabase'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingInquiriesSupabase}
                      onClick={async () => {
                        setIsSavingInquiriesSupabase(true);
                        await syncInquiriesToSupabase();
                        setIsSavingInquiriesSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Database className={`w-3.5 h-3.5 ${isSavingInquiriesSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingInquiriesSupabase ? 'Saving...' : `Save ${customInquiries.length > 0 ? customInquiries.length : 2} Inquiries`}</span>
                    </button>
                  </div>

                  {/* Categories Table */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-amber-600" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">public.categories</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">8 Cake Categories</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold block">
                          {categories.length} Categories
                        </span>
                        {liveCounts && liveCounts.categories !== null && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${liveCounts.categories >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {liveCounts.categories >= 8 ? `✓ ${liveCounts.categories} in Supabase` : `⚠️ ${liveCounts.categories}/8 in Supabase`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingCategoriesSupabase}
                      onClick={async () => {
                        setIsSavingCategoriesSupabase(true);
                        await syncCategoriesToSupabase();
                        setIsSavingCategoriesSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Database className={`w-3.5 h-3.5 ${isSavingCategoriesSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingCategoriesSupabase ? 'Saving...' : `Save ${categories.length} Categories`}</span>
                    </button>
                  </div>

                  {/* Reviews Table */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">public.reviews</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Customer Testimonials</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold block">
                          {reviews.length} Reviews
                        </span>
                        {liveCounts && liveCounts.reviews !== null && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${liveCounts.reviews > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {liveCounts.reviews > 0 ? `✓ ${liveCounts.reviews} in Supabase` : '⚠️ 0 in Supabase'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingReviewsSupabase}
                      onClick={async () => {
                        setIsSavingReviewsSupabase(true);
                        await syncReviewsToSupabase();
                        setIsSavingReviewsSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Database className={`w-3.5 h-3.5 ${isSavingReviewsSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingReviewsSupabase ? 'Saving...' : `Save ${reviews.length} Reviews`}</span>
                    </button>
                  </div>

                  {/* Business Settings & Site Content */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">settings & content</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Store Info, Bank & CMS</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold block">
                          Configured
                        </span>
                        {liveCounts && (
                          <span className={`text-[10px] font-semibold mt-0.5 block ${(liveCounts.businessSettings ?? 0) > 0 && (liveCounts.siteContent ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {(liveCounts.businessSettings ?? 0) > 0 && (liveCounts.siteContent ?? 0) > 0 ? '✓ Live in Supabase' : '⚠️ Click to save'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSavingSettingsSupabase}
                      onClick={async () => {
                        setIsSavingSettingsSupabase(true);
                        await syncSettingsToSupabase();
                        setIsSavingSettingsSupabase(false);
                        refreshLiveCounts();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className={`w-3.5 h-3.5 ${isSavingSettingsSupabase ? 'animate-spin' : ''}`} />
                      <span>{isSavingSettingsSupabase ? 'Saving...' : 'Save Settings & CMS'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSavingProductsSupabase}
                  onClick={async () => {
                    setIsSavingProductsSupabase(true);
                    await syncProductsToSupabase();
                    setIsSavingProductsSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Database className={`w-3.5 h-3.5 ${isSavingProductsSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingProductsSupabase ? 'Saving Products...' : `Save All ${products.length} Products to Supabase`}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingOrdersSupabase}
                  onClick={async () => {
                    setIsSavingOrdersSupabase(true);
                    await syncOrdersToSupabase();
                    setIsSavingOrdersSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShoppingBag className={`w-3.5 h-3.5 ${isSavingOrdersSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingOrdersSupabase ? 'Saving Orders...' : `Save All Customer Orders to Supabase`}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingSettingsSupabase}
                  onClick={async () => {
                    setIsSavingSettingsSupabase(true);
                    await syncSettingsToSupabase();
                    setIsSavingSettingsSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileText className={`w-3.5 h-3.5 ${isSavingSettingsSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingSettingsSupabase ? 'Saving Settings...' : 'Save Settings & CMS to Supabase'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingSupabase}
                  onClick={async () => {
                    setIsSyncingSupabase(true);
                    await syncWithSupabase();
                    setIsSyncingSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingSupabase ? 'Syncing...' : 'Sync Cloud Orders & Inquiries'}</span>
                </button>

                <button
                  type="button"
                  disabled={isPurgingSupabase}
                  onClick={async () => {
                    setIsPurgingSupabase(true);
                    await purgeSupabaseDeletedData();
                    setIsPurgingSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Remove all deleted data and images from Supabase"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isPurgingSupabase ? 'animate-pulse' : ''}`} />
                  <span>{isPurgingSupabase ? 'Cleaning...' : 'Purge Deleted Data from Supabase'}</span>
                </button>

                <button
                  type="button"
                  disabled={isLoadingSupabaseData || isSavingProductsSupabase}
                  onClick={async () => {
                    setIsLoadingSupabaseData(true);
                    await loadAllDataFromSupabase({ silent: false });
                    setIsLoadingSupabaseData(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white ${isLoadingSupabaseData ? 'animate-spin' : ''}`} />
                  <span>{isLoadingSupabaseData ? 'Loading from Cloud...' : 'Pull / Load Fresh Data & Images from Supabase'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingProductsSupabase || isSavingOrdersSupabase || isSavingSettingsSupabase}
                  onClick={async () => {
                    setIsSavingProductsSupabase(true);
                    setIsSavingOrdersSupabase(true);
                    setIsSavingSettingsSupabase(true);
                    setIsPurgingSupabase(true);
                    await saveAllDataToSupabase();
                    setIsSavingProductsSupabase(false);
                    setIsSavingOrdersSupabase(false);
                    setIsSavingSettingsSupabase(false);
                    setIsPurgingSupabase(false);
                    refreshLiveCounts();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-white ${isSavingProductsSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSavingProductsSupabase ? 'Syncing Full Database...' : 'Sync Everything to Supabase (Full Database Sync)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlSchemaModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-stone-500" />
                  <span>View Database Schema (SQL)</span>
                </button>
              </div>

              {/* Status probe box */}
              {supabaseTestStatus && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs font-mono text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800">
                  {supabaseTestStatus}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passcode Security Card */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-pink-600" />
                  <h4 className="font-serif text-lg font-bold">Admin Password</h4>
                </div>
                <p className="text-xs text-stone-500">
                  Current password: <strong className="font-mono text-stone-800 dark:text-stone-200">{adminPin}</strong>
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter new password (min. 4 characters)..."
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                  />
                  <button
                    onClick={() => {
                      if (!newPinInput.trim()) {
                        showToast('Password Required', 'Please enter a new password (min. 4 characters).', 'warning');
                        return;
                      }
                      if (newPinInput.trim().length < 4) {
                        showToast('Password Too Short', 'Password must be at least 4 characters long.', 'warning');
                        return;
                      }
                      updateAdminPin(newPinInput.trim());
                      setNewPinInput('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Export Data Card */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-serif text-lg font-bold">Export Store Backup</h4>
                </div>
                <p className="text-xs text-stone-500">
                  Download a complete JSON snapshot containing all your products, bank details, orders, and site copy.
                </p>

                <button
                  onClick={() => {
                    const json = exportAllStoreData();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `els-delight-store-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Backup Downloaded', 'File saved to your computer.');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File</span>
                </button>
              </div>

              {/* Import Data Card */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h4 className="font-serif text-lg font-bold">Import Backup</h4>
                </div>
                <p className="text-xs text-stone-500">
                  Paste JSON backup text to restore your catalog and website data.
                </p>

                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON text here..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                />

                <button
                  onClick={() => {
                    if (importJsonText && importJsonText.trim()) {
                      const ok = importStoreData(importJsonText.trim());
                      if (ok) setImportJsonText('');
                    } else {
                      showToast('JSON Input Required', 'Please paste valid store backup JSON text to restore.', 'warning');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore from JSON</span>
                </button>
              </div>

              {/* Factory Reset Card */}
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  <h4 className="font-serif text-lg font-bold text-rose-600">Factory Reset</h4>
                </div>
                <p className="text-xs text-stone-500">
                  Revert all products, bank details, orders, and texts to original default configurations.
                </p>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data to default? This cannot be undone.')) {
                      resetAllToFactoryDefaults();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs"
                >
                  Reset Everything to Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* PRODUCT CREATE / EDIT MODAL                               */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-2xl rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingProduct ? `Edit Cake: ${editingProduct.name}` : 'Add New Cake to Store'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} noValidate className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cake Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Luxury White Chocolate Strawberry Tier"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenCreateCategory();
                      }}
                      className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ New Category</span>
                    </button>
                  </div>
                  <select
                    value={productForm.category || categories[0]?.name || 'Birthday Cakes'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as CakeCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Base Price (₦ NGN) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={productForm.price === 0 ? '' : productForm.price}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                      const newPrice = rawVal === '' ? 0 : Number(rawVal);
                      const updatedSizes = (productForm.sizes || []).map((s, idx) => {
                        if (s.isBase || idx === 0) {
                          return { ...s, price: newPrice };
                        }
                        return s;
                      });
                      setProductForm({ ...productForm, price: newPrice, sizes: updatedSizes });
                    }}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Old Price (Strikeout discount, optional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={productForm.oldPrice || ''}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                      setProductForm({ ...productForm, oldPrice: rawVal ? Number(rawVal) : undefined });
                    }}
                    placeholder="e.g. 35000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Preparation Time Notice
                  </label>
                  <input
                    type="text"
                    value={productForm.preparationTime}
                    onChange={(e) => setProductForm({ ...productForm, preparationTime: e.target.value })}
                    placeholder="e.g. Same-day available or 24h notice"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm"
                  />
                </div>

                {/* Cake Sizes & Price of Each Size Editor */}
                <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-2.5">
                    <div>
                      <label className="block font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                        <span>Cake Sizes & Individual Pricing</span>
                        <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                          Editable Sizes
                        </span>
                      </label>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                        Edit the price (₦ NGN) of each cake size below. Customers selecting these sizes on the cake page will be charged these exact amounts.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const currentSizes = productForm.sizes || [];
                        const newSizeNumber = currentSizes.length + 1;
                        const defaultBase = currentSizes[0]?.price || productForm.price || 25000;
                        const newPrice = Math.round(defaultBase * (1 + newSizeNumber * 0.3));
                        setProductForm({
                          ...productForm,
                          sizes: [
                            ...currentSizes,
                            {
                              name: `${8 + (newSizeNumber - 1) * 2} inch (Feeds ${12 + newSizeNumber * 5}+)`,
                              label: `${8 + (newSizeNumber - 1) * 2} inch`,
                              price: newPrice,
                              priceModifier: Number((newPrice / defaultBase).toFixed(2)),
                              isBase: false,
                            },
                          ],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 self-start sm:self-auto shadow-xs"
                    >
                      <span>+ Add Cake Size</span>
                    </button>
                  </div>

                  {/* Size Rows */}
                  <div className="space-y-2.5 pt-1">
                    {(productForm.sizes || []).map((size, sIdx) => {
                      const isBase = Boolean(size.isBase) || sIdx === 0;
                      return (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-xl border transition-all grid grid-cols-1 sm:grid-cols-12 gap-3 items-center ${
                            isBase
                              ? 'bg-white dark:bg-stone-900 border-amber-300 dark:border-amber-800/80 shadow-xs'
                              : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          {/* Size Label & Full Name */}
                          <div className="sm:col-span-5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                Size {sIdx + 1}
                              </span>
                              {isBase && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                                  Base Size
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={size.name}
                              onChange={(e) => {
                                const updated = [...(productForm.sizes || [])];
                                updated[sIdx] = {
                                  ...updated[sIdx],
                                  name: e.target.value,
                                  label: e.target.value.split('(')[0].trim() || e.target.value,
                                };
                                setProductForm({ ...productForm, sizes: updated });
                              }}
                              placeholder="e.g. 8 inch (Feeds 12–16)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-medium"
                            />
                          </div>

                          {/* Exact Price (₦) */}
                          <div className="sm:col-span-4 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                              Price (₦ NGN) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                                ₦
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={size.price !== undefined ? (size.price === 0 ? '' : size.price) : (Math.round((productForm.price || 25000) * (size.priceModifier || 1)) || '')}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  const newPrice = rawVal === '' ? 0 : Number(rawVal);
                                  const updated = [...(productForm.sizes || [])];
                                  updated[sIdx] = {
                                    ...updated[sIdx],
                                    price: newPrice,
                                  };
                                  const newBasePrice = isBase ? newPrice : (productForm.price || 25000);
                                  setProductForm({
                                    ...productForm,
                                    price: newBasePrice,
                                    sizes: updated,
                                  });
                                }}
                                placeholder="Enter price..."
                                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-bold font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          {/* Actions: Set as Base / Delete */}
                          <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-1 sm:pt-0">
                            {!isBase && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (productForm.sizes || []).map((s, idx) => ({
                                    ...s,
                                    isBase: idx === sIdx,
                                  }));
                                  const selectedPrice = updated[sIdx]?.price !== undefined ? updated[sIdx].price : (productForm.price || 25000);
                                  setProductForm({
                                    ...productForm,
                                    price: selectedPrice,
                                    sizes: updated,
                                  });
                                }}
                                className="px-2 py-1 rounded text-[10px] font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-700 bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 transition-colors"
                              >
                                Set as Base
                              </button>
                            )}

                            {(productForm.sizes || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = (productForm.sizes || []).filter((_, idx) => idx !== sIdx);
                                  if (isBase && filtered.length > 0) {
                                    filtered[0].isBase = true;
                                  }
                                  setProductForm({
                                    ...productForm,
                                    sizes: filtered,
                                    price: filtered[0]?.price !== undefined ? filtered[0].price : productForm.price,
                                  });
                                }}
                                title="Remove size"
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cake Photo Management & Direct Gallery Uploader */}
                <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-rose-50/40 dark:bg-stone-900/60 border border-rose-100 dark:border-stone-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-stone-800 pb-2.5">
                    <div>
                      <label className="block font-semibold text-stone-800 dark:text-stone-200">
                        Product Photography *
                      </label>
                      <p className="text-[11px] text-stone-500">
                        Upload cake photos directly from your phone/device gallery, or pick from presets.
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setProductImageTab('gallery_upload')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          productImageTab === 'gallery_upload'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Device Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductImageTab('presets')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          productImageTab === 'presets'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <Cake className="w-3.5 h-3.5" />
                        <span>Presets</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductImageTab('url')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          productImageTab === 'url'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE TAB: Upload Direct From Device Gallery */}
                  {productImageTab === 'gallery_upload' && (
                    <div className="space-y-3">
                      <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-pink-900/80 rounded-2xl bg-white dark:bg-stone-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 transition-all text-center group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleProductGalleryUpload}
                          disabled={isUploadingProductImage}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-rose-950/60 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                          {isUploadingProductImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-pink-600" />
                          ) : (
                            <UploadCloud className="w-6 h-6 text-pink-600" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                          {isUploadingProductImage ? 'Optimizing & Uploading...' : 'Tap to Choose from Gallery or Camera Roll'}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Select photo from your phone or computer · Auto-resized for fast loading
                        </span>
                      </label>
                    </div>
                  )}

                  {/* ACTIVE TAB: Curated Cake Presets */}
                  {productImageTab === 'presets' && (
                    <div className="space-y-2">
                      <span className="text-[11px] text-stone-500 font-medium">Select a curated artisanal cake photo:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_CAKE_IMAGES.map((preset, idx) => {
                          const isSelected = productForm.images?.[0] === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setProductForm((prev) => ({
                                  ...prev,
                                  images: [preset.url, ...(prev.images || []).filter((u) => u !== preset.url)],
                                }));
                              }}
                              className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-pink-600 bg-pink-50/60 dark:bg-rose-950/40 ring-2 ring-pink-500'
                                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-pink-300'
                              }`}
                            >
                              <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              <span className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 line-clamp-2">
                                {preset.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE TAB: Image URL Input */}
                  {productImageTab === 'url' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... or web image link"
                          value={customImageUrlInput}
                          onChange={(e) => setCustomImageUrlInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customImageUrlInput.trim()) {
                              setProductForm((prev) => ({
                                ...prev,
                                images: [customImageUrlInput.trim(), ...(prev.images || [])],
                              }));
                              setCustomImageUrlInput('');
                              showToast('Image URL Added', 'Image link added as primary photo.');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current Photos Strip & Primary Indicator */}
                  <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Current Listing Photos ({productForm.images?.length || 0}) · First photo is Cover Image
                      </span>
                      {productForm.images && productForm.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            requestDelete(
                              'Delete All Photos?',
                              'Are you sure you want to delete all photos from this cake listing? You will need to upload or select a new photo before saving.',
                              () => {
                                setProductForm((prev) => ({ ...prev, images: [] }));
                                showToast('Photos Cleared', 'All photos removed. Upload or select a fresh photo.');
                              }
                            );
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete All Photos</span>
                        </button>
                      )}
                    </div>

                    {productForm.images && productForm.images.length > 0 ? (
                      <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
                        {productForm.images.map((imgUrl, idx) => {
                          const isCover = idx === 0;
                          return (
                            <div
                              key={idx}
                              className={`relative group shrink-0 rounded-2xl overflow-hidden border transition-all ${
                                isCover
                                  ? 'border-pink-600 ring-2 ring-pink-500/40 shadow-sm'
                                  : 'border-stone-200 dark:border-stone-800 hover:border-pink-300'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Product thumbnail ${idx + 1}`}
                                className="w-20 h-20 object-cover"
                              />
                              {isCover ? (
                                <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-center bg-pink-600/90 backdrop-blur-xs text-white px-1 py-0.5 rounded-md">
                                  Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  title="Set as Cover Image"
                                  onClick={() => {
                                    setProductForm((prev) => {
                                      const images = prev.images || [];
                                      const selected = images[idx];
                                      const remaining = images.filter((_, i) => i !== idx);
                                      return { ...prev, images: [selected, ...remaining] };
                                    });
                                  }}
                                  className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                title="Delete this photo from cake listing"
                                onClick={() => {
                                  requestDelete(
                                    'Delete This Photo?',
                                    `Are you sure you want to delete photo #${idx + 1} from this cake listing?`,
                                    () => {
                                      setProductForm((prev) => ({
                                        ...prev,
                                        images: (prev.images || []).filter((_, i) => i !== idx),
                                      }));
                                      showToast('Photo Removed', 'Photo removed from cake listing.');
                                    }
                                  );
                                }}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all shadow-sm z-10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-rose-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-center text-xs text-stone-500">
                        No photos currently attached to this cake listing. Choose a photo from gallery, pick a preset, or enter an image URL above.
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.bestseller)}
                      onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                      className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Bestseller Badge</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.featured)}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Featured on Homepage</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.isNew)}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">New Arrival Tag</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-rose-100 dark:border-stone-800 flex items-center justify-between gap-3">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteProduct(editingProduct)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Cake Permanently</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    {editingProduct ? 'Save Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD REVIEW MODAL                                          */}
      {/* ========================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-md rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <h4 className="font-serif text-lg font-bold">Add Customer Testimonial</h4>
              <button onClick={() => setIsReviewModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addReview(reviewForm);
                setIsReviewModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  placeholder="e.g. Mrs. Adeola Johnson"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  placeholder="e.g. Festac Town, Lagos"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Occasion / Cake Ordered</label>
                <input
                  type="text"
                  value={reviewForm.occasion}
                  onChange={(e) => setReviewForm({ ...reviewForm, occasion: e.target.value })}
                  placeholder="e.g. Daughter's 1st Birthday"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Review Quote *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="What the customer said about the cake..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white font-bold rounded-xl"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SQL SCHEMA MODAL                                              */}
      {/* ------------------------------------------------------------- */}
      {showSqlSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-rose-100 dark:border-stone-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-pink-600" />
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Supabase Database Schema
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlSchemaModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Copy this SQL script and paste it into your <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New query &rarr; Run</strong>. It creates all tables (<code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">orders</code>, <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">inquiries</code>, <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">products</code> [18 catalog products], <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">categories</code>, <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">reviews</code>, <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">business_settings</code>, and <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">site_content</code>) with Row Level Security.
            </p>

            <div className="relative">
              <textarea
                readOnly
                rows={14}
                value={SUPABASE_SQL_SCHEMA_SCRIPT}
                className="w-full p-3 font-mono text-[11px] leading-relaxed bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-500">
                Saved in file: <code className="font-mono">supabase/schema.sql</code>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
                      setSqlCopied(true);
                      showToast('SQL Copied! 📋', 'Complete 18-product schema copied to clipboard for your Supabase SQL editor.');
                      setTimeout(() => setSqlCopied(false), 3000);
                    } catch {
                      showToast('Copy Failed', 'Please select and copy the text manually.', 'warning');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlSchemaModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CATEGORY CREATE / EDIT MODAL                              */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-xl rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              {/* Category Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Anniversary Cakes, Pastries & Pies, Valentine Specials"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    This appears on the homepage carousel, shop filter bar, and product menus.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={categoryForm.label}
                    onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                    placeholder="e.g. Celebrate your sweet love"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Count / Price Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.count || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, count: e.target.value })}
                    placeholder="e.g. From ₦10,000, 8+ styles, Fresh daily"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  />
                </div>
              </div>

              {/* Cover Photo Picker: 3 Tabs (Upload, Presets, URL) */}
              <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300">
                    Category Cover Image *
                  </label>
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCategoryImageTab('upload')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        categoryImageTab === 'upload'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Gallery Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryImageTab('preset')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        categoryImageTab === 'preset'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryImageTab('url')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        categoryImageTab === 'url'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Web URL
                    </button>
                  </div>
                </div>

                {/* Tab 1: Upload from Gallery/Camera */}
                {categoryImageTab === 'upload' && (
                  <div>
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-pink-300 dark:border-pink-900/80 rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 transition-all text-center">
                      <input
                        ref={categoryFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryGalleryUpload}
                        disabled={isUploadingCategoryImage}
                        className="hidden"
                      />
                      <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center mb-1">
                        {isUploadingCategoryImage ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {isUploadingCategoryImage ? 'Optimizing photo...' : 'Click or tap to upload photo from your device'}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        High resolution camera photos are automatically optimized for fast loading
                      </p>
                    </label>
                  </div>
                )}

                {/* Tab 2: Bakery Presets */}
                {categoryImageTab === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1">
                    {PRESET_CATEGORY_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, image: preset.url })}
                        className={`flex flex-col items-center p-1.5 rounded-xl border text-center transition-all ${
                          categoryForm.image === preset.url
                            ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/40 ring-2 ring-pink-500'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-pink-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-lg object-cover mb-1"
                        />
                        <span className="text-[9px] font-semibold text-stone-800 dark:text-stone-200 truncate w-full">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab 3: URL */}
                {categoryImageTab === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Real-time Preview: How it will look on Homepage Carousel */}
              <div className="bg-rose-50/60 dark:bg-stone-900/60 p-4 rounded-2xl border border-rose-100 dark:border-stone-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-2">
                  Homepage Carousel Preview
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 shadow-xs shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-900">
                      <img
                        src={categoryForm.image || PRESET_CATEGORY_IMAGES[0].url}
                        alt={categoryForm.name || 'Category'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                      {categoryForm.name || 'Category Name'}
                    </h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {categoryForm.label || 'Artisan handcrafted style'}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-pink-600 dark:text-pink-400 mt-1">
                      {categoryForm.count || 'Catalogue Style'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-rose-100 dark:border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Save Changes' : 'Publish Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CATEGORY CONFIRMATION MODAL                        */}
      {/* ========================================================= */}
      {isDeleteCategoryModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-md rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Remove Category
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteCategoryModalOpen(false);
                  setCategoryToDelete(null);
                }}
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to remove <strong>"{categoryToDelete.name}"</strong>? It will no longer appear on the homepage carousel or store filter.
            </p>

            {/* Check if any products currently belong to this category */}
            {(() => {
              const count = products.filter(
                (p) => p.category?.toLowerCase() === categoryToDelete.name.toLowerCase()
              ).length;

              if (count > 0) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-2xl space-y-2 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{count} product{count > 1 ? 's' : ''} currently in this category</span>
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Choose another category to safely reassign these cakes to so they remain visible in your shop:
                    </p>
                    <select
                      value={reassignCategoryTarget}
                      onChange={(e) => setReassignCategoryTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-900 text-xs font-semibold"
                    >
                      {categories
                        .filter((c) => c.name.toLowerCase() !== categoryToDelete.name.toLowerCase())
                        .map((c) => (
                          <option key={c.name} value={c.name}>
                            Move to: {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              }
              return (
                <p className="text-[11px] text-stone-500">
                  There are no products currently assigned to this category.
                </p>
              );
            })()}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteCategoryModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE PRODUCT PERMANENTLY CONFIRMATION PROMPT MODAL     */}
      {/* ========================================================= */}
      {isDeleteProductModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Delete Cake Permanently?
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteProductModalOpen(false);
                  setProductToDelete(null);
                }}
              >
                <X className="w-5 h-5 text-stone-400 hover:text-stone-600" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-stone-900 dark:text-stone-100 font-bold">"{productToDelete.name}"</strong>?
            </p>

            {/* Product Card Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <img
                src={
                  (productToDelete.images[0] && !productToDelete.images[0].includes('photo-1578985545062'))
                    ? productToDelete.images[0]
                    : '/logo.svg'
                }
                alt={productToDelete.name}
                className="w-14 h-14 rounded-xl object-contain bg-rose-50 dark:bg-stone-800 p-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                  {productToDelete.name}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {productToDelete.category} · {formatNaira(productToDelete.price)}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  ID: {productToDelete.id}
                </span>
              </div>
            </div>

            {/* Permanent Warning */}
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 rounded-2xl space-y-1 text-xs text-rose-800 dark:text-rose-200">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Permanent Website & Admin Removal</span>
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                This cake listing and its images will be deleted permanently from both your Admin Dashboard and the live customer-facing website (Shop, Cakes, Occasions, and Search). This action cannot be reversed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteProductModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel, Keep Cake
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* UNIVERSAL DELETE CONFIRMATION PROMPT MODAL                */}
      {/* ========================================================= */}
      {genericDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  {genericDeleteModal.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-stone-400 hover:text-stone-600" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {genericDeleteModal.message}
            </p>

            {genericDeleteModal.itemDetails && (
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 font-medium">
                {genericDeleteModal.itemDetails}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel, Keep It
              </button>
              <button
                type="button"
                onClick={() => {
                  genericDeleteModal.onConfirm();
                  setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete This</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT OCCASION CARD MODAL                            */}
      {/* ========================================================= */}
      {isOccasionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-lg rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {editingOccasionIndex !== null ? 'Edit Occasion Card' : 'Add New Occasion Card'}
              </h4>
              <button
                type="button"
                onClick={() => setIsOccasionModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOccasionItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Occasion Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={occasionItemForm.title}
                    onChange={(e) => setOccasionItemForm({ ...occasionItemForm, title: e.target.value })}
                    placeholder="e.g. Birthdays, Weddings, Anniversaries"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={occasionItemForm.subtitle}
                    onChange={(e) => setOccasionItemForm({ ...occasionItemForm, subtitle: e.target.value })}
                    placeholder="e.g. Make their special day unforgettable."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Filter ID / Category Tag
                  </label>
                  <input
                    type="text"
                    value={occasionItemForm.id}
                    onChange={(e) => setOccasionItemForm({ ...occasionItemForm, id: e.target.value })}
                    placeholder="e.g. Birthday, Wedding"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Link (optional)
                  </label>
                  <input
                    type="text"
                    value={occasionItemForm.link || ''}
                    onChange={(e) => setOccasionItemForm({ ...occasionItemForm, link: e.target.value })}
                    placeholder="Auto: /shop?occasion=..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Image Selection */}
              <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Occasion Cover Photo
                  </span>
                  <div className="flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setOccasionImageTab('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        occasionImageTab === 'upload' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccasionImageTab('preset')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        occasionImageTab === 'preset' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccasionImageTab('url')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        occasionImageTab === 'url' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {occasionImageTab === 'upload' && (
                  <div>
                    <input
                      ref={occasionFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleOccasionImageUpload}
                      disabled={isUploadingOccasionImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => occasionFileInputRef.current?.click()}
                      disabled={isUploadingOccasionImage}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 text-center flex flex-col items-center justify-center transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-6 h-6 text-pink-600 mb-1" />
                      <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                        {isUploadingOccasionImage ? 'Optimizing photo...' : 'Tap to select photo from device'}
                      </span>
                    </button>
                  </div>
                )}

                {occasionImageTab === 'preset' && (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                    {PRESET_CATEGORY_IMAGES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setOccasionItemForm({ ...occasionItemForm, image: preset.url })}
                        className={`p-1 rounded-xl border transition-all ${
                          occasionItemForm.image === preset.url
                            ? 'border-pink-600 ring-2 ring-pink-500'
                            : 'border-stone-200 dark:border-stone-800 hover:border-pink-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 rounded-lg object-cover" />
                        <span className="text-[9px] font-semibold truncate block mt-0.5">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {occasionImageTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={customOccasionImageUrl}
                      onChange={(e) => setCustomOccasionImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customOccasionImageUrl.trim()) {
                          setOccasionItemForm({ ...occasionItemForm, image: customOccasionImageUrl.trim() });
                          setCustomOccasionImageUrl('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Preview Thumbnail */}
                {occasionItemForm.image && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <img src={occasionItemForm.image} alt="Occasion Preview" className="w-14 h-10 object-cover rounded-lg" />
                    <span className="text-[11px] text-stone-500 truncate flex-1">Selected cover photo</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-rose-100 dark:border-stone-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOccasionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Save Occasion Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT SWEET MOMENT MODAL                             */}
      {/* ========================================================= */}
      {isMomentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-lg rounded-3xl border border-rose-100 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
              <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {editingMomentIndex !== null ? 'Edit Sweet Moment' : 'Add Sweet Moment'}
              </h4>
              <button
                type="button"
                onClick={() => setIsMomentModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMomentItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hashtag / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    value={momentItemForm.tag}
                    onChange={(e) => setMomentItemForm({ ...momentItemForm, tag: e.target.value })}
                    placeholder="e.g. #BirthdayGlam"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={momentItemForm.category}
                    onChange={(e) => setMomentItemForm({ ...momentItemForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Celebrations">Celebrations</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Like Count Display
                  </label>
                  <input
                    type="text"
                    value={momentItemForm.likes}
                    onChange={(e) => setMomentItemForm({ ...momentItemForm, likes: e.target.value })}
                    placeholder="e.g. 248 or 412"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                  />
                </div>
              </div>

              {/* Photo selector */}
              <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Gallery Photo *
                  </span>
                  <div className="flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMomentImageTab('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        momentImageTab === 'upload' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomentImageTab('preset')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        momentImageTab === 'preset' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomentImageTab('url')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        momentImageTab === 'url' ? 'bg-pink-600 text-white shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {momentImageTab === 'upload' && (
                  <div>
                    <input
                      ref={momentFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMomentImageUpload}
                      disabled={isUploadingMomentImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => momentFileInputRef.current?.click()}
                      disabled={isUploadingMomentImage}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-900 hover:bg-pink-50/50 dark:hover:bg-rose-950/20 text-center flex flex-col items-center justify-center transition-all cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-pink-600 mb-1" />
                      <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                        {isUploadingMomentImage ? 'Optimizing photo...' : 'Tap to select photo from device'}
                      </span>
                    </button>
                  </div>
                )}

                {momentImageTab === 'preset' && (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                    {PRESET_CAKE_IMAGES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setMomentItemForm({ ...momentItemForm, image: preset.url })}
                        className={`p-1 rounded-xl border transition-all ${
                          momentItemForm.image === preset.url
                            ? 'border-pink-600 ring-2 ring-pink-500'
                            : 'border-stone-200 dark:border-stone-800 hover:border-pink-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 rounded-lg object-cover" />
                        <span className="text-[9px] font-semibold truncate block mt-0.5">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {momentImageTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={customMomentImageUrl}
                      onChange={(e) => setCustomMomentImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customMomentImageUrl.trim()) {
                          setMomentItemForm({ ...momentItemForm, image: customMomentImageUrl.trim() });
                          setCustomMomentImageUrl('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Preview Thumbnail */}
                {momentItemForm.image && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <img src={momentItemForm.image} alt="Moment Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-[11px] text-stone-500 truncate flex-1">Selected photo</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-rose-100 dark:border-stone-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMomentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Save Sweet Moment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
