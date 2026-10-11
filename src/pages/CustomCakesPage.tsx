import React from 'react';
import { CustomCakeForm } from '../components/CustomCakeForm';
import { useApp } from '../context/AppContext';

export const CustomCakesPage: React.FC = () => {
  const { businessInfo } = useApp();
  return (
    <div className="py-12 bg-[#FAFAFA] dark:bg-[#0F0F12] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-rose-950/60 text-pink-700 dark:text-pink-300 text-xs font-semibold">
            <span>Bespoke Cake Consultations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
            Design Your Custom Cake
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
            Have a specific theme, photo, Pinterest moodboard, or dream wedding cake in mind? Complete the form below and continue seamlessly on WhatsApp for instant quote approval.
          </p>
        </div>

        {/* Benefits ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-stone-800">
            <p className="font-bold text-stone-900 dark:text-stone-100">Zero Compromise</p>
            <p className="text-stone-500 mt-0.5">Tailored flavours & colour matching</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-stone-800">
            <p className="font-bold text-stone-900 dark:text-stone-100">Fast Turnaround</p>
            <p className="text-stone-500 mt-0.5">24h to 72h lead time in Lagos</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18181C] border border-rose-100 dark:border-stone-800">
            <p className="font-bold text-stone-900 dark:text-stone-100">Direct Baker Chat</p>
            <p className="text-stone-500 mt-0.5">WhatsApp direct assistance available</p>
          </div>
        </div>

        {/* Form Container */}
        <CustomCakeForm />
      </div>
    </div>
  );
};
