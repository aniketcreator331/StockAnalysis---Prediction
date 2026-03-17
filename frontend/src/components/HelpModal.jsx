import React from 'react';
import { HelpCircle, X, Info, Activity, Bell, Bookmark } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-darkCard w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-darkBorder overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg/50">
          <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
            <HelpCircle className="mr-3 text-primary" />
            How to Use Stock Analysis
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-darkBorder text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
              <Activity className="mr-2 text-blue-500" size={18} />
              Navigation & Searches
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Use the top search bar to look up any valid US stock ticker (e.g. AAPL, MSFT, TSLA). The application will fetch live market data. 
              Your recent searches will be saved in the left sidebar for quick access.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
              <Bookmark className="mr-2 text-emerald-500" size={18} />
              Following Stocks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Click the bookmark button next to a stock's name on the Live Dashboard to follow it. It will be added to your "Followed" section in the sidebar, so you can always find your favorite companies quickly.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
              <Bell className="mr-2 text-orange-500" size={18} />
              Price Alerts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Want to know when a stock reaches a certain price? In the Dashboard, use the <strong>Price Alerts</strong> section to set a target price. Choose whether you want to be alerted when the price goes "Above" or "Below" your target. The application will track this in the background!
            </p>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start">
            <Info className="text-primary mr-3 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Tip:</strong> You can change your preferred currency using the selector in the top right corner. All historical charts and price tags will update instantly!
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-darkBg/80 border-t border-gray-200 dark:border-darkBorder flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
