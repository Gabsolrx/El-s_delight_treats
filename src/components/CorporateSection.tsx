import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useApp } from '../context/AppContext';

export const CorporateSection: React.FC = () => {
  const { siteContent, businessInfo } = useApp();
  const corporate = siteContent.corporate;

  const corporatePerks = corporate?.perks || [
    { id: '1', title: 'Staff Birthdays', desc: 'Automated recurring monthly or quarterly celebration cakes for your workforce.' },
    { id: '2', title: 'Branded Company Cakes', desc: 'Precision edible printing of company logos, brand colors, and slogans.' },
    { id: '3', title: 'Client Appreciation Gifts', desc: 'Luxury boxed pastry hampers and custom treat boxes delivered directly to partners.' },
    { id: '4', title: 'End-of-Year & AGM Parties', desc: 'Multi-tier showpiece sheet cakes feeding 50 to 250+ employees and guests.' },
    { id: '5', title: 'Office Meetings & Milestone Wins', desc: 'Bite-sized dessert boxes, cupcakes, and cake slices for executive boardrooms.' },
    { id: '6', title: 'Official Invoicing & Bank Transfer', desc: 'Corporate receipts, Stanbic IBTC bank invoicing, and punctual Lagos dispatch.' },
  ];

  const corporateWhatsAppUrl = `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(
    'Hello El\'s Delight Treats, I would like to make an inquiry regarding a Corporate / Bulk Cake Order for our company.'
  )}`;

  return (
    <section className="py-16 sm:py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Subtle luxury ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-pink-300 text-xs font-semibold">
              <span>{corporate?.subheadline || 'Corporate & B2B Solutions'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {corporate?.headline || 'Sweeter Business Moments'}
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {corporate?.intro || "From staff birthdays and office meetings to client appreciation and end-of-year celebrations, El's Delight Treats creates beautiful cakes and treats for your business across Lagos."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/corporate"
                className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md text-center"
              >
                <span>Request Corporate Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <a
                href={corporateWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {corporatePerks.map((perk, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-stone-800/60 border border-stone-800 hover:border-pink-900/50 transition-colors backdrop-blur-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    {perk.title}
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
