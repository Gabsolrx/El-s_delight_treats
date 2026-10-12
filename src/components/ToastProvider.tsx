import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastProvider: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-pink-300 dark:border-pink-800 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 shadow-xl';
        let iconColor = 'text-pink-600 dark:text-pink-400';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-red-500';
          borderClass = 'border-red-300 dark:border-red-900 bg-white dark:bg-stone-900 shadow-xl';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-stone-600 dark:text-stone-400';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            {!toast.hideIcon && (
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            )}
            <div className="flex-1 text-sm">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{toast.title}</p>
              {toast.description && (
                <p className="text-stone-600 dark:text-stone-400 text-xs mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1 text-xs font-semibold"
              aria-label="Close notification"
            >
              {toast.hideIcon ? <span className="text-xs font-bold leading-none">✕</span> : <X className="w-4 h-4" />}
            </button>
          </div>
        );
      })}
    </div>
  );
};
