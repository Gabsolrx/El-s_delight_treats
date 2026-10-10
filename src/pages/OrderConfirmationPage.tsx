import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, Clock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { ElsDelightLogo } from '../components/ElsDelightLogo';
import { useApp } from '../context/AppContext';
import { generateWhatsAppOrderUrl, formatNaira } from '../utils/format';

export const OrderConfirmationPage: React.FC = () => {
  const { currentOrder, businessInfo } = useApp();

  const whatsappUrl = currentOrder
    ? generateWhatsAppOrderUrl(currentOrder, businessInfo.whatsappUrlNumber, businessInfo.payment)
    : `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(`Hello ${businessInfo.name}, I have made payment for my order.`)}`;

  return (
    <div className="py-16 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 p-8 sm:p-12 text-center shadow-xl space-y-6">
        
        {/* El's Delight Brand Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-900/60 p-2 flex items-center justify-center mx-auto shadow-md">
            <ElsDelightLogo className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
            Payment Confirmation Pending
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
            THANK YOU FOR YOUR ORDER!
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            “Your order details have been prepared for WhatsApp. Please send the message to our team so we can confirm your payment.”
          </p>
        </div>

        {/* Order Brief Summary if available */}
        {currentOrder && (
          <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-stone-900/80 border border-rose-100 dark:border-stone-800 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center border-b border-rose-100 dark:border-stone-800 pb-2">
              <span className="font-bold text-stone-700 dark:text-stone-300">Order Reference:</span>
              <span className="font-mono font-bold text-pink-600">{currentOrder.orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-400">Recipient:</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{currentOrder.customer.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-400">Fulfillment:</span>
              <span className="capitalize text-stone-900 dark:text-stone-100 font-semibold">{currentOrder.customer.fulfillmentType}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-rose-100 dark:border-stone-800 font-bold text-sm">
              <span className="text-stone-800 dark:text-stone-200">Amount Transferred:</span>
              <span className="text-rose-600 dark:text-rose-400 tabular-nums">{formatNaira(currentOrder.total)}</span>
            </div>
          </div>
        )}

        {/* Buttons: OPEN WHATSAPP, CONTINUE SHOPPING */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>OPEN WHATSAPP</span>
          </a>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
        </div>

        {/* Contact info reminder */}
        <div className="pt-4 border-t border-rose-100 dark:border-stone-800 text-[11px] text-stone-400 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            Lakeview Phase 1, Amuwo-Odofin, Lagos
          </span>
          <span>·</span>
          <span>Direct Kitchen Verification & Punctual Lagos Dispatch</span>
        </div>

      </div>
    </div>
  );
};
