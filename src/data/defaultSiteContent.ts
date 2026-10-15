import { SiteContent, BusinessInfo, LogoSettings, DeliveryMethodOption, SiteBudgetSectionContent, CustomColorPalette, CustomPageConfig } from '../types';
import { BUSINESS_INFO, TESTIMONIALS } from './products';
import preseededData from './preseededData.json';

export const DEFAULT_LOGO_SETTINGS: LogoSettings = (preseededData.logoSettings as LogoSettings) || {
  mode: 'default',
  customUrl: '',
  alt: "El's Delight Treats Logo",
  shape: 'transparent',
  sizePreset: 'standard',
  showWordmark: true,
  wordmarkText: "El's Delight",
  wordmarkSubtext: 'Treats',
};

export const DEFAULT_DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    id: 'uber',
    name: 'Uber Package / Uber Delivery',
    description: 'Direct Uber door-to-door delivery car or package dispatch to your destination.',
    pricingNote: 'Pay driver directly on delivery (based on Uber live rate)',
    isPickup: false,
    enabled: true,
    iconType: 'uber',
  },
  {
    id: 'pickup',
    name: "Self-Pickup from El's Delight Store",
    description: 'Collect your cake fresh at our studio: Lakeview Phase 1, Amuwo-Odofin, Lagos.',
    pricingNote: '100% Free - No delivery charge',
    isPickup: true,
    enabled: true,
    iconType: 'pickup',
  },
  {
    id: 'bolt',
    name: 'Bolt Dispatch / Delivery',
    description: 'Bolt package delivery service with direct dispatch across Lagos.',
    pricingNote: 'Pay driver/rider directly on delivery (Bolt live rate)',
    isPickup: false,
    enabled: true,
    iconType: 'bolt',
  },
  {
    id: 'dispatch',
    name: 'Third-Party Dispatch Rider / Bike Courier',
    description: 'Dedicated Lagos motorcycle dispatch box for swift neighborhood delivery.',
    pricingNote: 'Pay dispatch rider directly on delivery',
    isPickup: false,
    enabled: true,
    iconType: 'dispatch',
  },
  {
    id: 'driver',
    name: "Customer's Personal Driver / Chauffeur Pickup",
    description: 'Send your personal driver or family member to pick up from our bakery studio.',
    pricingNote: '100% Free - No delivery charge',
    isPickup: true,
    enabled: true,
    iconType: 'driver',
  },
  {
    id: 'interstate',
    name: 'Interstate / Outside Lagos Waybill Dispatch',
    description: 'Carefully packed transport/park waybill for cities outside Lagos State.',
    pricingNote: 'Pay logistics/waybill fee directly to transporter on dispatch',
    isPickup: false,
    enabled: true,
    iconType: 'interstate',
  },
];

export const DEFAULT_DELIVERY_POLICY_NOTICE =
  "Delivery Fee Policy: Please note that the delivery fee is NOT added to the money you pay El's Delight for your cake. The customer pays the delivery fee directly to the courier/driver on delivery based on the Uber/courier live rate (or enjoy 100% free self-pickup at our Amuwo-Odofin bakery studio).";

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: BUSINESS_INFO.name,
  tagline: BUSINESS_INFO.tagline,
  type: BUSINESS_INFO.type,
  address: BUSINESS_INFO.address,
  pickupNote: BUSINESS_INFO.pickupNote,
  phone: BUSINESS_INFO.phone,
  whatsappNumber: BUSINESS_INFO.whatsappNumber,
  whatsappUrlNumber: BUSINESS_INFO.whatsappUrlNumber,
  email: BUSINESS_INFO.email,
  instagram: BUSINESS_INFO.instagram,
  instagramUrl: BUSINESS_INFO.instagramUrl,
  facebook: BUSINESS_INFO.facebook,
  facebookUrl: BUSINESS_INFO.facebookUrl,
  logo: DEFAULT_LOGO_SETTINGS,
  logoUrl: '',
  logoType: 'default',
  payment: {
    bank: BUSINESS_INFO.payment.bank,
    accountName: BUSINESS_INFO.payment.accountName,
    accountNumber: BUSINESS_INFO.payment.accountNumber,
  },
  openingHours: BUSINESS_INFO.openingHours,
  deliveryFeeFlat: 3500,
  freeDeliveryThreshold: 75000,
  deliveryPolicyNotice: DEFAULT_DELIVERY_POLICY_NOTICE,
  deliveryMethods: DEFAULT_DELIVERY_METHODS,
};

