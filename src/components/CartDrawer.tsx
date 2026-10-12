import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/format';
import { SafeImage } from './SafeImage';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, subtotal, cartCount } = useApp();
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full bg-white dark:bg-[#16161A] text-stone-900 dark:text-stone-100 shadow-2xl flex flex-col justify-between border-l border-rose-100 dark:border-stone-800">
          {/* Header */}
          <div className="px-5 py-4 border-b border-rose-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <h2 className="font-serif text-lg font-bold">Shopping Bag</h2>
              <span className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold px-2 py-0.5 rounded-full tabular-nums">
                {cartCount} item{cartCount === 1 ? '' : 's'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-rose-50 dark:divide-stone-800/80">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Your bag is empty
                </h3>
                <p className="text-stone-500 text-xs max-w-xs mt-1 leading-relaxed">
                  Looks like you haven't added any sweet moments yet. Explore our handcrafted celebration cakes!
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/shop');
                  }}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Explore Delicious Cakes
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = item.unitPrice * item.quantity;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-rose-50 border border-rose-100 dark:border-stone-800">
                      <SafeImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        category={item.product.category}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => setItemToDelete({ id: item.id, name: item.product.name })}
                            className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 space-y-0.5">
                          <p>
                            Size: <span className="text-stone-700 dark:text-stone-200 font-medium">{item.selectedSize.label}</span>
                          </p>
                          <p>
                            Flavour: <span className="text-stone-700 dark:text-stone-200 font-medium">{item.selectedFlavour}</span>
                          </p>
                          {item.cakeMessage && (
                            <p className="italic text-pink-600 dark:text-pink-400 line-clamp-1">
                              "{item.cakeMessage}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-900">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-bold text-rose-950 dark:text-rose-100 tabular-nums">
                          {formatNaira(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-rose-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums text-sm">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-stone-400" />
                    Delivery
                  </span>
                  <span className="italic text-[11px] text-stone-500">
                    Calculated at delivery step
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-stone-900 dark:text-stone-100">
                  <span>Estimated Total</span>
                  <span className="text-base text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatNaira(subtotal)}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-center text-stone-500">
                Stanbic IBTC Bank Transfer & WhatsApp Confirmation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Item Confirmation Prompt */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181C] w-full max-w-sm rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Remove from Bag?
              </h4>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> from your shopping bag?
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
