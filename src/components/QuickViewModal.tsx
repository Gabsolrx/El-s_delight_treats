import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Check, ArrowRight, ShieldCheck, Clock, Truck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, ProductSize, CakeFlavour, StoredOrder } from '../types';
import { useApp } from '../context/AppContext';
import { formatNaira, generateDirectProductWhatsAppUrl } from '../utils/format';
import { SafeImage } from './SafeImage';

export const QuickViewModal: React.FC = () => {
  const navigate = useNavigate();
  const { quickViewProduct, closeQuickView, addToCart, setCurrentOrder } = useApp();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedFlavour, setSelectedFlavour] = useState<CakeFlavour | null>(null);
  const [cakeMessage, setCakeMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0] || null);
      setSelectedFlavour(quickViewProduct.flavours[0] || null);
      setCakeMessage('');
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct || !selectedSize || !selectedFlavour) return null;

  const currentUnitPrice =
    selectedSize.price !== undefined
      ? selectedSize.price
      : Math.round(quickViewProduct.price * (selectedSize.priceModifier || 1));
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      quickViewProduct,
      selectedSize,
      selectedFlavour,
      cakeMessage,
      specialInstructions,
      quantity
    );
    closeQuickView();
  };

  const handlePayViaBankTransfer = () => {
    const directOrder: StoredOrder = {
      orderId: `ELS-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `${quickViewProduct.id}_${selectedSize.label}_${selectedFlavour}_${Date.now()}`,
          productId: quickViewProduct.id,
          product: quickViewProduct,
          selectedSize,
          selectedFlavour,
          cakeMessage: cakeMessage.trim(),
          specialInstructions: specialInstructions.trim(),
          quantity,
          unitPrice: currentUnitPrice,
        },
      ],
      customer: {
        fullName: 'Customer',
        phone: '',
        email: '',
        fulfillmentType: 'delivery',
        deliveryDate: 'As requested',
        deliveryTime: 'Flexible',
      },
      subtotal: currentTotalPrice,
      deliveryFee: 0,
      total: currentTotalPrice,
      status: 'pending_payment_verification',
    };
    setCurrentOrder(directOrder);
    closeQuickView();
    navigate('/payment');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#18181C] rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-900/40 overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white shadow-sm transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Preview */}
        <div className="w-full md:w-5/12 bg-rose-50/40 dark:bg-stone-900 relative min-h-[300px] md:min-h-[440px] p-2 flex items-center justify-center">
          <SafeImage
            src={quickViewProduct.images[0]}
            alt={quickViewProduct.name}
            category={quickViewProduct.category}
            fallbackTitle={quickViewProduct.name}
            fitMode="auto"
            className="w-full h-full rounded-xl"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-medium bg-black/60 text-white backdrop-blur-xs px-2.5 py-1 rounded-md">
              {quickViewProduct.preparationTime}
            </span>
          </div>
        </div>

        {/* Right: Customization Form */}
        <div className="w-full md:w-7/12 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            {/* Category */}
            <div className="text-xs text-stone-500 dark:text-stone-400">
              <span className="uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
                {quickViewProduct.category}
              </span>
            </div>

            {/* Title & Price */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 leading-snug">
              {quickViewProduct.name}
            </h2>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatNaira(currentTotalPrice)}
              </span>
              {quantity > 1 && (
                <span className="text-xs text-stone-500">
                  ({formatNaira(currentUnitPrice)} each)
                </span>
              )}
            </div>

            {/* Size Options */}
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Select Size: <span className="text-pink-600 dark:text-pink-400 font-normal">{selectedSize.name}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {quickViewProduct.sizes.map((size) => {
                  const sizePrice =
                    size.price !== undefined
                      ? size.price
                      : Math.round(quickViewProduct.price * (size.priceModifier || 1));
                  const isSelected = selectedSize.label === size.label;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'border-pink-600 bg-pink-50/70 dark:bg-rose-950/40 text-stone-900 dark:text-stone-100 font-medium ring-1 ring-pink-600'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{size.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5 tabular-nums">
                        {formatNaira(sizePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flavour Options */}
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Select Flavour: <span className="text-pink-600 dark:text-pink-400 font-normal">{selectedFlavour}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickViewProduct.flavours.map((flavour) => {
                  const isSelected = selectedFlavour === flavour;
                  return (
                    <button
                      key={flavour}
                      type="button"
                      onClick={() => setSelectedFlavour(flavour)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-medium shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {flavour}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inscription / Cake Message */}
            <div className="mt-4">
              <label htmlFor="quick-cake-msg" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Cake Inscription (Optional)
              </label>
              <input
                id="quick-cake-msg"
                type="text"
                maxLength={45}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy 30th Birthday Tunde!"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Quantity Stepper */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Quantity:
              </span>
              <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-rose-100 dark:border-stone-800">
            <button
              type="button"
              onClick={handlePayViaBankTransfer}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Pay via Bank Transfer ({formatNaira(currentTotalPrice)})</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 px-4 bg-white dark:bg-stone-900 border border-pink-600 text-pink-700 dark:text-pink-300 hover:bg-pink-50 font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <a
                href={generateDirectProductWhatsAppUrl(
                  quickViewProduct.name,
                  currentTotalPrice,
                  selectedSize.name,
                  selectedFlavour
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            <Link
              to={`/product/${quickViewProduct.slug}`}
              onClick={closeQuickView}
              className="w-full py-1.5 text-center text-xs font-medium text-pink-600 dark:text-pink-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>View Full Cake Details & Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
