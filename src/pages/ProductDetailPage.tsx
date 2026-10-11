import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, Check, Truck, Clock, Share2, CreditCard, ChevronDown, Copy, X, Plus, Trash2, Building, User, Hash, AlertTriangle } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { Product, ProductSize, CakeFlavour, StoredOrder, DeliveryMethodOption } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, generateDirectProductWhatsAppUrl } from '../utils/format';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';
import { CopyAccountButton } from '../components/CopyAccountButton';
import { DEFAULT_DELIVERY_METHODS } from '../data/defaultSiteContent';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, businessInfo, addToCart, toggleWishlist, isWishlisted, addRecentlyViewed, recentlyViewedProducts, showToast, setCurrentOrder, saveOrder } = useApp();
  const [showPaymentGuide, setShowPaymentGuide] = useState(false);

  const product = products.find((p) => p.slug === slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(() => product?.sizes[0] || null);
  const [selectedFlavour, setSelectedFlavour] = useState<CakeFlavour | null>(() => product?.flavours[0] || null);
  const [cakeMessage, setCakeMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Delivery options for direct payment
  const deliveryMethods: DeliveryMethodOption[] =
    businessInfo.deliveryMethods && businessInfo.deliveryMethods.length > 0
      ? businessInfo.deliveryMethods
      : DEFAULT_DELIVERY_METHODS;

  const enabledDeliveryMethods = deliveryMethods.filter((m) => m.enabled !== false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    enabledDeliveryMethods[0]?.id || 'uber'
  );

  const activeDeliveryMethod =
    enabledDeliveryMethods.find((m) => m.id === selectedDeliveryId) ||
    enabledDeliveryMethods[0] ||
    DEFAULT_DELIVERY_METHODS[0];

  const isPickup = !!activeDeliveryMethod?.isPickup;

  // Direct Bank Transfer Payment Modal State (Following FAQ Instructions)
  const [isDirectPaymentOpen, setIsDirectPaymentOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      if (!selectedSize) setSelectedSize(product.sizes[0] || null);
      if (!selectedFlavour) setSelectedFlavour(product.flavours[0] || null);
      setSelectedImageIndex(0);
      setCakeMessage('');
      setSpecialInstructions('');
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product, slug]);

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-serif text-2xl font-bold">Cake Not Found</h2>
        <p className="text-stone-500 text-sm mt-2">The cake you are looking for does not exist or has been moved.</p>
        <Link to="/shop" className="mt-4 inline-block px-5 py-2.5 bg-pink-600 text-white rounded-xl text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentSize = selectedSize || product.sizes[0] || { name: 'Standard', label: 'Standard', priceModifier: 1 };
  const currentFlavour = selectedFlavour || product.flavours[0] || 'Vanilla Buttercream';

  const wishlisted = isWishlisted(product.id);
  const currentUnitPrice =
    currentSize.price !== undefined
      ? currentSize.price
      : Math.round(product.price * (currentSize.priceModifier || 1));
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleDirectPaymentMade = () => {
    if (!customerName.trim()) {
      showToast('Name Required', 'Please enter your full name before confirming payment.', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Phone Required', 'Please enter your WhatsApp contact phone number.', 'error');
      return;
    }

    const orderId = `ELS-${Date.now().toString().slice(-6)}`;
    const directOrder: StoredOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `${product.id}_${currentSize.label}_${currentFlavour}_${Date.now()}`,
          productId: product.id,
          product,
          selectedSize: currentSize,
          selectedFlavour: currentFlavour,
          cakeMessage: cakeMessage.trim(),
          specialInstructions: specialInstructions.trim(),
          quantity,
          unitPrice: currentUnitPrice,
        },
      ],
      customer: {
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        email: '',
        fulfillmentType: isPickup ? 'pickup' : 'delivery',
        deliveryMethod: activeDeliveryMethod.name,
        deliveryMethodId: activeDeliveryMethod.id,
        deliveryDate: 'As requested',
        deliveryTime: 'Flexible',
        address: deliveryAddress.trim() || (isPickup ? (businessInfo.pickupNote || 'Bakery Studio Pickup (Amuwo-Odofin)') : 'Lagos Delivery'),
        specialInstructions: specialInstructions.trim(),
      },
      subtotal: currentTotalPrice,
      deliveryFee: 0,
      total: currentTotalPrice,
      status: 'pending_payment_verification',
    };

    try {
      saveOrder(directOrder);
      setCurrentOrder(directOrder);
    } catch {}

    // Formatted WhatsApp message according to FAQ instructions
    const whatsappMsg = [
      `*DIRECT PAYMENT MADE - EL'S DELIGHT TREATS*`,
      `Order Reference: #${orderId}`,
      `Customer: ${customerName.trim()} (${customerPhone.trim()})`,
      `Cake: ${product.name}`,
      `Size: ${currentSize.name}`,
      `Flavour: ${currentFlavour}`,
      cakeMessage.trim() ? `Piped Message: "${cakeMessage.trim()}"` : null,
      `Quantity: ${quantity}`,
      `Total Transferred: ${formatNaira(currentTotalPrice)}`,
      `\n*BANK PAYMENT DETAILS*`,
      `Bank: ${businessInfo.payment.bank}`,
      `Account: ${businessInfo.payment.accountNumber} (${businessInfo.payment.accountName})`,
      `Amount Transferred: ${formatNaira(currentTotalPrice)}`,
      `\n*Fulfillment:* ${isPickup ? `Bakery Pickup (Lakeview Phase 1, Amuwo-Odofin) - ${activeDeliveryMethod.name}` : `${activeDeliveryMethod.name} to: ${deliveryAddress.trim() || 'Address provided'} (Pay courier on delivery based on Uber/rider rate)`}`,
      `\nHello El's Delight Treats, I have completed the direct bank transfer of ${formatNaira(currentTotalPrice)} to your verified ${businessInfo.payment.bank} account. Here are my order details for instant verification!`,
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(whatsappMsg)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setIsDirectPaymentOpen(false);
    navigate('/order-confirmation');
  };

  const handleAddToCart = () => {
    addToCart(
      product,
      currentSize,
      currentFlavour,
      cakeMessage,
      specialInstructions,
      quantity
    );
  };

  const handleShare = () => {
    if (navigator?.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied! 📋', 'Product link copied to your clipboard.');
    }
  };

  // Recommended products (same category or general bestsellers, excluding current)
  const recommendations = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.bestseller)
  ).slice(0, 4);

  return (
    <div className="py-8 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-pink-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-pink-600 transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-[4/5] min-h-[400px] sm:min-h-[520px] lg:min-h-[580px] w-full rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-rose-100 dark:border-rose-950/60 shadow-md p-2 flex items-center justify-center">
              <SafeImage
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                category={product.category}
                fallbackTitle={product.name}
                fitMode="auto"
                className="w-full h-full"
              />

              {/* Wishlist and Share */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-pink-600 shadow-sm backdrop-blur-xs transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-rose-600 shadow-sm backdrop-blur-xs transition-colors"
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-pink-600 ring-2 ring-pink-500/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 bg-white dark:bg-[#18181C] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-950/60 shadow-md space-y-6">
            
            {/* Header info */}
            <div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400">
                  {product.category}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1 leading-tight">
                {product.name}
              </h1>

              {/* Price display with dynamic calculation */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatNaira(currentTotalPrice)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm sm:text-base text-stone-400 line-through tabular-nums">
                    {formatNaira(Math.round(product.oldPrice * (currentSize.priceModifier || 1) * quantity))}
                  </span>
                )}
                {quantity > 1 && (
                  <span className="text-xs text-stone-500">
                    ({formatNaira(currentUnitPrice)} per unit)
                  </span>
                )}
              </div>

              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
                {product.fullDescription || product.description}
              </p>
            </div>

            {/* Customization 1: Size Selector */}
            <div className="pt-2 border-t border-rose-50 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  1. Select Size: <span className="text-pink-600 font-semibold">{currentSize.name}</span>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const sizePrice =
                    size.price !== undefined
                      ? size.price
                      : Math.round(product.price * (size.priceModifier || 1));
                  const isSelected = currentSize.label === size.label;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'border-pink-600 bg-pink-50/80 dark:bg-rose-950/50 font-semibold ring-1 ring-pink-600'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{size.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5 tabular-nums">
                        {formatNaira(sizePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization 2: Flavour Selector */}
            <div className="pt-2 border-t border-rose-50 dark:border-stone-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
                2. Select Flavour: <span className="text-pink-600 font-semibold">{currentFlavour}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavours.map((flavour) => {
                  const isSelected = currentFlavour === flavour;
                  return (
                    <button
                      key={flavour}
                      type="button"
                      onClick={() => setSelectedFlavour(flavour)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {flavour}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization 3: Cake Inscription Message */}
            <div className="pt-2 border-t border-rose-50 dark:border-stone-800">
              <label htmlFor="pdp-cake-msg" className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                3. What should we write on the cake? (Free Inscription)
              </label>
              <input
                id="pdp-cake-msg"
                type="text"
                maxLength={45}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy 30th Birthday Adaora!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Customization 4: Special Instructions */}
            <div>
              <label htmlFor="pdp-spec-inst" className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                4. Special Instructions (Optional)
              </label>
              <textarea
                id="pdp-spec-inst"
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Please reduce sweetness, light pink accents, deliver before 2 PM..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-rose-50 dark:border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Quantity:
              </span>
              <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-sm font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-sm font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDirectPaymentOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 hover:from-rose-800 hover:to-pink-800 text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center active:scale-[0.99]"
              >
                <span>PAY VIA BANK TRANSFER · {formatNaira(currentTotalPrice)}</span>
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-6 rounded-2xl bg-white dark:bg-stone-900 border-2 border-pink-600 hover:bg-pink-50 dark:hover:bg-rose-950/40 text-pink-700 dark:text-pink-300 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART · {formatNaira(currentTotalPrice)}</span>
              </button>

              <a
                href={generateDirectProductWhatsAppUrl(
                  product.name,
                  currentTotalPrice,
                  currentSize.name,
                  currentFlavour,
                  businessInfo.whatsappUrlNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>ORDER ON WHATSAPP DIRECTLY</span>
              </a>
            </div>

            {/* Product Trust Information */}
            <div className="pt-4 border-t border-rose-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Freshly prepared
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Quality ingredients
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 100% Customizable
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Carefully packaged
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Lagos delivery available
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Direct WhatsApp support
              </span>
            </div>

          </div>
        </div>

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <div className="pt-12 border-t border-rose-100 dark:border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
                  Recommended For You
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  You May Also Like
                </h3>
              </div>
              <Link to="/shop" className="text-xs font-semibold text-pink-600 hover:underline">
                View All Cakes →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Direct Bank Transfer Payment Modal (Following FAQ Instructions) */}
        {isDirectPaymentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-[#18181C] rounded-3xl border border-rose-200 dark:border-stone-800 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
              
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                    Bank Transfer Payment
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Verified {businessInfo.payment.bank} account · Following FAQ Guidelines
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectPaymentOpen(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cake Order Brief */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-stone-900/60 border border-rose-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {product.name}
                  </p>
                  <p className="text-stone-500 mt-0.5">
                    {currentSize.name} · {currentFlavour} {cakeMessage.trim() ? `· "${cakeMessage.trim()}"` : ''}
                  </p>
                  {quantity > 1 && (
                    <span className="text-[11px] text-pink-600 font-semibold">Qty: {quantity}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Due</span>
                  <span className="text-lg font-bold text-pink-600 dark:text-pink-400 tabular-nums">
                    {formatNaira(currentTotalPrice)}
                  </span>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  1. Your Contact & Delivery Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Adebayo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Delivery Policy Note */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px]">
                  <p>
                    <strong>Delivery Policy:</strong> {businessInfo.deliveryPolicyNotice || "Delivery fee is NOT added to cake payment. Customer pays courier on delivery based on Uber / live rate (or free pickup at our Amuwo-Odofin studio)."}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Select Delivery Option in Nigeria *
                  </label>
                  <select
                    value={selectedDeliveryId}
                    onChange={(e) => setSelectedDeliveryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-medium"
                  >
                    {enabledDeliveryMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.pricingNote}
                      </option>
                    ))}
                  </select>
                </div>

                {!isPickup ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Delivery Address & Lagos Area *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-900 dark:text-emerald-200">
                    <p className="font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Free Store Pickup
                    </p>
                    <p className="mt-0.5 text-stone-600 dark:text-stone-300">
                      Studio: {businessInfo.pickupNote || businessInfo.address || 'Lakeview Phase 1, Amuwo-Odofin, Lagos.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Official Bank Credentials */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Official {businessInfo.payment.bank} Account
                </h4>
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-900/60 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Bank</span>
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{businessInfo.payment.bank}</p>
                    </div>
                    <div className="min-w-0 text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Account Name</span>
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{businessInfo.payment.accountName}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400">Account Number</span>
                      <p className="text-lg sm:text-xl font-mono font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                        {businessInfo.payment.accountNumber}
                      </p>
                    </div>
                    <CopyAccountButton
                      accountNumber={businessInfo.payment.accountNumber}
                      className="w-full sm:w-auto text-[10px] py-1.5 px-2.5 justify-center shrink-0"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Step Instruction Guide */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                <p><strong>Step 1:</strong> Copy account number <span className="font-mono font-bold text-pink-600">{businessInfo.payment.accountNumber}</span>.</p>
                <p><strong>Step 2:</strong> Transfer exact amount <strong className="tabular-nums font-bold text-stone-900 dark:text-stone-100">{formatNaira(currentTotalPrice)}</strong> via your banking app or USSD.</p>
                <p><strong>Step 3:</strong> Click <strong>“PAYMENT MADE”</strong> below to open WhatsApp with your invoice so our baking team can verify instantly.</p>
              </div>

              {/* CTA Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDirectPaymentMade}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>PAYMENT MADE (Open WhatsApp Confirmation)</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
