import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ElsDelightLogo } from './ElsDelightLogo';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { businessInfo } = useApp();

  const instagramUrl =
    businessInfo.instagramUrl ||
    'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==';
  const facebookUrl =
    businessInfo.facebookUrl ||
    'https://www.facebook.com/share/1CDErKS8QJ/';

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Main Multi-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <ElsDelightLogo
                  className={
                    businessInfo?.logo?.sizePreset === 'compact'
                      ? 'w-11 h-11'
                      : businessInfo?.logo?.sizePreset === 'prominent'
                      ? 'w-16 h-16'
                      : 'w-14 h-14'
                  }
                />
              </div>
              {(businessInfo?.logo?.showWordmark ?? true) && (
                <div className="flex flex-col -ml-0.5 sm:-ml-1">
                  <span className="font-serif text-2xl font-bold text-white tracking-tight leading-tight">
                    {businessInfo?.logo?.wordmarkText || businessInfo.name || "El's Delight"}
                  </span>
                  <span className="text-[10px] tracking-[0.16em] font-bold uppercase text-pink-400 mt-0.5">
                    {businessInfo?.logo?.wordmarkSubtext || 'Treats'}
                  </span>
                </div>
              )}
            </Link>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              “{businessInfo.tagline}” Handcrafted celebration cakes, wedding showstoppers, and artisanal pastries baked fresh daily in Lakeview Phase 1, Amuwo-Odofin, Lagos, Nigeria.
            </p>

            {/* Social Media Links: Instagram & Facebook */}
            <div className="pt-0.5 space-y-1.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-pink-400">
                Follow Our Kitchen
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-pink-950/70 border border-stone-800 hover:border-pink-500/60 text-stone-300 hover:text-pink-300 text-xs font-medium transition-all group shadow-xs"
                  aria-label="Follow El's Delight Treats on Instagram"
                  title="Visit our Instagram"
                >
                  <Instagram className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-blue-950/70 border border-stone-800 hover:border-blue-500/60 text-stone-300 hover:text-blue-300 text-xs font-medium transition-all group shadow-xs"
                  aria-label="Follow El's Delight Treats on Facebook"
                  title="Visit our Facebook (els_delight)"
                >
                  <Facebook className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              Shop Cakes & Treats
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">All Cakes</Link>
              </li>
              <li>
                <Link to="/best-sellers" className="hover:text-white transition-colors">Best Sellers</Link>
              </li>
              <li>
                <Link to="/shop?category=Birthday%20Cakes" className="hover:text-white transition-colors">Birthday Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Wedding%20Cakes" className="hover:text-white transition-colors">Wedding Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Anniversary%20Cakes" className="hover:text-white transition-colors">Anniversary Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Corporate%2FOffice%20Cakes" className="hover:text-white transition-colors">Corporate / Office Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Graduation%20Cakes" className="hover:text-white transition-colors">Graduation Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Christmas%20Cakes" className="hover:text-white transition-colors">Christmas Cakes</Link>
              </li>
              <li>
                <Link to="/custom-cakes" className="hover:text-white transition-colors">Custom Designs</Link>
              </li>
            </ul>
          </div>

          {/* Occasions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              Occasions
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/shop?category=Birthday%20Cakes" className="hover:text-white transition-colors">Birthday Cakes</Link>
              </li>
              <li>
                <Link to="/shop?category=Wedding%20Cakes" className="hover:text-white transition-colors">Weddings & Bridal</Link>
              </li>
              <li>
                <Link to="/shop?category=Anniversary%20Cakes" className="hover:text-white transition-colors">Anniversaries</Link>
              </li>
              <li>
                <Link to="/shop?category=Baby%20Shower%20Cakes" className="hover:text-white transition-colors">Baby Showers</Link>
              </li>
              <li>
                <Link to="/shop?category=Graduation%20Cakes" className="hover:text-white transition-colors">Graduations</Link>
              </li>
              <li>
                <Link to="/corporate" className="hover:text-white transition-colors">Corporate & Office</Link>
              </li>
              <li>
                <Link to="/shop?occasion=Valentine" className="hover:text-white transition-colors">Romantic Gifts</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              Bakery Contact
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <span>{businessInfo.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-500 shrink-0" />
                <a href={`tel:${businessInfo.phone}`} className="hover:text-white transition-colors">
                  {businessInfo.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <a href={`mailto:${businessInfo.email}`} className="hover:text-white transition-colors">
                  {businessInfo.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${businessInfo.whatsappUrlNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-emerald-400 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 text-stone-300 transition-colors"
                >
                  Instagram: els_delighttreats
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 text-stone-300 transition-colors"
                >
                  Facebook: els_delight
                </a>
              </p>

              <div className="pt-2">
                <Link
                  to="/faq"
                  className="inline-block text-[11px] text-stone-400 hover:text-pink-300 underline"
                >
                  Frequently Asked Questions →
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} {businessInfo.name}. All rights reserved. GabTek
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-stone-400">
            <div className="flex items-center gap-2 pr-2 border-r border-stone-800">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-1 rounded-md text-stone-400 hover:text-pink-400 hover:bg-stone-900 transition-colors"
                title="Instagram (els_delighttreats)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-1 rounded-md text-stone-400 hover:text-blue-400 hover:bg-stone-900 transition-colors"
                title="Facebook (els_delight)"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <Link to="/about" className="hover:text-white">Our Story</Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-white">Delivery Policy</Link>
            <span>·</span>
            <Link to="/payment" className="hover:text-white">Payment Guide</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
