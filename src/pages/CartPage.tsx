import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/format';
import { SafeImage } from '../components/SafeImage';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount } = useApp();
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="py-24 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-[70vh] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm max-w-md w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-rose-950 flex items-center justify-center text-3xl mx-auto mb-4">
            🍰
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Your Cart is Empty
          </h1>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            You haven't added any sweet celebrations to your cart yet. Explore our handcrafted celebration cakes and fresh treats!
          </p>
          <div className="mt-6">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <span>Explore Bakery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
              Your Shopping Cart
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Review your cake customizations before proceeding to delivery and bank transfer.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-pink-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Table */}
          <div className="lg:col-span-8 bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs divide-y divide-rose-50 dark:divide-stone-800/80 p-6">
            {cart.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 dark:border-stone-800 shrink-0">
                    <SafeImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      category={item.product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-stone-500 space-x-2">
                      <span>Size: <strong>{item.selectedSize.label}</strong></span>
                      <span>·</span>
                      <span>Flavour: <strong>{item.selectedFlavour}</strong></span>
                    </div>
                    {item.cakeMessage && (
                      <p className="text-xs text-pink-600 italic">
                        Inscription: "{item.cakeMessage}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-900">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <span className="font-bold text-base text-rose-950 dark:text-rose-100 tabular-nums">
                    {formatNaira(item.unitPrice * item.quantity)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => setItemToDelete({ id: item.id, name: item.product.name })}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-[#18181C] p-6 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-md space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums text-sm">
                  {formatNaira(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery</span>
                <span className="text-[11px] text-stone-500 italic">
                  Calculated next step
                </span>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between items-baseline font-bold text-sm text-stone-900 dark:text-stone-100">
                <span>Estimated Total</span>
                <span className="text-xl text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatNaira(subtotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-stone-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Stanbic IBTC Direct Bank Transfer
              </p>
              <p className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-pink-500" />
                Pickups in Amuwo-Odofin or Lagos Doorstep Dispatch
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Item Confirmation Prompt */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-sm rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Remove from Cart?
              </h4>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> from your shopping cart?
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel, Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
