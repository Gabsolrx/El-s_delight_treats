import React, { useState } from 'react';
import { Send, CheckCircle2, Calendar, Layers, DollarSign, ShieldCheck, Building, User, Hash, ArrowRight, AlertCircle, Truck, Store, Check, Plus, Minus, X, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CustomCakeFormData, DeliveryMethodOption, StoredOrder } from '../types';
import { generateCustomCakeWhatsAppUrl, formatNaira } from '../utils/format';
import { useApp } from '../context/AppContext';
import { CopyAccountButton } from './CopyAccountButton';
import { DEFAULT_DELIVERY_METHODS, DEFAULT_CUSTOM_FLAVORS, DEFAULT_COLOR_PALETTES, POPULAR_CAKE_SWATCH_COLORS } from '../data/defaultSiteContent';

export const CustomCakeForm: React.FC = () => {
  const { showToast, addCustomInquiry, businessInfo, saveOrder, setCurrentOrder, siteContent } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [hasMadePayment, setHasMadePayment] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(20000);
  const [customDepositInput, setCustomDepositInput] = useState('');
  const [paletteColorCount, setPaletteColorCount] = useState<'all' | '1' | '2' | '3'>('all');
  const [customColorMode, setCustomColorMode] = useState<1 | 2 | 3>(2);
  const [customColor1, setCustomColor1] = useState('#F472B6');
  const [customColor2, setCustomColor2] = useState('#EAB308');
  const [customColor3, setCustomColor3] = useState('#064E3B');

  const customConfig = siteContent?.customPage;
  const availableFlavors =
    customConfig?.flavors && customConfig.flavors.length > 0
      ? customConfig.flavors
      : DEFAULT_CUSTOM_FLAVORS;
  const rawPalettes =
    customConfig?.colorPalettes && customConfig.colorPalettes.length > 0
      ? customConfig.colorPalettes
      : DEFAULT_COLOR_PALETTES;

  const availablePalettes = rawPalettes.map((p) => ({
    ...p,
    colors: (p.colors && p.colors.length > 0) ? p.colors.slice(0, 3) : ['#EAB308'],
  }));

  const deliveryMethods: DeliveryMethodOption[] =
    businessInfo.deliveryMethods && businessInfo.deliveryMethods.length > 0
      ? businessInfo.deliveryMethods
      : DEFAULT_DELIVERY_METHODS;

  const enabledDeliveryMethods = deliveryMethods.filter((m) => m.enabled !== false);

  const [formData, setFormData] = useState<CustomCakeFormData>({
    fullName: '',
    phone: '',
    email: '',
    occasion: 'Birthday Celebration',
    cakeSize: '8 inch (12–16 servings)',
    flavour: availableFlavors[0] || 'Rich Chocolate Ganache',
    colourTheme: availablePalettes[0]?.name || 'Blush Pink & Royal Gold',
    themeDescription: '',
    tiers: '1 Tier',
    cakeMessage: '',
    budgetRange: '₦20,000 – ₦40,000',
    preferredDate: '',
    deliveryType: 'delivery',
    deliveryMethod: enabledDeliveryMethods[0]?.name || 'Uber Package / Uber Delivery',
    deliveryArea: 'Amuwo-Odofin / Festac',
    specialInstructions: '',
    referenceUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const effectiveDeposit = customDepositInput ? Number(customDepositInput) || depositAmount : depositAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.preferredDate) {
      showToast('Please fill all required fields', 'Full name, phone, and preferred date are needed.', 'error');
      return;
    }

    addCustomInquiry(formData);
    setSubmitted(true);
    showToast('Custom Cake Request Prepared!', 'Follow payment instructions or continue on WhatsApp for confirmation.', 'success', true);
  };

  const generatePaymentWhatsAppUrl = () => {
    const lines = [
      `*CUSTOM CAKE ORDER & DIRECT PAYMENT MADE*`,
      `Customer: ${formData.fullName} (${formData.phone})`,
      `Occasion: ${formData.occasion}`,
      `Size & Tiers: ${formData.cakeSize} (${formData.tiers})`,
      `Flavour: ${formData.flavour}`,
      `Color Theme: ${formData.colourTheme}`,
      formData.themeDescription ? `Theme Details: "${formData.themeDescription}"` : null,
      formData.cakeMessage ? `Cake Inscription: "${formData.cakeMessage}"` : null,
      `Target Delivery Date: ${formData.preferredDate}`,
      `Location: ${formData.deliveryArea} (${formData.deliveryType === 'pickup' ? 'Bakery Pickup' : 'Lagos Delivery'})`,
      formData.referenceUrl ? `Inspiration Reference: ${formData.referenceUrl}` : null,
      `\n*BANK PAYMENT DETAILS*`,
      `Bank: ${businessInfo.payment.bank}`,
      `Account: ${businessInfo.payment.accountNumber} (${businessInfo.payment.accountName})`,
      `Amount Transferred: ${formatNaira(effectiveDeposit)}`,
      `\nHello El's Delight Treats, I have filled the custom cake order form and transferred ${formatNaira(effectiveDeposit)} to your ${businessInfo.payment.bank} account. Please verify my payment and confirm design feasibility!`,
    ].filter(Boolean);

    return `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handlePaymentMade = () => {
    const orderId = `ELD-CC-${Date.now().toString().slice(-6)}`;
    const customOrder: StoredOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `custom-cake-${Date.now()}`,
          productId: 'custom-cake-inquiry',
          product: {
            id: 'custom-cake-inquiry',
            name: `Custom Cake (${formData.occasion || 'Celebration'})`,
            slug: 'custom-bespoke-cake',
            category: 'Custom Cakes',
            price: effectiveDeposit,
            description: `Bespoke artisan cake: ${formData.cakeSize}, ${formData.flavour}, ${formData.tiers}. Color Theme: ${formData.colourTheme || 'Custom'}.`,
            images: formData.referenceUrl ? [formData.referenceUrl] : ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80'],
            flavours: [formData.flavour as any],
            sizes: [{ name: formData.cakeSize, label: formData.cakeSize, priceModifier: 1, isBase: true }],
            occasion: [formData.occasion as any],
            bestseller: false,
            featured: false,
            rating: 5.0,
            reviewCount: 1,
            budgetRange: '₦20,000–₦40,000',
            preparationTime: '24-48 hours notice',
          },
          selectedSize: { name: formData.cakeSize, label: formData.cakeSize, priceModifier: 1, isBase: true },
          selectedFlavour: formData.flavour as any,
          cakeMessage: formData.cakeMessage || '',
          specialInstructions: `Tiers: ${formData.tiers}. Color Theme: ${formData.colourTheme}. Theme Details: ${formData.themeDescription || 'N/A'}. Reference: ${formData.referenceUrl || 'None'}. Special: ${formData.specialInstructions || 'None'}`,
          quantity: 1,
          unitPrice: effectiveDeposit,
        },
      ],
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || '',
        fulfillmentType: formData.deliveryType === 'pickup' ? 'pickup' : 'delivery',
        deliveryMethod: formData.deliveryType === 'pickup' ? 'Bakery Studio Pickup (Lakeview Phase 1, Amuwo-Odofin)' : (formData.deliveryMethod || 'Lagos Delivery Dispatch'),
        deliveryDate: formData.preferredDate,
        deliveryTime: 'Morning (9am - 1pm)',
        address: formData.deliveryType === 'pickup'
          ? (businessInfo.pickupNote || 'Lakeview Phase 1, Amuwo-Odofin, Lagos')
          : (formData.deliveryArea || 'Lagos Delivery Address'),
        area: formData.deliveryArea,
        specialInstructions: `Occasion: ${formData.occasion}. Color Theme: ${formData.colourTheme}. Theme Details: ${formData.themeDescription || ''}. Inscription: ${formData.cakeMessage || ''}. Reference: ${formData.referenceUrl || ''}. ${formData.specialInstructions || ''}`,
      },
      subtotal: effectiveDeposit,
      deliveryFee: 0,
      total: effectiveDeposit,
      status: 'pending_payment_verification',
      adminNotes: `Custom cake direct transfer payment of ${formatNaira(effectiveDeposit)} to Stanbic IBTC. Inscription: "${formData.cakeMessage || ''}". Preferred date: ${formData.preferredDate}.`,
    };

    saveOrder(customOrder);
    setCurrentOrder(customOrder);
    setHasMadePayment(true);

    const waUrl = generatePaymentWhatsAppUrl();
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Order & Payment Recorded! 🎉', 'Your custom cake order was submitted successfully to our kitchen.');
  };

  const whatsappUrl = generateCustomCakeWhatsAppUrl(formData, businessInfo.whatsappUrlNumber);

  return (
    <div className="bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-rose-950/60 shadow-xl p-6 sm:p-10">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-rose-100 dark:border-stone-800 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
              Bespoke Artisan Studio
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Your Idea. Our Craft.
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
              Tell us what you're imagining and we'll help turn your idea into a beautiful cake.
            </p>
          </div>

          {/* Section 1: Customer Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Chinwe Okafor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 08012345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. chinwe@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Section 2: Cake Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                1. Occasion
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="White / Traditional Wedding">White / Traditional Wedding</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Baby Shower / Gender Reveal">Baby Shower / Gender Reveal</option>
                <option value="Graduation / Convocation">Graduation / Convocation</option>
                <option value="Corporate / Company Event">Corporate / Company Event</option>
                <option value="Romantic / Surprise Gift">Romantic / Surprise Gift</option>
                <option value="Church Event / Pastor's Birthday">Church Event / Pastor's Birthday</option>
                <option value="Other Milestone">Other Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                2. Cake Size / Feeds
              </label>
              <select
                name="cakeSize"
                value={formData.cakeSize}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="6 inch (6–8 servings)">6 inch (6–8 servings)</option>
                <option value="8 inch (12–16 servings)">8 inch (12–16 servings)</option>
                <option value="10 inch (20–25 servings)">10 inch (20–25 servings)</option>
                <option value="12 inch (30–35 servings)">12 inch (30–35 servings)</option>
                <option value="Double Barrel Extra Height">Double Barrel Extra Height</option>
                <option value="Grand Event Sheet Cake">Grand Event Sheet Cake (50+ servings)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  3. Preferred Flavour *
                </label>
                <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                  {availableFlavors.length} flavours available
                </span>
              </div>
              <select
                name="flavour"
                value={formData.flavour}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              >
                {availableFlavors.map((flavorOption) => (
                  <option key={flavorOption} value={flavorOption}>
                    {flavorOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Visual Color Palette Picker & Custom Color Input */}
          <div className="space-y-4 pt-3 border-t border-rose-100/70 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
                  4. Celebration Colour Palette & Theme *
                </label>
                <p className="text-[11px] text-stone-500">
                  Select your desired 1-color, 2-colors, or 3-colors palette from the dropdown, pick a visual card, or customize your own colors below.
                </p>
              </div>

              {formData.colourTheme && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-900 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="max-w-[200px] sm:max-w-xs truncate">Selected: {formData.colourTheme}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, colourTheme: '' }))}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* A. DROPDOWN SELECTOR: Choose from Many Color Palettes */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-stone-50/60 dark:from-stone-900 dark:to-stone-800 border border-pink-100 dark:border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Select Color Palette from Dropdown ({availablePalettes.length} palettes available):
                </label>
                <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400">
                  1, 2, or 3 Colors
                </span>
              </div>

              <select
                value={
                  availablePalettes.some((p) => p.name.trim().toLowerCase() === formData.colourTheme.trim().toLowerCase())
                    ? availablePalettes.find((p) => p.name.trim().toLowerCase() === formData.colourTheme.trim().toLowerCase())?.id || ''
                    : ''
                }
                onChange={(e) => {
                  const pal = availablePalettes.find((p) => p.id === e.target.value);
                  if (pal) {
                    setFormData((prev) => ({ ...prev, colourTheme: pal.name }));
                    // Also sync the custom color slots with this palette's colors for preview/editing
                    if (pal.colors.length >= 1) setCustomColor1(pal.colors[0]);
                    if (pal.colors.length >= 2) setCustomColor2(pal.colors[1]);
                    if (pal.colors.length >= 3) setCustomColor3(pal.colors[2]);
                    setCustomColorMode((pal.colors.length === 1 ? 1 : pal.colors.length === 3 ? 3 : 2) as 1 | 2 | 3);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-2xs cursor-pointer"
              >
                <option value="">-- Select a Color Palette (1, 2, or 3 Colors) --</option>
                
                <optgroup label="1-Color Palettes (Single-Tone)">
                  {availablePalettes
                    .filter((p) => p.colors.length === 1)
                    .map((pal) => (
                      <option key={pal.id} value={pal.id}>
                        {pal.name} (1 Color: {pal.colors.join(', ')})
                      </option>
                    ))}
                </optgroup>

                <optgroup label="2-Colors Palettes (Dual-Tone)">
                  {availablePalettes
                    .filter((p) => p.colors.length === 2)
                    .map((pal) => (
                      <option key={pal.id} value={pal.id}>
                        {pal.name} (2 Colors: {pal.colors.join(', ')})
                      </option>
                    ))}
                </optgroup>

                <optgroup label="3-Colors Palettes (Tri-Tone)">
                  {availablePalettes
                    .filter((p) => p.colors.length === 3)
                    .map((pal) => (
                      <option key={pal.id} value={pal.id}>
                        {pal.name} (3 Colors: {pal.colors.join(', ')})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* B. Color Palette Type Filter Ribbon (All, 1 Color, 2 Colors, 3 Colors) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60">
                <button
                  type="button"
                  onClick={() => setPaletteColorCount('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    paletteColorCount === 'all'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  All Palettes ({availablePalettes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteColorCount('1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    paletteColorCount === '1'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                  <span>1 Color ({availablePalettes.filter((p) => p.colors.length === 1).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteColorCount('2')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    paletteColorCount === '2'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <div className="flex w-3.5 h-2.5 rounded-xs overflow-hidden border border-black/10 shrink-0">
                    <span className="w-1/2 h-full bg-pink-400" />
                    <span className="w-1/2 h-full bg-amber-400" />
                  </div>
                  <span>2 Colors ({availablePalettes.filter((p) => p.colors.length === 2).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteColorCount('3')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    paletteColorCount === '3'
                      ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <div className="flex w-4 h-2.5 rounded-xs overflow-hidden border border-black/10 shrink-0">
                    <span className="w-1/3 h-full bg-pink-400" />
                    <span className="w-1/3 h-full bg-amber-400" />
                    <span className="w-1/3 h-full bg-emerald-400" />
                  </div>
                  <span>3 Colors ({availablePalettes.filter((p) => p.colors.length === 3).length})</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Click any card to select
              </span>
            </div>

            {/* C. Visual Palettes Grid (Filtered by 1, 2, or 3 Colors) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1.5 bg-stone-50/50 dark:bg-stone-900/40 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              {availablePalettes
                .filter((p) => {
                  if (paletteColorCount === '1') return p.colors.length === 1;
                  if (paletteColorCount === '2') return p.colors.length === 2;
                  if (paletteColorCount === '3') return p.colors.length === 3;
                  return true;
                })
                .map((palette) => {
                  const isSelected = formData.colourTheme.trim().toLowerCase() === palette.name.trim().toLowerCase();
                  const colorCount = palette.colors.length;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, colourTheme: palette.name }));
                        if (palette.colors.length >= 1) setCustomColor1(palette.colors[0]);
                        if (palette.colors.length >= 2) setCustomColor2(palette.colors[1]);
                        if (palette.colors.length >= 3) setCustomColor3(palette.colors[2]);
                        setCustomColorMode((palette.colors.length === 1 ? 1 : palette.colors.length === 3 ? 3 : 2) as 1 | 2 | 3);
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 ring-2 ring-pink-500/25 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1E24] hover:border-pink-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {/* Visual Color Swatch Preview Disk/Image (1 Color, 2 Colors, or 3 Colors) */}
                      <div className="relative shrink-0 w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 flex items-center justify-center border border-stone-200/80 dark:border-stone-700 shadow-2xs overflow-hidden">
                        {colorCount === 1 ? (
                          <div
                            style={{ backgroundColor: palette.colors[0] }}
                            className="w-full h-full rounded-lg border border-black/10 shadow-inner"
                            title={palette.colors[0]}
                          />
                        ) : colorCount === 2 ? (
                          <div className="flex w-full h-full rounded-lg overflow-hidden border border-black/10">
                            <div
                              style={{ backgroundColor: palette.colors[0] }}
                              className="w-1/2 h-full"
                              title={palette.colors[0]}
                            />
                            <div
                              style={{ backgroundColor: palette.colors[1] }}
                              className="w-1/2 h-full"
                              title={palette.colors[1]}
                            />
                          </div>
                        ) : (
                          <div className="flex w-full h-full rounded-lg overflow-hidden border border-black/10">
                            <div
                              style={{ backgroundColor: palette.colors[0] }}
                              className="w-1/3 h-full"
                              title={palette.colors[0]}
                            />
                            <div
                              style={{ backgroundColor: palette.colors[1] }}
                              className="w-1/3 h-full"
                              title={palette.colors[1]}
                            />
                            <div
                              style={{ backgroundColor: palette.colors[2] }}
                              className="w-1/3 h-full"
                              title={palette.colors[2]}
                            />
                          </div>
                        )}
                      </div>

                      {/* Palette Name, Tag & Info beside it */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-pink-900 dark:text-pink-200' : 'text-stone-900 dark:text-stone-100'}`}>
                            {palette.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-pink-600 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {colorCount === 1 ? '1 Color' : colorCount === 2 ? '2 Colors' : '3 Colors'}
                          </span>
                          {palette.description && (
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                              {palette.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* D. CUSTOM PALETTE BUILDER: Select colors from dropdown & add colors */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1E24] border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Customize or Build Your Palette ({customColorMode} {customColorMode === 1 ? 'Color' : 'Colors'})
                  </h5>
                  <p className="text-[11px] text-stone-500">
                    Select each frosting color from the dropdown list of artisan tones or pick custom shades.
                  </p>
                </div>

                {/* Color Count Selector & Add/Remove Color Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-800">
                    {([1, 2, 3] as const).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setCustomColorMode(count)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          customColorMode === count
                            ? 'bg-pink-600 text-white shadow-2xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                      >
                        {count} {count === 1 ? 'Color' : 'Colors'}
                      </button>
                    ))}
                  </div>

                  {customColorMode < 3 && (
                    <button
                      type="button"
                      onClick={() => setCustomColorMode((prev) => Math.min(3, prev + 1) as 1 | 2 | 3)}
                      className="px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Add another color slot to palette"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Color</span>
                    </button>
                  )}

                  {customColorMode > 1 && (
                    <button
                      type="button"
                      onClick={() => setCustomColorMode((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-400 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Remove a color slot"
                    >
                      <Minus className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Slot Color Selectors with Dropdowns of Many Frosting Colors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Slot 1: Color 1 */}
                <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                      Color 1 (Primary Base)
                    </span>
                    <span className="text-[10px] font-mono uppercase font-semibold text-stone-500">
                      {customColor1}
                    </span>
                  </div>

                  {/* Dropdown for Color 1 */}
                  <select
                    value={
                      POPULAR_CAKE_SWATCH_COLORS.find(
                        (c) => c.hex.toLowerCase() === customColor1.toLowerCase()
                      )?.hex || ''
                    }
                    onChange={(e) => {
                      if (e.target.value) setCustomColor1(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">-- Select from Cake Colors Dropdown --</option>
                    {POPULAR_CAKE_SWATCH_COLORS.map((swatch) => (
                      <option key={`slot1-${swatch.name}`} value={swatch.hex}>
                        {swatch.name} ({swatch.hex})
                      </option>
                    ))}
                  </select>

                  {/* Color Picker & Custom Hex */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="color"
                      value={customColor1}
                      onChange={(e) => setCustomColor1(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-600 shrink-0"
                      title="Pick exact hex color"
                    />
                    <span className="text-[10px] text-stone-500">
                      Or use color picker
                    </span>
                  </div>
                </div>

                {/* Slot 2: Color 2 (Shown if 2 or 3 colors) */}
                {customColorMode >= 2 && (
                  <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                        Color 2 (Secondary)
                      </span>
                      <span className="text-[10px] font-mono uppercase font-semibold text-stone-500">
                        {customColor2}
                      </span>
                    </div>

                    {/* Dropdown for Color 2 */}
                    <select
                      value={
                        POPULAR_CAKE_SWATCH_COLORS.find(
                          (c) => c.hex.toLowerCase() === customColor2.toLowerCase()
                        )?.hex || ''
                      }
                      onChange={(e) => {
                        if (e.target.value) setCustomColor2(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">-- Select from Cake Colors Dropdown --</option>
                      {POPULAR_CAKE_SWATCH_COLORS.map((swatch) => (
                        <option key={`slot2-${swatch.name}`} value={swatch.hex}>
                          {swatch.name} ({swatch.hex})
                        </option>
                      ))}
                    </select>

                    {/* Color Picker & Custom Hex */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="color"
                        value={customColor2}
                        onChange={(e) => setCustomColor2(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-600 shrink-0"
                        title="Pick exact hex color"
                      />
                      <span className="text-[10px] text-stone-500">
                        Or use color picker
                      </span>
                    </div>
                  </div>
                )}

                {/* Slot 3: Color 3 (Shown if 3 colors) */}
                {customColorMode >= 3 && (
                  <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                        Color 3 (Accent)
                      </span>
                      <span className="text-[10px] font-mono uppercase font-semibold text-stone-500">
                        {customColor3}
                      </span>
                    </div>

                    {/* Dropdown for Color 3 */}
                    <select
                      value={
                        POPULAR_CAKE_SWATCH_COLORS.find(
                          (c) => c.hex.toLowerCase() === customColor3.toLowerCase()
                        )?.hex || ''
                      }
                      onChange={(e) => {
                        if (e.target.value) setCustomColor3(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">-- Select from Cake Colors Dropdown --</option>
                      {POPULAR_CAKE_SWATCH_COLORS.map((swatch) => (
                        <option key={`slot3-${swatch.name}`} value={swatch.hex}>
                          {swatch.name} ({swatch.hex})
                        </option>
                      ))}
                    </select>

                    {/* Color Picker & Custom Hex */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="color"
                        value={customColor3}
                        onChange={(e) => setCustomColor3(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-600 shrink-0"
                        title="Pick exact hex color"
                      />
                      <span className="text-[10px] text-stone-500">
                        Or use color picker
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Frosting Swatch Dots for instant tap */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  Quick tap to set Color 1 ({POPULAR_CAKE_SWATCH_COLORS.length} artisan frosting tones):
                </span>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-700/60 max-h-20 overflow-y-auto">
                  {POPULAR_CAKE_SWATCH_COLORS.map((swatch) => (
                    <button
                      key={`quick-${swatch.name}`}
                      type="button"
                      onClick={() => setCustomColor1(swatch.hex)}
                      style={{ backgroundColor: swatch.hex }}
                      className="w-5 h-5 rounded-md border border-black/15 dark:border-white/20 shadow-2xs hover:scale-110 transition-transform shrink-0"
                      title={`${swatch.name} (${swatch.hex})`}
                    />
                  ))}
                </div>
              </div>

              {/* Live Preview Bar & Apply Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex border border-black/15 dark:border-white/20 shadow-2xs shrink-0">
                    <div style={{ backgroundColor: customColor1 }} className="flex-1 h-full" title={customColor1} />
                    {customColorMode >= 2 && (
                      <div style={{ backgroundColor: customColor2 }} className="flex-1 h-full" title={customColor2} />
                    )}
                    {customColorMode >= 3 && (
                      <div style={{ backgroundColor: customColor3 }} className="flex-1 h-full" title={customColor3} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {customColorMode}-Color Custom Palette
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      {customColor1}
                      {customColorMode >= 2 ? ` • ${customColor2}` : ''}
                      {customColorMode >= 3 ? ` • ${customColor3}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const findName = (hex: string) =>
                      POPULAR_CAKE_SWATCH_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name;
                    const c1Name = findName(customColor1);
                    const c2Name = findName(customColor2);
                    const c3Name = findName(customColor3);

                    let label = '';
                    if (customColorMode === 1) {
                      label = c1Name ? `${c1Name} (${customColor1})` : `Custom 1-Color (${customColor1})`;
                    } else if (customColorMode === 2) {
                      const n1 = c1Name || customColor1;
                      const n2 = c2Name || customColor2;
                      label = `${n1} & ${n2}`;
                    } else {
                      const n1 = c1Name || customColor1;
                      const n2 = c2Name || customColor2;
                      const n3 = c3Name || customColor3;
                      label = `${n1}, ${n2} & ${n3}`;
                    }
                    setFormData((prev) => ({ ...prev, colourTheme: label }));
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
                >
                  Apply {customColorMode}-Color Custom Palette
                </button>
              </div>

              {/* Freeform Description Input */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Or specify custom finish / tone details (e.g. Ombre fade, gold leaf, marble effect):
                </label>
                <input
                  type="text"
                  name="colourTheme"
                  value={formData.colourTheme}
                  onChange={handleChange}
                  placeholder="e.g. Sage green & warm ivory with delicate edible 24K gold foil flakes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                5. Number of Tiers
              </label>
              <select
                name="tiers"
                value={formData.tiers}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="1 Tier (Single Cake)">1 Tier (Single Cake)</option>
                <option value="2 Tiers">2 Tiers</option>
                <option value="3 Tiers (Grand Luxury)">3 Tiers (Grand Luxury)</option>
                <option value="4+ Tiers (Royal Wedding)">4+ Tiers (Royal Wedding)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                6. Estimated Budget
              </label>
              <select
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Under ₦15,000">Under ₦15,000</option>
                <option value="₦15,000 – ₦30,000">₦15,000 – ₦30,000</option>
                <option value="₦30,000 – ₦60,000">₦30,000 – ₦60,000</option>
                <option value="₦60,000 – ₦100,000">₦60,000 – ₦100,000</option>
                <option value="₦100,000 – ₦200,000+">₦100,000 – ₦200,000+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                7. Preferred Event / Delivery Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                required
                value={formData.preferredDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                8. Select Delivery Method in Nigeria *
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={(e) => {
                  const val = e.target.value;
                  const isStorePickup = val.toLowerCase().includes('pickup') || val.toLowerCase().includes('driver');
                  setFormData((prev) => ({
                    ...prev,
                    deliveryMethod: val,
                    deliveryType: isStorePickup ? 'pickup' : 'delivery',
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {enabledDeliveryMethods.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.pricingNote})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery policy instruction callout */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-300">
                Delivery Fee Notice (Pay on Delivery)
              </p>
              <p className="mt-0.5 leading-relaxed">
                {businessInfo.deliveryPolicyNotice ||
                  "Delivery fee is NOT added to the cake payment. Customers pay on delivery directly to courier based on Uber/rider live rate (or self-pickup for free from our Amuwo-Odofin studio)."}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Destination Address / Lagos Area (or Pickup Notes)
            </label>
            <input
              type="text"
              name="deliveryArea"
              value={formData.deliveryArea}
              onChange={handleChange}
              placeholder="e.g. Lekki Phase 1, Ikeja, Festac, or Studio Pickup"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Cake Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              9. Cake Message / Inscription
            </label>
            <input
              type="text"
              name="cakeMessage"
              value={formData.cakeMessage}
              onChange={handleChange}
              placeholder="e.g. Happy 40th Birthday Dearest Dad! With Love from the Family"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Theme & Design Details */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              10. Theme & Special Instructions
            </label>
            <textarea
              name="themeDescription"
              rows={3}
              value={formData.themeDescription}
              onChange={handleChange}
              placeholder="Describe the aesthetic, theme, edible elements (e.g. vintage Lambeth frills, gold drip, florals, photo topper, character toys)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Inspiration Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                11. Inspiration Link
              </label>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                Optional
              </span>
            </div>
            <input
              type="text"
              name="referenceUrl"
              value={formData.referenceUrl}
              onChange={handleChange}
              placeholder="e.g. Pinterest, Instagram, or Drive link (or leave blank and share photos on WhatsApp)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Not compulsory. You can submit without a link and send reference photos directly on WhatsApp.
            </p>
          </div>

          {/* Optional Direct Bank Transfer Deposit Section (FAQ Mode) */}
          <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-stone-900/80 border border-rose-200/80 dark:border-rose-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400 block">
                  Bank Transfer & Booking Deposit
                </span>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Lock in your event date with a direct Stanbic IBTC bank transfer
                </p>
              </div>
              <span className="text-[11px] text-stone-500 bg-white dark:bg-stone-950 px-2.5 py-1 rounded-full border border-rose-200 dark:border-stone-800 shrink-0 self-start sm:self-auto font-medium">
                Standard / Custom Deposit
              </span>
            </div>

            {/* Stanbic IBTC Account Details Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-950 border border-rose-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Bank</span>
                  <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{businessInfo.payment.bank}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Account Name</span>
                  <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{businessInfo.payment.accountName}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5 overflow-hidden">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400">Account Number</span>
                  <p className="text-xl sm:text-2xl font-mono font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                    {businessInfo.payment.accountNumber}
                  </p>
                </div>
                <CopyAccountButton
                  accountNumber={businessInfo.payment.accountNumber}
                  className="w-full sm:w-auto justify-center py-1.5 px-2.5 text-[10px] shrink-0"
                />
              </div>
            </div>

            {/* Deposit Amount Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Deposit / Payment Amount (₦ NGN):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[15000, 20000, 30000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDepositAmount(amt);
                      setCustomDepositInput('');
                    }}
                    className={`p-2.5 rounded-xl border font-bold transition-all ${
                      effectiveDeposit === amt && !customDepositInput
                        ? 'border-pink-600 bg-pink-50 dark:bg-rose-950/60 text-pink-700 dark:text-pink-300 ring-1 ring-pink-600'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    {formatNaira(amt)}
                  </button>
                ))}
              </div>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-xs text-stone-500 whitespace-nowrap">Or custom amount (₦):</span>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  placeholder="e.g. 25000"
                  value={customDepositInput}
                  onChange={(e) => setCustomDepositInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {/* Step Instructions */}
            <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-0.5">
              <p><strong>Step 1:</strong> Copy the Stanbic IBTC account number <span className="font-mono font-bold text-pink-600">0086485307</span>.</p>
              <p><strong>Step 2:</strong> Transfer your deposit of <strong className="tabular-nums font-bold text-stone-900 dark:text-stone-100">{formatNaira(effectiveDeposit)}</strong> via mobile banking or USSD.</p>
              <p><strong>Step 3:</strong> Submit your request below and click <strong>“PAYMENT MADE”</strong> to notify our lead baker on WhatsApp.</p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Custom Cake Request</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* Submitted state with Continue on WhatsApp and PAYMENT MADE buttons */
        <div className="py-8 text-center space-y-5">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Your Custom Cake Request is Ready!
          </h3>

          <p className="text-stone-600 dark:text-stone-300 text-sm max-w-lg mx-auto leading-relaxed">
            We have compiled all 11 customization details. Transfer your booking deposit to our Stanbic IBTC account and click below to open WhatsApp for instant confirmation.
          </p>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-stone-900/80 border border-rose-100 dark:border-stone-800 text-left max-w-md mx-auto text-xs space-y-1 text-stone-700 dark:text-stone-300">
            <p><strong>Customer:</strong> {formData.fullName} ({formData.phone})</p>
            <p><strong>Occasion:</strong> {formData.occasion}</p>
            <p><strong>Size:</strong> {formData.cakeSize} ({formData.tiers})</p>
            <p><strong>Flavour:</strong> {formData.flavour}</p>
            <p><strong>Target Date:</strong> {formData.preferredDate}</p>
            <p><strong>Delivery Location:</strong> {formData.deliveryArea}</p>
          </div>

          {/* Bank Account Verification Reminder Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-950 border-2 border-rose-200 dark:border-rose-900/60 max-w-md mx-auto text-left space-y-2 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 block">
              {businessInfo.payment.bank} Payment Account
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="min-w-0">
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">
                  {businessInfo.payment.accountName}
                </p>
                <p className="font-mono text-base font-bold text-stone-800 dark:text-stone-200">
                  {businessInfo.payment.accountNumber} ({businessInfo.payment.bank})
                </p>
              </div>
              <CopyAccountButton
                accountNumber={businessInfo.payment.accountNumber}
                className="w-full sm:w-auto justify-center py-1.5 px-2.5 text-[10px] shrink-0"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handlePaymentMade}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{hasMadePayment ? 'Payment Recorded! (Re-open WhatsApp)' : 'PAYMENT MADE (Confirm on WhatsApp)'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Continue on WhatsApp (Enquiry)</span>
            </a>

            <button
              onClick={() => setSubmitted(false)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
