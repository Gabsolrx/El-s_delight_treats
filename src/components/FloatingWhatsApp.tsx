import React, { useState, useEffect } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useApp } from '../context/AppContext';

const ROTATING_PROMPTS = [
  {
    title: 'Baker Chinazor is Online',
    subtitle: 'Tap to chat about custom cakes & pricing',
    badge: 'Active Now',
    whatsappMessage: "Hello Baker Chinazor, I'd like to ask about custom cakes and pricing.",
  },
  {
    title: 'Need Cake Advice?',
    subtitle: 'Send us your event date & guest count for quick recommendations',
    badge: 'Quick Quote',
    whatsappMessage: "Hello El's Delight Treats, I need advice on choosing a cake for my event.",
  },
  {
    title: 'Same-Day Celebration Cakes',
    subtitle: 'Ask which fresh cakes are ready for pickup today in Lagos',
    badge: 'Fresh Today',
    whatsappMessage: "Hello El's Delight Treats, what celebration cakes are available for same-day delivery today?",
  },
];

export const FloatingWhatsApp: React.FC = () => {
  const { businessInfo } = useApp();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  // Automatically cycle through friendly bakery prompts every 6.5 seconds
  useEffect(() => {
    if (isPromptDismissed) return;

    const interval = setInterval(() => {
      setIsBubbleVisible(false);
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % ROTATING_PROMPTS.length);
        setIsBubbleVisible(true);
      }, 350);
    }, 6500);

    return () => clearInterval(interval);
  }, [isPromptDismissed]);

  const activePrompt = ROTATING_PROMPTS[currentPromptIndex];
  const url = `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(activePrompt.whatsappMessage)}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-4 sm:right-6 z-40 select-none">
      <div className="relative flex flex-col items-end">
        
        {/* Interactive Speech Bubble Prompt (Collapsible & Rotating) */}
        {!isPromptDismissed && (
          <div
            className={`mb-3 max-w-[calc(100vw-2rem)] sm:max-w-xs transition-all duration-300 ease-out origin-bottom-right ${
              isBubbleVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="relative group bg-white/95 dark:bg-[#1C1C22]/95 text-stone-900 dark:text-stone-100 rounded-2xl p-3.5 shadow-2xl border border-emerald-500/25 dark:border-emerald-500/35 backdrop-blur-md hover:-translate-y-1 hover:shadow-emerald-500/15 transition-all duration-200">
              {/* Dismiss button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPromptDismissed(true);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 shadow-xs transition-colors text-xs font-semibold"
                aria-label="Dismiss chat suggestion"
                title="Dismiss"
              >
                &times;
              </button>

              {/* Clickable Card Body opening WhatsApp */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[11px] font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {activePrompt.title}
                  </p>
                  <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    {activePrompt.badge}
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight line-clamp-2">
                  {activePrompt.subtitle}
                </p>

                <div className="mt-1.5 flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  <span>Tap to start conversation</span>
                </div>
              </a>

              {/* Triangle pointer arrow pointing toward the button */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#1C1C22] border-r border-b border-emerald-500/25 dark:border-emerald-500/35 rotate-45 transform" />
            </div>
          </div>
        )}

        {/* Floating Button Unit with Bobbing animation */}
        <div className="relative animate-whatsapp-float">
          
          {/* Concentric Radiating Radar Waves (Dual glowing emerald rings) */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/35 dark:bg-emerald-400/30 animate-whatsapp-ripple pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-emerald-500/25 dark:bg-emerald-400/20 animate-whatsapp-ripple-delayed pointer-events-none" />

          {/* Primary Action Button */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-green-700 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.45)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.6)] transition-all duration-300 active:scale-95 border-2 border-white/90 dark:border-stone-900 overflow-hidden"
            aria-label="Chat directly with El's Delight Treats on WhatsApp"
          >
            {/* Diagonal Light Shimmer Streak (Confectionery glaze sweep) */}
            <span
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer-sweep pointer-events-none"
              aria-hidden="true"
            />

            {/* Official WhatsApp Phone Icon with Playful Wiggle & Ring animation */}
            <div className="relative shrink-0 animate-whatsapp-wiggle">
              <WhatsAppIcon className="w-6 h-6 text-white drop-shadow-sm" />
            </div>

            {/* Desktop Label Text */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide leading-tight flex items-center gap-1.5">
                Chat With Us
              </span>
              <span className="text-[10px] text-emerald-100 font-medium tracking-normal leading-none mt-0.5">
                Replies in minutes
              </span>
            </div>

            {/* Lively Live Status Badge & Notification (1) Count */}
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md ring-2 ring-white dark:ring-stone-900 tabular-nums animate-pulse"
              title="1 new message prompt"
            >
              1
            </span>
          </a>

          {/* Discreet Reopen Prompt Button if user had closed the bubble */}
          {isPromptDismissed && (
            <button
              type="button"
              onClick={() => setIsPromptDismissed(false)}
              className="absolute -top-3 -left-3 p-1 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 text-[10px] shadow-md border border-stone-200 dark:border-stone-700 flex items-center px-2"
              title="View bakery prompt message"
            >
              <span className="font-semibold text-[9px]">Tips</span>
            </button>
          )}

        </div>

      </div>
    </aside>
  );
};
