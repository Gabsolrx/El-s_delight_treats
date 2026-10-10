import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SafeImage } from '../components/SafeImage';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { siteContent, businessInfo } = useApp();
  const about = siteContent.about;

  const defaultValues = [
    { id: '1', emoji: '🍫', title: 'Real Ingredients', desc: 'Pure vanilla beans, authentic Belgian cocoa, and rich dairy butter.' },
    { id: '2', emoji: '🎨', title: 'Artisan Piping', desc: 'Vintage Lambeth ruffles, smooth ganache drip, and custom edible prints.' },
    { id: '3', emoji: '⏱️', title: 'Reliable Timing', desc: 'Same-day availability for rush orders and prompt weekend delivery.' },
    { id: '4', emoji: '🤝', title: 'Personal Service', desc: 'Direct WhatsApp support and personalized cake inscriptions.' },
  ];

  const values = about.values && about.values.length > 0 ? about.values : defaultValues;

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-rose-950/60 text-pink-700 dark:text-pink-300 text-xs font-semibold">
            <span>Our Patisserie Journey</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {about.headline || 'Crafting Sweet Memories in Lagos'}
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed">
            “{about.tagline || businessInfo.tagline}” At {businessInfo.name}, every cake is an artisanal work of love designed to celebrate life's most cherished milestones.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 rounded-3xl overflow-hidden shadow-lg border border-rose-100 dark:border-stone-800 aspect-4/3 min-h-[300px] sm:min-h-[380px] p-2 bg-rose-50/40 dark:bg-stone-900/60 flex items-center justify-center">
            <SafeImage
              src={about.imageUrl || "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=900&q=80"}
              alt={`Baking at ${businessInfo.name}`}
              category="Bakery Craft"
              fitMode="auto"
              className="w-full h-full rounded-2xl"
            />
          </div>

          <div className="md:col-span-6 space-y-4 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Rooted in Amuwo-Odofin, Lagos
            </h2>
            <p>
              {about.paragraph1}
            </p>
            <p>
              {about.paragraph2}
            </p>
            <p>
              {about.paragraph3}
            </p>
            {about.founderName && (
              <div className="pt-2 border-t border-rose-100 dark:border-stone-800">
                <p className="font-serif font-bold text-stone-900 dark:text-stone-100">{about.founderName}</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">{about.founderRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white dark:bg-[#18181C] p-8 sm:p-10 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              The El's Delight Standard
            </h3>
            <p className="text-stone-500 text-xs mt-1">Four non-negotiable principles guiding every recipe.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => (
              <div key={val.id} className="p-5 rounded-2xl bg-rose-50/50 dark:bg-stone-900 text-center space-y-2 border border-rose-100/60 dark:border-stone-800/80">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{val.title}</h4>
                <p className="text-xs text-stone-500">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-rose-900 via-pink-900 to-rose-950 text-white text-center space-y-4 shadow-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Ready to Celebrate Something Sweet?
          </h3>
          <p className="text-rose-100 text-xs sm:text-sm max-w-md mx-auto">
            Order your celebration cake online or chat directly with our head decorator on WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-white text-rose-900 font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm"
            >
              Shop All Cakes
            </Link>
            <a
              href={`https://wa.me/${businessInfo.whatsappUrlNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
