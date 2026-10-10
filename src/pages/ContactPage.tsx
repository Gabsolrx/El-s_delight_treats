import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useApp } from '../context/AppContext';
import { CopyAccountButton } from '../components/CopyAccountButton';

export const ContactPage: React.FC = () => {
  const { showToast, businessInfo } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const instagramUrl =
    businessInfo.instagramUrl ||
    'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==';
  const facebookUrl =
    businessInfo.facebookUrl ||
    'https://www.facebook.com/share/1CDErKS8QJ/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      showToast('Missing fields', 'Please enter your name and message.', 'error');
      return;
    }
    const whatsappUrl = `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(
      `Hello ${businessInfo.name},\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`
    )}`;
    window.open(whatsappUrl, '_blank');
    setSent(true);
    showToast('Enquiry Prepared! 💬', 'Redirected to WhatsApp for immediate baker response.');
  };

  return (
    <div className="py-12 bg-[#FAF7F5] dark:bg-[#120F11] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-pink-400">
            Get in Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Contact El's Delight Treats
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            We are here to assist with cake tastings, wedding consultations, rush birthday orders, and delivery coordination across Lagos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#181316] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Bakery Studio Details
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-rose-950 text-pink-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Bakery Location</h3>
                    <p className="text-stone-500 mt-0.5">{businessInfo.address}</p>
                    <p className="text-[11px] text-pink-600 mt-0.5">Self-pickup available by arrangement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-rose-950 text-pink-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Phone Calls</h3>
                    <p className="text-stone-500 mt-0.5">
                      <a href={`tel:${businessInfo.phone}`} className="hover:text-pink-600 transition-colors">
                        {businessInfo.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">WhatsApp Hotline</h3>
                    <p className="text-stone-500 mt-0.5">
                      <a
                        href={`https://wa.me/${businessInfo.whatsappUrlNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        Chat Directly on WhatsApp (Fastest response)
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-rose-950 text-pink-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Official Email</h3>
                    <p className="text-stone-500 mt-0.5">
                      <a href={`mailto:${businessInfo.email}`} className="hover:text-pink-600 transition-colors">
                        {businessInfo.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-rose-950 text-pink-600 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Instagram Direct</h3>
                    <p className="text-stone-500 mt-0.5">
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>els_delighttreats</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Facebook Direct</h3>
                    <p className="text-stone-500 mt-0.5">
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>els_delight</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-rose-950 text-pink-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">Baking & Dispatch Hours</h3>
                    <p className="text-stone-500 mt-0.5">{businessInfo.openingHours}</p>
                  </div>
                </div>
              </div>

              {/* Direct Bank Details Reference */}
              <div className="pt-4 border-t border-rose-100 dark:border-stone-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Payment Account
                </span>
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  {businessInfo.payment.bank} · <strong>{businessInfo.payment.accountNumber}</strong>
                </p>
                <CopyAccountButton accountNumber={businessInfo.payment.accountNumber} className="w-full justify-center" />
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#181316] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-sm space-y-5">
            <div className="border-b border-rose-100 dark:border-stone-800 pb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                Send a Direct Message
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Have a question or request? Fill this form to start a conversation with our lead baker.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bukola Adeleke"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 09138761465"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  How can we help your celebration? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your event, delivery date, preferred flavours, or custom ideas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Send via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
