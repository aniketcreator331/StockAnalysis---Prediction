import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const TradeConfirmModal = ({ isOpen, title, details, warning, confirmLabel = 'Confirm', confirmTone = 'emerald', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const toneClass = confirmTone === 'red'
    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-darkCard shadow-2xl border border-gray-100 dark:border-darkBorder overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-darkBorder">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Please review before placing the order</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full bg-gray-100 dark:bg-darkBorder text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-2xl bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder p-4 space-y-2 text-sm">
            {details.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-gray-500 font-semibold">{item.label}</span>
                <span className="text-gray-900 dark:text-white font-bold text-right">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-amber-700 dark:text-amber-300">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-5">{warning}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <button onClick={onCancel} className="py-3 rounded-xl border border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-darkBg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`py-3 rounded-xl text-white font-black shadow-lg transition-colors ${toneClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeConfirmModal;
