import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const AnnouncementBar: React.FC = () => {
  const { siteContent, businessInfo } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeAnnouncements = (siteContent.announcements || []).filter((a) => a.enabled);

  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeAnnouncements.length, isPaused]);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex % activeAnnouncements.length];
  const isWhatsAppLink = current.link.includes('wa.me') || current.link.includes('whatsapp');
  const resolvedLink = isWhatsAppLink && !current.link.includes(businessInfo.whatsappUrlNumber)
    ? `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent('Hello El\'s Delight Treats, I would like to make an enquiry.')}`
    : current.link;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
  };

  return (
    <div
      className="bg-rose-900 text-rose-50 text-xs py-2 px-3 sm:px-4 relative z-40 transition-colors duration-300 select-none min-h-[36px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 w-full">
        {/* Left Arrow (Desktop / Tablet) */}
        {activeAnnouncements.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous announcement"
            className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-rose-300 hover:text-white hover:bg-rose-800/80 rounded-full transition-colors shrink-0 text-sm font-bold leading-none"
          >
            ‹
          </button>
        )}

        {/* Central Message Block - fully displayed across all mobile phone sizes */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-center py-0.5 min-w-0">
          <span className="font-medium tracking-wide text-[11px] xs:text-xs sm:text-xs leading-normal text-center break-words max-w-full">
            {current.text}
          </span>

          {(current.linkText || (current.link && current.link !== '#')) && (
            current.external || resolvedLink.startsWith('http') ? (
              <a
                href={resolvedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-pink-200 hover:text-white underline font-semibold text-[11px] xs:text-xs sm:text-xs shrink-0"
              >
                {current.linkText || 'Learn More'}
              </a>
            ) : (
              <Link
                to={resolvedLink}
                className="inline-flex items-center text-pink-200 hover:text-white underline font-semibold text-[11px] xs:text-xs sm:text-xs shrink-0"
              >
                {current.linkText || 'Learn More'}
              </Link>
            )
          )}
        </div>

        {/* Right Arrow (Desktop / Tablet) */}
        {activeAnnouncements.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next announcement"
            className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-rose-300 hover:text-white hover:bg-rose-800/80 rounded-full transition-colors shrink-0 text-sm font-bold leading-none"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};
