import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Mail, Phone, Calendar, Send } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useApp } from '../context/AppContext';

export const CorporatePage: React.FC = () => {
  const { showToast, businessInfo, siteContent } = useApp();
  const corporate = siteContent.corporate;
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Staff Birthdays');
  const [staffCount, setStaffCount] = useState('20–50 employees');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone) {
      showToast('Missing details', 'Please provide company name and contact phone.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Corporate Inquiry Registered!', 'Dispatching to corporate desk.');
  };

  const whatsappInquiryUrl = `https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(
    `Hello ${businessInfo.name},\n\nI am contacting on behalf of *${companyName || 'our company'}* regarding our upcoming corporate event.\n\n` +
    `• Contact Person: ${contactPerson}\n` +
    `• Phone: ${phone}\n` +
    `• Email: ${email}\n` +
    `• Event Type: ${eventType}\n` +
    `• Guest / Staff Count: ${staffCount}\n` +
    (notes ? `• Special Requirements: ${notes}\n` : '') +
    `\nPlease share your corporate catalogue and invoicing terms.`
  )}`;

  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-stone-900 text-stone-100 text-xs font-semibold">
            <span>{corporate?.subheadline || 'Corporate Gifting & Event Catering'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            {corporate?.headline || 'Corporate Cake Solutions'}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed">
            {corporate?.intro || 'Elevate staff milestones, client partnerships, and company celebrations across Lagos. From logo-branded celebration cakes to executive pastry hampers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Perks & Corporate Services */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-[#18181C] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-xs space-y-5">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                Why Lagos Businesses Choose {businessInfo.name}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                {(corporate?.perks && corporate.perks.length > 0) ? (
                  corporate.perks.map((perk) => (
                    <div key={perk.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">{perk.title}</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">{perk.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">Edible Brand Identity</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Custom high-resolution sugar logo prints matching exact company brand guidelines.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">Automated Birthday Retainer</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Set up an annual calendar and have employee birthday cakes delivered punctually on their special day.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">Official Invoicing & Bank Transfer</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Standard business receipts and verified {businessInfo.payment.bank} accounts for clean corporate accounting.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">Dedicated Account Support</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Priority WhatsApp channel with our managing baker for emergency and last-minute requests.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Instant WhatsApp Quick Button */}
              <div className="pt-4 border-t border-rose-100 dark:border-stone-800">
                <a
                  href={`https://wa.me/${businessInfo.whatsappUrlNumber}?text=${encodeURIComponent(`Hello ${businessInfo.name}, I want to discuss corporate bakery orders.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Chat Directly with Corporate Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Request Form */}
          <div className="lg:col-span-6 bg-white dark:bg-[#18181C] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-stone-800 shadow-md">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-rose-100 dark:border-stone-800 pb-3">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                    Request Corporate Proposal / Invoice
                  </h3>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Fill in your event details and our corporate desk will send quotes promptly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Zenith Bank / Flutterwave"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Bukola Alabi"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 08023456789"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@company.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="Staff Birthdays (Monthly Retainer)">Staff Birthdays (Monthly Retainer)</option>
                      <option value="End-of-Year Party / Gala">End-of-Year Party / Gala</option>
                      <option value="Client Appreciation Hampers">Client Appreciation Hampers</option>
                      <option value="Product Launch / Milestone">Product Launch / Milestone</option>
                      <option value="Office Meeting Refreshments">Office Meeting Refreshments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Headcount / Volume
                    </label>
                    <select
                      value={staffCount}
                      onChange={(e) => setStaffCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="10–25 people">10–25 people</option>
                      <option value="25–50 people">25–50 people</option>
                      <option value="50–100 people">50–100 people</option>
                      <option value="100–250+ people">100–250+ people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Special Requirements or Target Date
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details about dates, delivery location (e.g. VI, Ikeja, Lekki), branding preferences..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Prepare Corporate Inquiry</span>
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-pink-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                  Inquiry Ready for Dispatch!
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-xs max-w-sm mx-auto">
                  Click below to open WhatsApp with your corporate order brief pre-filled for immediate review.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Send Inquiry on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-stone-500 hover:underline pt-1"
                  >
                    Modify Details
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
