import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  category?: string;
  fitMode?: 'cover' | 'contain' | 'auto';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Cake from El\'s Delight Treats',
  className = '',
  fallbackTitle,
  category,
  fitMode = 'auto',
  ...props
}) => {
  const isDataOrBlob = Boolean(src && (src.startsWith('data:') || src.startsWith('blob:')));
  const [hasError, setHasError] = useState(false);
  // Data URLs in memory can be treated as immediately loaded
  const [isLoaded, setIsLoaded] = useState(isDataOrBlob);

  useEffect(() => {
    setHasError(false);
    if (src && (src.startsWith('data:') || src.startsWith('blob:'))) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-pink-100 to-amber-50 dark:from-[#2A1420] dark:via-[#1D0F18] dark:to-[#0F0F12] text-rose-900 dark:text-rose-200 overflow-hidden select-none ${className}`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E85382_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="w-10 h-10 rounded-full bg-rose-200/60 dark:bg-rose-950/60 flex items-center justify-center mb-2 shadow-inner text-rose-700 dark:text-rose-300 font-serif font-bold text-sm tracking-tight">
          El's
        </div>
        <p className="text-xs font-semibold tracking-wide uppercase text-rose-800 dark:text-rose-300 text-center line-clamp-1">
          {category || "El's Delight Treats"}
        </p>
        <span className="text-[11px] text-stone-600 dark:text-stone-400 text-center line-clamp-1 mt-0.5">
          {fallbackTitle || 'Freshly Baked'}
        </span>
      </div>
    );
  }

  // Cover mode: standard fill-and-crop
  if (fitMode === 'cover') {
    return (
      <div className={`relative overflow-hidden bg-rose-50/40 dark:bg-stone-900 ${className}`}>
        {!isLoaded && !isDataOrBlob && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 via-pink-50/70 to-rose-100/50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 animate-pulse" />
        )}
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={isDataOrBlob ? 'eager' : (props.loading || 'lazy')}
          decoding={isDataOrBlob ? 'sync' : 'async'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            console.warn('Image failed to load:', src?.slice(0, 80));
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded || isDataOrBlob ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      </div>
    );
  }

  // Auto / Contain mode: Ambient backdrop + full foreground display to accommodate any height/length without cropping
  return (
    <div className={`relative overflow-hidden bg-stone-100/60 dark:bg-stone-900/90 flex items-center justify-center ${className}`}>
      {!isLoaded && !isDataOrBlob && (
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 via-pink-50/70 to-rose-100/50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 animate-pulse z-0" />
      )}
      
      {/* Ambient background blur that softly matches image colors */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 dark:opacity-35 scale-110 pointer-events-none select-none"
      />

      {/* Sharp full cake foreground that accommodates any height, length, or aspect ratio */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={isDataOrBlob ? 'eager' : (props.loading || 'lazy')}
        decoding={isDataOrBlob ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          console.warn('Image failed to load:', src?.slice(0, 80));
          setHasError(true);
        }}
        className={`w-full h-full object-contain relative z-1 p-0.5 sm:p-1 transition-all duration-300 ${
          isLoaded || isDataOrBlob ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
        }`}
        {...props}
      />
    </div>
  );
};
