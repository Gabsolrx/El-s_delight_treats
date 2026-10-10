import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { CopyAccountButton } from '../components/CopyAccountButton';
import { useApp } from '../context/AppContext';

export const FaqPage: React.FC = () => {
  const { siteContent, businessInfo } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = siteContent.faqs && siteContent.faqs.length > 0 ? siteContent.faqs : [];

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-rose-950/60 text-pink-700 dark:text-pink-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center & Guidelines</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Everything you need to know about placing orders, {businessInfo.payment.bank} transfers, and Lagos delivery.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white dark:bg-[#18181C] rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm divide-y divide-rose-50 dark:divide-stone-800/80 p-6 sm:p-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.id || idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-pink-600 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-pink-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed animate-in fade-in duration-200 whitespace-pre-line">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Delivery Fee Policy & Nigerian Delivery Options Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <span className="font-serif text-lg font-bold">
              🚚 Cake Delivery Fee Policy (Pay on Delivery in Nigeria)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
            {businessInfo.deliveryPolicyNotice ||
              "Please note: The delivery fee is NOT added to the money you pay El's Delight for your cake. The customer pays the delivery fee directly to the courier on delivery based on the actual Uber / dispatch rate. (Or enjoy 100% free self-pickup at our Amuwo-Odofin bakery studio)."}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
              🚗 Uber Package (Pay on Delivery)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              🏬 El's Delight Store Pickup (100% Free)
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
              🚗 Bolt Dispatch (Pay on Delivery)
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
              🛵 Third-Party Dispatch Rider
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
              📦 Interstate Waybill Dispatch
            </span>
          </div>
        </div>

        {/* Bank Account Verification Reminder Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {businessInfo.payment.bank} Payment Account
            </span>
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {businessInfo.payment.accountName} · {businessInfo.payment.accountNumber} ({businessInfo.payment.bank})
            </p>
          </div>
          <CopyAccountButton />
        </div>

        {/* Direct Contact Support Banner */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-xs text-stone-500">
            Have a custom question not covered here?
          </p>
          <a
            href={`https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent('Hello El\'s Delight Treats, I have a question about ordering.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
