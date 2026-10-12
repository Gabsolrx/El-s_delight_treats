import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/format';
import { useApp } from '../context/AppContext';

interface CopyAccountButtonProps {
  accountNumber?: string;
  className?: string;
}

export const CopyAccountButton: React.FC<CopyAccountButtonProps> = ({
  accountNumber: propAccountNumber,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast, businessInfo } = useApp();
  const accountNumber = propAccountNumber || businessInfo.payment.accountNumber;

  const handleCopy = async () => {
    const success = await copyToClipboard(accountNumber);
    if (success) {
      setCopied(true);
      showToast('Account number copied successfully!', 'Paste this into your banking app to transfer.', 'success', true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } else {
      showToast('Failed to copy', `Please manually copy ${accountNumber}`, 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all max-w-full text-center shrink-0 ${
        copied
          ? 'bg-emerald-600 text-white'
          : 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200'
      } ${className}`}
      aria-label="Copy bank account number"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 shrink-0" />
          <span className="truncate">COPIED ✓</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 shrink-0" />
          <span className="truncate">COPY ACCOUNT NUMBER</span>
        </>
      )}
    </button>
  );
};
