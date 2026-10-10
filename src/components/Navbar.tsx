import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Sun, Moon, Menu, X, Instagram, Facebook } from 'lucide-react';
import { ElsDelightLogo } from './ElsDelightLogo';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { cartCount, wishlist, openCart, openSearch, isDarkMode, toggleDarkMode, businessInfo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const instagramUrl =
    businessInfo.instagramUrl ||
    'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==';
  const facebookUrl =
    businessInfo.facebookUrl ||
    'https://www.facebook.com/share/1CDErKS8QJ/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Cakes', to: '/cakes' },
    { label: 'Occasions', to: '/occasions' },
    { label: 'Custom Cakes', to: '/custom-cakes' },
    { label: 'Corporate', to: '/corporate' },
    { label: 'Payment', to: '/payment', badge: 'Pay' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#16161A]/95 backdrop-blur-md border-rose-100 dark:border-rose-950/60 shadow-sm'
            : 'bg-white/80 dark:bg-[#0F0F12]/90 backdrop-blur-sm border-rose-100/60 dark:border-rose-950/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 group min-w-0 shrink sm:shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-lg p-0.5 sm:p-1"
          >
            <div className="relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <ElsDelightLogo
                className={
                  businessInfo?.logo?.sizePreset === 'compact'
                    ? 'w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 drop-shadow-xs'
                    : businessInfo?.logo?.sizePreset === 'prominent'
                    ? 'w-10 h-10 xs:w-11 xs:h-11 sm:w-16 sm:h-16 drop-shadow-xs'
                    : 'w-9 h-9 xs:w-10 xs:h-10 sm:w-14 sm:h-14 drop-shadow-xs'
                }
              />
            </div>
            {(businessInfo?.logo?.showWordmark ?? true) && (
              <div className="flex flex-col min-w-0 -ml-0.5 sm:-ml-1">
                <span className="font-serif text-sm xs:text-base sm:text-2xl font-bold tracking-tight text-rose-950 dark:text-rose-100 leading-none truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                  {businessInfo?.logo?.wordmarkText || businessInfo.name || "El's Delight"}
                </span>
                <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] tracking-[0.16em] font-bold uppercase text-pink-600 dark:text-pink-400 font-sans mt-0.5 truncate">
                  {businessInfo?.logo?.wordmarkSubtext || 'Treats'}
                </span>
              </div>
            )}
          </Link>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-pink-600 dark:hover:text-pink-400 relative py-1 inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'text-pink-600 dark:text-pink-400 font-semibold'
                      : 'text-stone-700 dark:text-stone-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700/60 leading-none">
                        Stanbic
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Actions & Mobile Hamburger */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Search Icon */}
            <button
              onClick={openSearch}
              className="p-1.5 sm:p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-rose-950/40 rounded-full transition-colors shrink-0"
              aria-label="Search cakes and treats"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link (Desktop/Tablet, accessible in Drawer on small phones) */}
            <Link
              to="/wishlist"
              className="hidden sm:inline-flex relative p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-rose-950/40 rounded-full transition-colors shrink-0"
              aria-label={`Wishlist (${wishlist.length} saved)`}
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-1.5 sm:p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-rose-950/40 rounded-full transition-colors shrink-0"
              aria-label={`Shopping Bag (${cartCount} items)`}
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Social Channels: Instagram & Facebook */}
            <div className="hidden xl:flex items-center gap-0.5 text-stone-600 dark:text-stone-300 shrink-0">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label="Follow El's Delight Treats on Instagram"
                title="Instagram (els_delighttreats)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                aria-label="Follow El's Delight Treats on Facebook"
                title="Facebook (els_delight)"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            {/* Light / Dark Mode Toggle (Beside Hamburger Menu) */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center justify-center p-2 text-stone-700 dark:text-stone-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-700 dark:text-stone-300" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden shrink-0 p-2 text-stone-800 dark:text-stone-200 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-[#16161A] text-stone-900 dark:text-stone-100 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-rose-100 dark:border-stone-800">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex items-center justify-center">
                    <ElsDelightLogo className="w-11 h-11" />
                  </div>
                  {(businessInfo?.logo?.showWordmark ?? true) && (
                    <div className="flex flex-col -ml-0.5">
                      <span className="font-serif text-lg font-bold text-rose-950 dark:text-rose-100 leading-tight">
                        {businessInfo?.logo?.wordmarkText || businessInfo.name || "El's Delight"}
                      </span>
                      <span className="text-[9px] tracking-[0.16em] font-bold uppercase text-pink-600 dark:text-pink-400">
                        {businessInfo?.logo?.wordmarkSubtext || 'Treats'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search Quick Trigger */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSearch();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-stone-100 dark:bg-stone-900 rounded-xl text-stone-500 dark:text-stone-400 text-sm hover:text-stone-800 transition-colors"
                >
                  <Search className="w-4 h-4 text-pink-500" />
                  <span>Search cakes, flavours...</span>
                </button>
              </div>

              {/* Links */}
              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-pink-50 dark:bg-rose-950/40 text-pink-600 dark:text-pink-400 font-semibold'
                          : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        Stanbic Bank
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-rose-100 dark:border-stone-800 flex flex-col gap-2">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" /> My Wishlist
                  </span>
                  <span className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full font-semibold">
                    {wishlist.length}
                  </span>
                </Link>

                {/* Mobile Drawer Theme Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDarkMode()}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500" />}
                    <span>Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {isDarkMode ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}
                  </span>
                </button>
                <Link
                  to="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  Delivery & FAQs
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  Contact & Bakery Location
                </Link>
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 border-t border-rose-100 dark:border-stone-800 space-y-3">
              {/* Social Channels in Drawer */}
              <div className="flex items-center justify-center gap-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 py-2 px-3 bg-pink-50 dark:bg-rose-950/50 hover:bg-pink-100 text-pink-600 dark:text-pink-300 font-semibold rounded-xl text-xs border border-pink-200/60 dark:border-pink-900/60 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Instagram</span>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-300 font-semibold rounded-xl text-xs border border-blue-200/60 dark:border-blue-900/60 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook</span>
                </a>
              </div>

              <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                📍 {businessInfo.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