export const DEFAULT_BUDGET_SECTION: SiteBudgetSectionContent = {
  badge: 'Affordable Luxury',
  headline: 'Something Sweet for Every Budget',
  subtitle: "Whether it's an impromptu solo indulgence, a warm family birthday, or an extravagant Lagos wedding, we have your cravings covered.",
  tier1: {
    id: 'petite',
    eyebrow: 'Pocket-Friendly & Quick',
    title: 'Petite Celebrations',
    price: '₦20,000 – ₦30,000',
    features: [
      'Single-tier 6-inch layer cakes',
      'Feeds 6–8 family and friends',
      'Free customized piped inscription',
      'Same-day express pickup & dispatch',
    ],
    buttonText: 'Shop Petite Cakes',
    buttonLink: '/shop?price=20k-40k',
  },
  tier2: {
    id: 'celebration',
    badge: 'Most Popular',
    eyebrow: 'Unforgettable Memories',
    title: 'Celebration',
    price: '₦10,000 – ₦40,000',
    features: [
      'Signature chocolate, red velvet & vanilla',
      '6, 8, and 10-inch birthday cakes',
      'Free customized piped inscription',
      'Anniversaries, graduations & family cakes',
    ],
    buttonText: 'Shop Celebration',
    buttonLink: '/shop?price=10k-40k',
  },
  tier3: {
    id: 'luxury',
    eyebrow: 'Grand Occasions',
    title: 'Luxury & Weddings',
    price: '₦80,000+',
    features: [
      '2-Tier & 3-Tier luxury wedding cakes',
      'Hand-crafted sugar flora & 24k gold leaf',
      'Large corporate event sheet cakes',
      'White-glove setup & dedicated delivery',
    ],
    buttonText: 'Shop Luxury',
    buttonLink: '/shop?price=80k-plus',
  },
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    kicker: 'Amuwo-Odofin, Lagos · Handcrafted Daily',
    headline: 'Sweet moments deserve something special.',
    supportingCopy: 'Beautifully crafted cakes and treats for birthdays, weddings, romantic gifts, corporate events, and every moment worth celebrating across Lagos.',
    primaryCtaText: 'Shop Cakes',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Best Sellers',
    secondaryCtaLink: '/best-sellers',
    customCakeCtaText: 'Create a Custom Cake →',
    badge1: 'Premium Ingredients',
    badge2: 'Punctual Lagos Delivery',
    badge3: 'Freshly Baked Daily',
    // Featured Today Cake (Right Hero Column)
    showFeaturedCake: true,
    featuredCakeImage: (preseededData.hero?.featuredCakeImage as string) || '/assets/sister-nk-cake.svg',
    featuredCakeTitle: (preseededData.hero?.featuredCakeTitle as string) || 'Gold Splatter "Happy Birthday Sister NK" Cake',
    featuredCakePrice: (preseededData.hero?.featuredCakePrice as string) || '₦38,000',
    featuredCakeTag: (preseededData.hero?.featuredCakeTag as string) || 'Featured Today',
    featuredCakeRating: '',
    featuredCakeSubtitle: (preseededData.hero?.featuredCakeSubtitle as string) || 'Over 500+ Lagos Celebrations',
    ...((preseededData.hero as any) || {}),
  },
  announcements: [
    {
      id: 'ann-1',
      text: 'Freshly Baked • Beautifully Designed • Made for Your Special Moments',
      link: '/shop',
      linkText: 'Shop Now',
      enabled: true,
      external: false,
      iconType: 'freshly_baked',
      imageUrl: '/logo.svg',
    },
    {
      id: 'ann-2',
      text: 'Doorstep Delivery Across Lagos & Self-Pickup in Amuwo-Odofin',
      link: '/faq',
      linkText: 'Delivery Details',
      enabled: true,
      external: false,
      iconType: 'delivery',
    },
    {
      id: 'ann-3',
      text: 'Fast WhatsApp Orders & Instant Bank Transfer Confirmation',
      link: 'https://wa.me/2349138761465?text=Hello%20El%27s%20Delight%20Treats%2C%20I%20would%20like%20to%20make%20an%20enquiry.',
      linkText: 'Chat With Us',
      enabled: true,
      external: true,
      iconType: 'whatsapp',
    },
  ],
  brandPromises: [
    {
      id: 'prom-1',
      title: 'Freshly Baked',
      desc: 'Fresh cakes prepared specifically for your celebration, never pre-frozen.',
      iconName: 'Flame',
    },
    {
      id: 'prom-2',
      title: 'Quality Ingredients',
      desc: 'Carefully selected Belgian cocoas, rich dairy butter, and pure vanilla beans.',
      iconName: 'Award',
    },
    {
      id: 'prom-3',
      title: 'Beautiful Designs',
      desc: 'Cakes created with meticulous attention to detail and artistic finish.',
      iconName: 'Palette',
    },
    {
      id: 'prom-4',
      title: 'Reliable Service',
      desc: 'Clear communication, prompt Stanbic IBTC verification, and punctual Lagos dispatch.',
      iconName: 'ShieldCheck',
    },
    {
      id: 'prom-5',
      title: 'Made for Your Moment',
      desc: 'Every milestone deserves something extraordinarily sweet and memorable.',
      iconName: 'HeartHandshake',
    },
  ],
  about: {
    headline: 'Artisanal Elegance in Every Slice',
    tagline: 'Beautiful Cakes. Memorable Moments.',
    paragraph1: "Welcome to El's Delight Treats, where passion for baking meets artistic confectionery design. Based in the heart of Amuwo-Odofin, Lagos, we specialize in luxury bespoke celebration cakes, multi-tiered wedding cakes, and handcrafted sweet treats.",
    paragraph2: "Every cake in our studio begins with a commitment to pure quality. We reject pre-mixes and artificial shortcuts in favour of premium ingredients: Belgian cocoa, pure Madagascar vanilla extracts, fresh dairy creams, and locally sourced fruits.",
    paragraph3: "Whether it is a child's milestone 10th birthday in Festac, an intimate proposal cake in Surulere, or a majestic 4-tier wedding centerpiece on Victoria Island, we pour love, patience, and precision into every single creation.",
    founderName: 'Chinazor Adaora Arinze',
    founderRole: 'Founder & Head Confectioner',
    imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=900&q=80',
    values: [
      { id: 'val-1', emoji: '', title: 'Real Ingredients', desc: 'Pure vanilla beans, authentic Belgian cocoa, and rich dairy butter.' },
      { id: 'val-2', emoji: '', title: 'Artisan Piping', desc: 'Vintage Lambeth ruffles, smooth ganache drip, and custom edible prints.' },
      { id: 'val-3', emoji: '', title: 'Reliable Timing', desc: 'Same-day availability for rush orders and prompt weekend delivery.' },
      { id: 'val-4', emoji: '', title: 'Personal Service', desc: 'Direct WhatsApp support and personalized cake inscriptions.' },
    ],
  },
  faqs: [
    {
      id: 'faq-1',
      category: 'Ordering & Notice',
      q: 'How far in advance should I place my cake order?',
      a: 'For standard celebration cakes (6-inch and 8-inch), we offer same-day availability for orders placed before 12:00 PM. Custom tiered cakes, wedding showpieces, and corporate sheet cakes require 24 to 72 hours notice to ensure intricate hand-piping and structure.',
    },
    {
      id: 'faq-2',
      category: 'Payment',
      q: 'How does payment work?',
      a: 'We accept direct bank transfers to our verified Stanbic IBTC bank account: Account Name: Chinazor Adaora Arinze, Bank: Stanbic IBTC, Account Number: 0086485307. Once you transfer, click "PAYMENT MADE" on our website or send your transfer receipt on WhatsApp for instant verification.',
    },
    {
      id: 'faq-3',
      category: 'Delivery',
      q: 'Do I pay the delivery fee to El’s Delight, and how are delivery charges handled?',
      a: 'No, delivery fees are NOT added to the money you pay El’s Delight for your cake! You only pay El’s Delight for your cake order. Delivery is paid on delivery directly to the driver/rider based on the real-time Uber or courier rate. If you prefer to avoid delivery charges entirely, you can choose free self-pickup at our bakery studio in Lakeview Phase 1, Amuwo-Odofin, Lagos.',
    },
    {
      id: 'faq-3b',
      category: 'Delivery',
      q: 'What cake delivery options can I choose from across Nigeria?',
      a: 'We offer multiple flexible cake delivery options across Nigeria: (1) Uber Package / Uber Delivery (paid on delivery by customer based on live Uber rate), (2) Self-Pickup from El’s Delight Store in Amuwo-Odofin (100% Free), (3) Bolt Dispatch / Delivery (paid on delivery), (4) Third-Party Dispatch Rider / Bike Courier (paid on delivery), (5) Customer’s Personal Driver / Chauffeur Pickup (Free), and (6) Interstate Waybill Dispatch for deliveries outside Lagos State.',
    },
    {
      id: 'faq-4',
      category: 'Pickup',
      q: 'Can I pick up my cake in person?',
      a: 'Yes, absolutely! Self-pickup is completely free of charge. Our bakery studio is located at Lakeview Phase 1, Amuwo-Odofin, Lagos. Simply select "Bakery Pickup" during checkout, and we will package your cake securely for car or hand transport.',
    },
    {
      id: 'faq-5',
      category: 'Care',
      q: 'How should I store my cake in Lagos weather?',
      a: 'To maintain the pristine integrity of whipped buttercream and cream cheese frostings in Lagos humidity, keep your cake in an air-conditioned room or refrigerator until 1–2 hours before your cake-cutting ceremony. Avoid direct sunlight or hot car boots during transit.',
    },
    {
      id: 'faq-6',
      category: 'Customization',
      q: 'Can I customize the text written on the cake?',
      a: 'Yes, complimentary piped inscriptions are included with all celebration and custom cakes! Simply type your desired inscription (e.g. "Happy 30th Birthday Tunde!") in the cake message input on the product page or checkout form.',
    },
    {
      id: 'faq-7',
      category: 'Corporate',
      q: 'Do you cater for corporate events and office birthdays?',
      a: 'Yes! We supply branded company logo cakes, monthly staff birthday retainers, client appreciation gifts, and executive boardroom sweet platters. Official invoice receipts with tax breakdown are provided upon request.',
    },
  ],
  corporate: {
    headline: 'Sweeter Business Moments',
    subheadline: 'Corporate Gifting & Event Catering across Lagos',
    intro: "From staff birthdays and office meetings to client appreciation and end-of-year celebrations, El's Delight Treats creates beautiful cakes and treats for your business across Lagos.",
    perks: [
      { id: 'cp-1', title: 'Staff Birthdays', desc: 'Automated recurring monthly or quarterly celebration cakes for your workforce.' },
      { id: 'cp-2', title: 'Branded Company Cakes', desc: 'Precision edible printing of company logos, brand colors, and slogans.' },
      { id: 'cp-3', title: 'Client Appreciation Gifts', desc: 'Luxury artisanal confectionery and custom celebration treats delivered directly to partners.' },
      { id: 'cp-4', title: 'End-of-Year & AGM Parties', desc: 'Multi-tier showpiece sheet cakes feeding 50 to 250+ employees and guests.' },
      { id: 'cp-5', title: 'Office Meetings & Milestone Wins', desc: 'Moist celebratory cakes and gourmet confectionery for executive boardrooms.' },
      { id: 'cp-6', title: 'Official Invoicing & Bank Transfer', desc: 'Corporate receipts, Stanbic IBTC bank invoicing, and punctual Lagos dispatch.' },
    ],
  },
  occasionsSection: {
    badge: 'Curated for Nigerian Celebrations',
    headline: 'Find a Cake for Every Occasion',
    viewAllText: 'View All Occasion Collections',
    items: [
      { id: 'Birthday', title: 'Birthday', subtitle: 'Make their special day unforgettable.', image: '/og-logo.png' },
      { id: 'Wedding', title: 'Wedding', subtitle: 'Elegant cakes for beautiful beginnings.', image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80' },
      { id: 'Christmas', title: 'Christmas', subtitle: 'Celebrate the festive season with holiday sweetness.', image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&crop=center&w=800&h=800&q=85' },
      { id: 'Anniversary', title: 'Anniversary', subtitle: 'Celebrate your love with something delicious.', image: 'https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=600&q=80' },
      { id: 'Graduation', title: 'Graduation', subtitle: 'Celebrate every proud milestone & academic win.', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80' },
      { id: 'Corporate', title: 'Corporate', subtitle: 'Professional cakes for memorable business moments.', image: '/og-logo.png' },
      { id: 'Baby Shower', title: 'Baby Shower', subtitle: 'Sweet treats for welcoming little miracles.', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  sweetMoments: (preseededData.sweetMoments as any) || {
    badge: 'els_delighttreats',
    headline: "Sweet Moments at El's",
    subtitle: 'Follow our daily baking journey, live frosting reels, and client setups in Lagos.',
    buttonText: 'Follow Us on Instagram',
    buttonUrl: 'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==',
    items: [
      {
        id: 'gal-1',
        image: '/og-logo.png',
        tag: '#BirthdayGlam',
        likes: '248',
        category: 'Birthday',
      },
      {
        id: 'gal-2',
        image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80',
        tag: '#LagosWeddings',
        likes: '412',
        category: 'Wedding',
      },
      {
        id: 'gal-3',
        image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80',
        tag: '#CelebrationCakes',
        likes: '195',
        category: 'Birthday Cakes',
      },
      {
        id: 'gal-4',
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
        tag: '#CustomCakes',
        likes: '284',
        category: 'Custom Cakes',
      },
      {
        id: 'gal-5',
        image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
        tag: '#BirthdayCakes',
        likes: '310',
        category: 'Birthday Cakes',
      },
      {
        id: 'gal-6',
        image: '/og-logo.png',
        tag: '#CorporateGifting',
        likes: '162',
        category: 'Corporate',
      },
    ],
  },
  budgetSection: DEFAULT_BUDGET_SECTION,
  customPage: {
    badge: 'Bespoke Cake Consultations',
    headline: 'Design Your Custom Cake',
    subtitle: 'Have a specific theme, photo, Pinterest moodboard, or dream wedding cake in mind? Complete the form below and continue seamlessly on WhatsApp for instant quote approval.',
    flavors: [
      'Rich Chocolate Ganache',
      'Velvet Red Velvet',
      'Madagascar Vanilla Buttercream',
      'Fresh Strawberry Cream',
      'Toasted Coconut & Vanilla',
      'Spiced Carrot & Walnut',
      'Marble Swirl (Choc + Vanilla)',
      'Lemon Berry Drizzle',
      'Caramel Biscoff Crunch',
      'Lotus Biscoff & Salted Caramel',
      'Ferrero Rocher & Hazelnut',
      'Different flavour per tier',
    ],
    colorPalettes: [
      // 1 COLOR PALETTES (Single Tone Elegance)
      {
        id: 'pal-1-white',
        name: 'Pure Pristine White',
        colors: ['#FFFFFF'],
        type: '1-color',
        description: 'Timeless monochrome wedding, holy communion, crisp purity',
      },
      {
        id: 'pal-1-gold',
        name: 'Royal 24K Gold',
        colors: ['#EAB308'],
        type: '1-color',
        description: 'Opulent regal celebration, gold leaf, jubilee milestone',
      },
      {
        id: 'pal-1-pink',
        name: 'Sweet Blush Pink',
        colors: ['#F472B6'],
        type: '1-color',
        description: 'Soft romantic monochrome, baby girl celebration, sweet romance',
      },
      {
        id: 'pal-1-burgundy',
        name: 'Velvet Burgundy',
        colors: ['#881337'],
        type: '1-color',
        description: 'Deep moody wine monochrome, sultry elegance, dramatic anniversary',
      },
      {
        id: 'pal-1-black',
        name: 'Midnight Onyx Black',
        colors: ['#18181B'],
        type: '1-color',
        description: 'Ultra-modern black velvet, gothic luxury, masculine chic',
      },
      {
        id: 'pal-1-sage',
        name: 'Sage Botanical',
        colors: ['#84A98C'],
        type: '1-color',
        description: 'Clean organic botanical, rustic olive, gentle earthy green',
      },

      // 2 COLORS PALETTES (Dual Tone Harmony)
      {
        id: 'pal-2-pink-gold',
        name: 'Blush Pink & Royal Gold',
        colors: ['#F472B6', '#EAB308'],
        type: '2-color',
        description: 'Romantic floral celebration with glistening gold accents',
      },
      {
        id: 'pal-2-white-silver',
        name: 'Classic White & Pearl Silver',
        colors: ['#FFFFFF', '#CBD5E1'],
        type: '2-color',
        description: 'Timeless crisp white with delicate silver sheen',
      },
      {
        id: 'pal-2-navy-gold',
        name: 'Midnight Navy & 24K Gold',
        colors: ['#0F172A', '#EAB308'],
        type: '2-color',
        description: 'Sleek gentleman birthday, corporate gala, modern luxury',
      },
      {
        id: 'pal-2-emerald-gold',
        name: 'Emerald Green & Luxury Gold',
        colors: ['#064E3B', '#EAB308'],
        type: '2-color',
        description: 'Opulent traditional wedding, rich African royalty, jubilee',
      },
      {
        id: 'pal-2-burgundy-rose',
        name: 'Deep Burgundy & Dusty Rose',
        colors: ['#881337', '#FB7185'],
        type: '2-color',
        description: 'Moody romance, autumn & winter wedding, heartfelt anniversary',
      },
      {
        id: 'pal-2-sage-ivory',
        name: 'Sage Green & Warm Ivory',
        colors: ['#84A98C', '#FDFBF7'],
        type: '2-color',
        description: 'Botanical rustic chic, outdoor garden party, earthy serenity',
      },
      {
        id: 'pal-2-lavender-lilac',
        name: 'Lavender Dream & Soft Lilac',
        colors: ['#7C3AED', '#DDD6FE'],
        type: '2-color',
        description: 'Whimsical garden theme, sweet sixteen, floral blooms',
      },
      {
        id: 'pal-2-terracotta-peach',
        name: 'Terracotta & Warm Peach',
        colors: ['#C2410C', '#FDBA74'],
        type: '2-color',
        description: 'Boho chic desert sunset, earthy warmth, sunset party',
      },
      {
        id: 'pal-2-baby-blue-white',
        name: 'Baby Blue & Cloud White',
        colors: ['#60A5FA', '#FFFFFF'],
        type: '2-color',
        description: 'Baby shower, pastel sky theme, clean innocent charm',
      },

      // 3 COLORS PALETTES (Tri-Tone Artisan Trio)
      {
        id: 'pal-3-pink-coral-gold',
        name: 'Blush Pink, Coral & Royal Gold',
        colors: ['#F472B6', '#FB7185', '#EAB308'],
        type: '3-color',
        description: 'Glamorous garden soirée, multi-dimensional romance',
      },
      {
        id: 'pal-3-emerald-mint-gold',
        name: 'Emerald, Mint & Champagne Gold',
        colors: ['#064E3B', '#34D399', '#EAB308'],
        type: '3-color',
        description: 'Lush botanical splendor, rich emerald depth with gold shimmer',
      },
      {
        id: 'pal-3-navy-sky-silver',
        name: 'Midnight Navy, Sky Blue & Silver',
        colors: ['#0F172A', '#38BDF8', '#E2E8F0'],
        type: '3-color',
        description: 'Starlit midnight sky, galaxy glamour, executive luxury',
      },
      {
        id: 'pal-3-terracotta-coral-ivory',
        name: 'Terracotta, Coral & Warm Ivory',
        colors: ['#C2410C', '#FB923C', '#FDFBF7'],
        type: '3-color',
        description: 'Warm sunset boho palette, dried floral aesthetic',
      },
      {
        id: 'pal-3-burgundy-rose-cream',
        name: 'Burgundy, Rose Gold & Cream',
        colors: ['#881337', '#FB7185', '#FDFBF7'],
        type: '3-color',
        description: 'Vintage velvet grandeur, sophisticated evening soirée',
      },
      {
        id: 'pal-3-purple-lilac-white',
        name: 'Royal Purple, Lilac & Pearl White',
        colors: ['#581C87', '#C084FC', '#FFFFFF'],
        type: '3-color',
        description: 'Regal amethyst fantasy, opulent royal celebration',
      },
      {
        id: 'pal-3-chocolate-caramel-cream',
        name: 'Chocolate Mocha, Caramel & Cream',
        colors: ['#3E2723', '#D97706', '#FDFBF7'],
        type: '3-color',
        description: 'Decadent foodie tones, salted caramel drizzles',
      },
      {
        id: 'pal-3-tiffany-mint-white',
        name: 'Tiffany Aqua, Mint & Pure White',
        colors: ['#0D9488', '#2DD4BF', '#FFFFFF'],
        type: '3-color',
        description: 'Ocean breeze sparkle, fresh Caribbean luxury',
      },
      {
        id: 'pal-3-pastel-rainbow',
        name: 'Pastel Rainbow Trio (Pink, Lemon, Mint)',
        colors: ['#F472B6', '#FDE047', '#86EFAC'],
        type: '3-color',
        description: 'Sweet cheerful celebration, joyful confectionery carnival',
      },
    ],
  },
};

export const DEFAULT_CUSTOM_FLAVORS: string[] = DEFAULT_SITE_CONTENT.customPage!.flavors;
export const DEFAULT_COLOR_PALETTES: CustomColorPalette[] = DEFAULT_SITE_CONTENT.customPage!.colorPalettes!;
export const DEFAULT_CUSTOM_PAGE_CONFIG: CustomPageConfig = DEFAULT_SITE_CONTENT.customPage!;

export interface CakeSwatchTone {
  name: string;
  hex: string;
  category: string;
}

export const POPULAR_CAKE_SWATCH_COLORS: CakeSwatchTone[] = [
  // Metallics & Luxuries
  { name: 'Royal 24K Gold', hex: '#EAB308', category: 'Metallics & Luxury' },
  { name: 'Rose Gold Shimmer', hex: '#FB7185', category: 'Metallics & Luxury' },
  { name: 'Champagne Gold', hex: '#E7D7C1', category: 'Metallics & Luxury' },
  { name: 'Silver Slate / Pearl', hex: '#94A3B8', category: 'Metallics & Luxury' },

  // Whites & Neutrals
  { name: 'Pure Pristine White', hex: '#FFFFFF', category: 'Whites & Neutrals' },
  { name: 'Warm Ivory Cream', hex: '#FDFBF7', category: 'Whites & Neutrals' },
  { name: 'Alabaster Biscuit', hex: '#F5F5F0', category: 'Whites & Neutrals' },
  { name: 'Midnight Onyx Black', hex: '#18181B', category: 'Whites & Neutrals' },

  // Pinks & Reds
  { name: 'Sweet Blush Pink', hex: '#F472B6', category: 'Pinks & Reds' },
  { name: 'Dusty Rose Petal', hex: '#FDA4AF', category: 'Pinks & Reds' },
  { name: 'Hot Vibrant Pink', hex: '#EC4899', category: 'Pinks & Reds' },
  { name: 'Velvet Burgundy Wine', hex: '#881337', category: 'Pinks & Reds' },
  { name: 'Ruby Crimson Red', hex: '#DC2626', category: 'Pinks & Reds' },

  // Earth, Sunset & Peach
  { name: 'Terracotta Rust', hex: '#C2410C', category: 'Warm Sunsets' },
  { name: 'Sunset Coral', hex: '#FB923C', category: 'Warm Sunsets' },
  { name: 'Warm Apricot Peach', hex: '#FDBA74', category: 'Warm Sunsets' },

  // Greens & Teals
  { name: 'Sage Botanical Green', hex: '#84A98C', category: 'Greens & Teals' },
  { name: 'Forest Emerald Green', hex: '#064E3B', category: 'Greens & Teals' },
  { name: 'Fresh Mint Green', hex: '#34D399', category: 'Greens & Teals' },
  { name: 'Tiffany Turquoise Teal', hex: '#0D9488', category: 'Greens & Teals' },

  // Blues
  { name: 'Pastel Sky Blue', hex: '#38BDF8', category: 'Blues' },
  { name: 'Baby Boy Blue', hex: '#60A5FA', category: 'Blues' },
  { name: 'Midnight Royal Navy', hex: '#0F172A', category: 'Blues' },

  // Purples & Lilacs
  { name: 'Soft Lilac Blossom', hex: '#C084FC', category: 'Purples & Lilacs' },
  { name: 'Lavender Dream', hex: '#DDD6FE', category: 'Purples & Lilacs' },
  { name: 'Royal Violet Purple', hex: '#7C3AED', category: 'Purples & Lilacs' },
  { name: 'Deep Royal Plum', hex: '#581C87', category: 'Purples & Lilacs' },

  // Gourmet Sweets & Choc
  { name: 'Chocolate Mocha Brown', hex: '#3E2723', category: 'Gourmet Chocolates' },
  { name: 'Salted Caramel Amber', hex: '#D97706', category: 'Gourmet Chocolates' },
];
