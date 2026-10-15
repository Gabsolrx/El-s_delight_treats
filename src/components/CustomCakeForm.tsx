import React, { useState } from 'react';
import { Send, CheckCircle2, Calendar, Palette, Layers, DollarSign, ShieldCheck, Building, User, Hash, ArrowRight, AlertCircle, Truck, Store, Check } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CustomCakeFormData, DeliveryMethodOption, StoredOrder } from '../types';
import { generateCustomCakeWhatsAppUrl, formatNaira } from '../utils/format';
import { useApp } from '../context/AppContext';
import { CopyAccountButton } from './CopyAccountButton';
import { DEFAULT_DELIVERY_METHODS, DEFAULT_CUSTOM_FLAVORS, DEFAULT_COLOR_PALETTES } from '../data/defaultSiteContent';

export const CustomCakeForm: React.FC = () => {
  const { showToast, addCustomInquiry, businessInfo, saveOrder, setCurrentOrder, siteContent } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [hasMadePayment, setHasMadePayment] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(20000);
  const [customDepositInput, setCustomDepositInput] = useState('');

  const customConfig = siteContent?.customPage;
  const availableFlavors =
    customConfig?.flavors && customConfig.flavors.length > 0
      ? customConfig.flavors
      : DEFAULT_CUSTOM_FLAVORS;
  const availablePalettes =
    customConfig?.colorPalettes && customConfig.colorPalettes.length > 0
      ? customConfig.colorPalettes
      : DEFAULT_COLOR_PALETTES;

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
          <div className="space-y-3 pt-3 border-t border-rose-100/70 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
                  4. Celebration Colour Palette & Theme *
                </label>
                <p className="text-[11px] text-stone-500">
                  Select a curated palette below or type your dream color combination if you don't see it in the list.
                </p>
              </div>

              {formData.colourTheme && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-900 self-start sm:self-auto shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span>Selected: {formData.colourTheme}</span>
                </span>
              )}
            </div>

            {/* Visual Palettes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 bg-stone-50/50 dark:bg-stone-900/40 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              {availablePalettes.map((palette) => {
                const isSelected = formData.colourTheme.trim().toLowerCase() === palette.name.trim().toLowerCase();
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, colourTheme: palette.name }));
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 ring-2 ring-pink-500/25 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1E24] hover:border-pink-300 dark:hover:border-stone-700'
                    }`}
                  >
                    {/* Visual Color Swatch Preview Disk/Image */}
                    <div className="relative shrink-0 w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 flex items-center justify-center border border-stone-200/80 dark:border-stone-700 shadow-2xs">
                      <div className="grid grid-cols-2 gap-0.5 w-full h-full rounded-lg overflow-hidden">
                        {palette.colors.slice(0, 4).map((c, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: c }}
                            className="w-full h-full border border-black/5"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Palette Name & Info beside it */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-pink-900 dark:text-pink-200' : 'text-stone-900 dark:text-stone-100'}`}>
                          {palette.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-pink-600 shrink-0" />
                        )}
                      </div>
                      {palette.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {palette.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input for users who don't see their color in the palette */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1E24] border border-stone-200 dark:border-stone-800 space-y-2 shadow-2xs">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Can't see your color in the palette above? Type your custom color here:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="colourTheme"
                  value={formData.colourTheme}
                  onChange={handleChange}
                  placeholder="e.g. Sage green, dusty rose, burnt orange & gold leaf"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <label
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors shrink-0 shadow-2xs"
                  title="Choose exact custom color shade"
                >
                  <Palette className="w-4 h-4 text-pink-500" />
                  <span className="hidden sm:inline">Color Tool</span>
                  <input
                    type="color"
                    onChange={(e) => {
                      const hex = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        colourTheme: prev.colourTheme ? `${prev.colourTheme}, ${hex}` : hex,
                      }));
                    }}
                    className="w-0 h-0 opacity-0 absolute pointer-events-none"
                  />
                </label>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Type any custom tone, bridesmaid dress theme, or shade name — our bakers and cake artists will precisely blend matching fondant, ganache, and edible florals.
              </p>
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
