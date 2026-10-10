import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  User,
  Hash,
  ShoppingBag,
  Check,
  ChevronDown,
  ArrowRight,
  Truck,
  Store,
  Bike,
  Car,
  Package,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';
import { CopyAccountButton } from '../components/CopyAccountButton';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { formatNaira, generateWhatsAppOrderUrl } from '../utils/format';
import { StoredOrder, DeliveryMethodOption } from '../types';
import { DEFAULT_DELIVERY_METHODS } from '../data/defaultSiteContent';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrder, subtotal, cart, businessInfo, showToast, setCurrentOrder, saveOrder, clearCart, siteContent } = useApp();

  const [customerName, setCustomerName] = useState(currentOrder?.customer?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentOrder?.customer?.phone || '');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Configured delivery methods from admin or defaults
  const deliveryMethods: DeliveryMethodOption[] =
    businessInfo.deliveryMethods && businessInfo.deliveryMethods.length > 0
      ? businessInfo.deliveryMethods
      : DEFAULT_DELIVERY_METHODS;

  const enabledDeliveryMethods = deliveryMethods.filter((m) => m.enabled !== false);

  // Delivery selection states
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    currentOrder?.customer?.deliveryMethodId || (enabledDeliveryMethods[0]?.id || 'uber')
  );
  const [deliveryAddress, setDeliveryAddress] = useState(currentOrder?.customer?.address || '');
  const [deliveryArea, setDeliveryArea] = useState(currentOrder?.customer?.area || '');
  const [deliveryLandmark, setDeliveryLandmark] = useState(currentOrder?.customer?.landmark || '');
  const [deliveryDate, setDeliveryDate] = useState(currentOrder?.customer?.deliveryDate || '');

  // Calculate order items and total amount
  // No hardcoded 25000! When visiting from menu without an active order or cart, effectiveTotal reflects custom input or 0
  const hasCart = cart && cart.length > 0;
  const initialTotal = currentOrder?.total || (hasCart ? subtotal : 0);
  const effectiveTotal = customAmount ? Number(customAmount) || 0 : initialTotal;

  // Selected delivery method object
  const activeDeliveryMethod =
    enabledDeliveryMethods.find((m) => m.id === selectedDeliveryId) ||
    enabledDeliveryMethods[0] ||
    DEFAULT_DELIVERY_METHODS[0];

  const isPickup = !!activeDeliveryMethod?.isPickup;

  // Active payment and delivery FAQs from site content
  const paymentFaqs = (siteContent?.faqs || []).filter(
    (f) =>
      f.category?.toLowerCase().includes('payment') ||
      f.category?.toLowerCase().includes('delivery') ||
      f.q.toLowerCase().includes('payment') ||
      f.q.toLowerCase().includes('transfer') ||
      f.q.toLowerCase().includes('delivery') ||
      f.q.toLowerCase().includes('uber') ||
      f.q.toLowerCase().includes('bank')
  );

  const fallbackPaymentFaqs = [
    {
      q: 'Do I pay the delivery fee to El’s Delight, and how are delivery charges handled?',
      a: 'No, delivery fees are NOT added to the money you pay El’s Delight for your cake! You only pay El’s Delight for your cake order. Delivery is paid on delivery directly to the driver/rider based on the real-time Uber or courier rate. If you prefer to avoid delivery charges entirely, you can choose free self-pickup at our bakery studio in Lakeview Phase 1, Amuwo-Odofin, Lagos.',
    },
    {
      q: 'What cake delivery options can I choose from across Nigeria?',
      a: 'We offer multiple flexible cake delivery options across Nigeria: (1) Uber Package / Uber Delivery (paid on delivery by customer based on live Uber rate), (2) Self-Pickup from El’s Delight Store in Amuwo-Odofin (100% Free), (3) Bolt Dispatch / Delivery (paid on delivery), (4) Third-Party Dispatch Rider / Bike Courier (paid on delivery), (5) Customer’s Personal Driver / Chauffeur Pickup (Free), and (6) Interstate Waybill Dispatch for deliveries outside Lagos State.',
    },
    {
      q: 'How does bank transfer payment work?',
      a: `We accept direct bank transfers to our verified Stanbic IBTC bank account: Account Name: ${businessInfo.payment.accountName}, Bank: ${businessInfo.payment.bank}, Account Number: ${businessInfo.payment.accountNumber}. Once you transfer, click "PAYMENT MADE" on our website or send your transfer receipt on WhatsApp for instant verification.`,
    },
    {
      q: 'Can I pay a deposit for custom and tiered cakes?',
      a: 'Yes! For custom showpieces, tiered wedding cakes, and advance bookings, we accept a 50% or 70% deposit to lock in your date on our baking calendar. The balance is paid upon completion before dispatch.',
    },
  ];

  const displayedFaqs = paymentFaqs.length > 0 ? paymentFaqs : fallbackPaymentFaqs;

  const getMethodIcon = (iconType?: string) => {
    switch (iconType) {
      case 'pickup':
        return <Store className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'bolt':
        return <Car className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'dispatch':
        return <Bike className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'driver':
        return <Car className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'interstate':
        return <Package className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'uber':
      default:
        return <Truck className="w-5 h-5 text-pink-600 shrink-0" />;
    }
  };

  const handlePaymentMade = () => {
    const finalName = customerName.trim() || currentOrder?.customer?.fullName || 'Customer';
    const finalPhone = customerPhone.trim() || currentOrder?.customer?.phone || '';

    if (!finalName.trim()) {
      showToast('Name Required', 'Please enter your customer name before confirming.', 'error');
      return;
    }

    if (!isPickup && !deliveryAddress.trim() && !deliveryArea.trim()) {
      showToast('Delivery Address Needed', 'Please provide your delivery address or area for dispatch.', 'warning');
      return;
    }

    const orderId = currentOrder?.orderId || `ELS-${Date.now().toString().slice(-6)}`;
    const orderItems = currentOrder?.items?.length ? currentOrder.items : (hasCart ? cart : []);

    const confirmedOrder: StoredOrder = {
      orderId,
      createdAt: currentOrder?.createdAt || new Date().toISOString(),
      items: orderItems,
      customer: {
        fullName: finalName,
        phone: finalPhone,
        email: currentOrder?.customer?.email || '',
        fulfillmentType: isPickup ? 'pickup' : 'delivery',
        deliveryMethod: activeDeliveryMethod.name,
        deliveryMethodId: activeDeliveryMethod.id,
        deliveryDate: deliveryDate || currentOrder?.customer?.deliveryDate || 'As requested',
        deliveryTime: currentOrder?.customer?.deliveryTime || 'Flexible',
        address: isPickup
          ? (businessInfo.pickupNote || businessInfo.address || 'Lakeview Phase 1, Amuwo-Odofin, Lagos')
          : (deliveryAddress.trim() || currentOrder?.customer?.address || ''),
        area: deliveryArea.trim() || currentOrder?.customer?.area || '',
        landmark: deliveryLandmark.trim() || currentOrder?.customer?.landmark || '',
      },
      subtotal: effectiveTotal,
      deliveryFee: 0,
      total: effectiveTotal,
      status: 'pending_payment_verification',
    };

    saveOrder(confirmedOrder);
    setCurrentOrder(confirmedOrder);
    clearCart();

    // Prepare WhatsApp confirmation message following FAQ instructions
    const whatsappUrl = generateWhatsAppOrderUrl(
      confirmedOrder,
      businessInfo.whatsappUrlNumber,
      businessInfo.payment
    );

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    showToast('Payment Recorded! 🎉', 'Opening WhatsApp to send your verification receipt to our kitchen.');
    navigate('/order-confirmation');
  };

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
          <span className="text-xs font-medium text-stone-400">
            {currentOrder ? `Order Reference #${currentOrder.orderId}` : 'Official Payment Portal'}
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-rose-950/60 text-pink-700 dark:text-pink-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Bakery Payment Section</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
            Pay by Bank Transfer
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
            Direct {businessInfo.payment.bank} transfer with instant kitchen WhatsApp verification.
          </p>
        </div>

        {/* SINGLE UNIFIED PAYMENT BOX - ALL DETAILS & INSTRUCTIONS IN ONE PLACE */}
        <div className="bg-white dark:bg-[#18181C] rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 shadow-xl overflow-hidden">
          
          {/* Card Banner Header */}
          <div className="p-6 bg-gradient-to-r from-rose-900 to-pink-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Payment Gateway
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
                {businessInfo.payment.bank} Bank Transfer
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-pink-200 block">
                {effectiveTotal > 0 ? 'Total Due (Cake Only)' : 'Payment Status'}
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {effectiveTotal > 0 ? formatNaira(effectiveTotal) : 'Amount As Quoted'}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Order Items Breakdown (if available) */}
            {(currentOrder?.items?.length || hasCart) && (
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-stone-900/60 border border-rose-100 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-stone-800 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-600" /> Order Summary
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {(currentOrder?.items || cart).length} item{(currentOrder?.items || cart).length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 max-h-36 overflow-y-auto pr-1">
                  {(currentOrder?.items || cart).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.product?.name || 'Celebration Cake'} ({item.selectedSize?.label || item.selectedSize?.name})
                      </span>
                      <span className="font-semibold tabular-nums shrink-0">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Details Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chinelo Okonjo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  WhatsApp Contact Phone *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Custom Amount Field (if paying custom amount / telephone brief) */}
            {!currentOrder && !hasCart && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Amount to Transfer (₦ NGN) — Enter as quoted by bakery:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 15000)"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs font-bold font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DELIVERY SELECTION SECTION IN NIGERIA & PAY-ON-DELIVERY INSTRUCTION       */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-3 border-t border-rose-100 dark:border-stone-800">
              
              {/* Prominent Form Instruction Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                    Important Delivery Fee Policy (Pay on Delivery)
                  </p>
                  <p className="leading-relaxed text-amber-900 dark:text-amber-200">
                    {businessInfo.deliveryPolicyNotice ||
                      "Please note: The delivery fee is NOT added to the money you pay El's Delight for your cake. The customer pays the delivery fee directly to the courier on delivery based on the actual Uber / dispatch rate. (Or enjoy 100% free self-pickup at our Amuwo-Odofin bakery studio)."}
                  </p>
                </div>
              </div>

              {/* Delivery Option Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Select Cake Delivery Option in Nigeria *
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {enabledDeliveryMethods.map((method) => {
                    const isSelected = selectedDeliveryId === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedDeliveryId(method.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex items-start gap-3 ${
                          isSelected
                            ? 'border-pink-600 bg-pink-50/70 dark:bg-rose-950/40 ring-2 ring-pink-500/20'
                            : 'border-stone-200 dark:border-stone-800 hover:border-pink-300 bg-stone-50/60 dark:bg-stone-900/60'
                        }`}
                      >
                        <div className="mt-0.5">{getMethodIcon(method.iconType)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              {method.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                            {method.description}
                          </p>
                          <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            method.isPickup
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {method.pricingNote}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address Fields (If not self-pickup) */}
              {!isPickup ? (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                    <MapPin className="w-4 h-4 text-pink-600" />
                    <span>Delivery Address & Location Coordinates</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Street Address / House Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 3, 14 Admiralty Way"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Area / City (e.g. Lekki, Ikeja, Festac, Amuwo) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lekki Phase 1"
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Nearest Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Apple Junction / Golden Tulip"
                        value={deliveryLandmark}
                        onChange={(e) => setDeliveryLandmark(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Preferred Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ) : (
                /* Studio Pickup Details */
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Free Bakery Studio Pickup</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    <strong>Bakery Address:</strong> {businessInfo.pickupNote || businessInfo.address || 'Lakeview Phase 1, Amuwo-Odofin, Lagos.'}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Pickup Fee: <strong>₦0 (100% Free)</strong>. Your cake will be safely boxed and refrigerated ready for your arrival.
                  </p>

                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Target Pickup Date
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Bank Credentials Section */}
            <div className="space-y-3 pt-2 border-t border-rose-100 dark:border-stone-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800">
                  <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Bank Name
                  </span>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {businessInfo.payment.bank}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Account Name
                  </span>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                    {businessInfo.payment.accountName}
                  </p>
                </div>
              </div>

              {/* Account Number with Prominent Copy Button */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> {businessInfo.payment.bank} Account Number
                  </span>
                  <p className="text-2xl sm:text-3xl font-mono font-bold text-stone-900 dark:text-stone-100 tracking-wider mt-0.5">
                    {businessInfo.payment.accountNumber}
                  </p>
                </div>

                <CopyAccountButton
                  accountNumber={businessInfo.payment.accountNumber}
                  className="py-2.5 px-4 text-xs font-bold shadow-xs shrink-0"
                />
              </div>
            </div>

            {/* 3 Step Instructions */}
            <div className="pt-2 border-t border-rose-100 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Payment Instructions (3 Easy Steps)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">Step 01</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                    Copy Account Number
                  </p>
                  <p className="text-stone-500 mt-0.5 text-[11px]">
                    Click the copy button above to grab {businessInfo.payment.accountNumber}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">Step 02</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                    Open Banking App
                  </p>
                  <p className="text-stone-500 mt-0.5 text-[11px]">
                    {effectiveTotal > 0
                      ? `Transfer exact total (${formatNaira(effectiveTotal)}) via Stanbic, GTB, Zenith, Kuda, etc.`
                      : 'Transfer exact cake amount agreed with bakery via your banking app.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">Step 03</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                    Click “Payment Made”
                  </p>
                  <p className="text-stone-500 mt-0.5 text-[11px]">
                    Click below to open WhatsApp with your receipt for instant confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handlePaymentMade}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span>PAYMENT MADE (Open WhatsApp Confirmation)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center">
                Our bakery verification desk is active on WhatsApp for instant confirmation and baking scheduling.
              </p>
            </div>

          </div>
        </div>

        {/* Payment FAQs Section */}
        <div className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Payment & Delivery Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-500">
              Everything you need to know about bakery transfers, Uber rates, and pay-on-delivery.
            </p>
          </div>

          <div className="bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm divide-y divide-rose-50 dark:divide-stone-800/80 p-6 sm:p-8">
            {displayedFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
                    className="w-full flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-pink-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-pink-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Bank Credentials Trust Footnote */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-stone-800 text-xs text-stone-500 space-y-2">
          <p className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Why We Use Direct {businessInfo.payment.bank} Bank Transfer & Pay-on-Delivery
          </p>
          <p className="leading-relaxed">
            In Nigeria, online cake purchases frequently require bespoke inscriptions, delicate delivery coordinates, and exact dispatch timings. Paying for cake delivery on delivery based on Uber live rates guarantees that you only pay the actual dispatch cost, while direct bank transfers to {businessInfo.payment.bank} guarantee zero card gateway failure and direct kitchen verification.
          </p>
        </div>

      </div>
    </div>
  );
};
