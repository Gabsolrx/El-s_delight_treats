import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building, User, Hash, Clock, AlertTriangle } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoredOrder } from '../types';
import { formatNaira, generateWhatsAppOrderUrl } from '../utils/format';
import { CopyAccountButton } from './CopyAccountButton';
import { useApp } from '../context/AppContext';

interface PaymentCardProps {
  order: StoredOrder;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const { clearCart, setCurrentOrder, businessInfo } = useApp();

  const handlePaymentMade = () => {
    // Generate WhatsApp link and open it
    const whatsappUrl = generateWhatsAppOrderUrl(order, businessInfo.whatsappUrlNumber, businessInfo.payment);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Save current order and clear cart
    setCurrentOrder(order);
    clearCart();

    // Navigate to confirmation page
    navigate('/order-confirmation');
  };

  return (
    <div className="space-y-6">
      {/* Pending status warning banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-bold uppercase tracking-wide">
            PAYMENT CONFIRMATION PENDING
          </p>
          <p className="mt-0.5 leading-relaxed">
            Please transfer the exact cake order total of <strong className="tabular-nums font-bold">{formatNaira(order.total)}</strong> to our Stanbic IBTC bank account below. Then click <strong>“PAYMENT MADE”</strong> to send your invoice on WhatsApp so our baking team can verify and start your order.
          </p>
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
            • Note: Delivery fee is not added to this transfer; customer pays courier on delivery based on Uber / live rate.
          </p>
        </div>
      </div>

      {/* Primary Payment Details Card */}
      <div className="bg-white dark:bg-[#18181C] rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="p-6 bg-gradient-to-r from-rose-900 to-pink-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300">
              Official Payment Gateway
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
              Pay by Bank Transfer
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-pink-200">Total Due</span>
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {formatNaira(order.total)}
            </p>
          </div>
        </div>

        {/* Bank Credentials Table */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Bank Name */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Bank Name
              </span>
              <p className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                {businessInfo.payment.bank}
              </p>
            </div>

            {/* Account Name */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Account Name
              </span>
              <p className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1 truncate">
                {businessInfo.payment.accountName}
              </p>
            </div>

          </div>

          {/* Account Number with Prominent Copy Button */}
          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          {/* 3 Simple Steps */}
          <div className="pt-4 border-t border-rose-100 dark:border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Payment Instructions (3 Easy Steps)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">01</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  Copy Account Number
                </p>
                <p className="text-stone-500 mt-0.5 text-[11px]">
                  Click the copy button above to grab 0086485307.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">02</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  Open Banking App
                </p>
                <p className="text-stone-500 mt-0.5 text-[11px]">
                  Transfer exact amount ({formatNaira(order.total)}) via Stanbic IBTC, GTBank, Zenith, Kuda, etc.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">03</span>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  Click “Payment Made”
                </p>
                <p className="text-stone-500 mt-0.5 text-[11px]">
                  Return here and click below to open your ready invoice on WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={handlePaymentMade}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2.5"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>PAYMENT MADE (Open WhatsApp Confirmation)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center">
              Our bakery verification desk is active on WhatsApp for instant confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
