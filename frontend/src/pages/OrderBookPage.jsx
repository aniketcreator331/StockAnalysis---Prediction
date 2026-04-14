import React, { useState, useEffect } from 'react';
import { Book, RefreshCw, Filter, Download, Activity, CheckCircle, Clock } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const STORAGE_KEY = 'demoTradingAccount';

function loadAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { cash: 10000, positions: {}, lastPrices: {}, history: [] };
  } catch {
    return { cash: 10000, positions: {}, lastPrices: {}, history: [] };
  }
}

const OrderBookPage = () => {
  const { formatPrice } = useCurrency();
  const [account, setAccount] = useState(() => loadAccount());
  const [filterTicker, setFilterTicker] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const handleStorageChange = () => {
      setAccount(loadAccount());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const downloadCSV = () => {
    if (!account.history.length) return;
    const headers = ['Date', 'Type', 'Ticker', 'Shares', 'Price', 'Total Value'];
    const rows = account.history.map(order => [
      new Date(order.time).toLocaleString(),
      order.type,
      order.ticker,
      order.shares,
      order.price.toFixed(2),
      order.total.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_trade_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = account.history.filter(h => {
    const matchTicker = filterTicker === '' || h.ticker.includes(filterTicker.toUpperCase());
    const matchType = filterType === 'ALL' || h.type === filterType;
    return matchTicker && matchType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Book className="text-primary w-5 h-5" />
            </div>
            Order Book
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
            Track your open orders and complete trade history
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAccount(loadAccount())} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center gap-2 font-bold text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={downloadCSV} className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm hover:bg-gray-800 dark:hover:bg-white flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Pending / Active Rules (Placeholder for Phase 2 integration) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h2 className="font-black text-gray-900 dark:text-white">Active Rules & Pending</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Live</span>
            </div>
            <div className="p-5 text-center text-gray-500 dark:text-gray-400">
              <Activity size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-semibold">No pending orders or active auto-trade rules right now.</p>
              <p className="text-xs mt-1">Configure auto-trades in the Trading Terminal</p>
            </div>
          </div>
        </div>

        {/* Right Column: Execution History */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative flex-1">
               <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 value={filterTicker}
                 onChange={e => setFilterTicker(e.target.value)}
                 placeholder="Filter by Ticker..."
                 className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
               />
             </div>
             <div className="flex bg-white dark:bg-darkCard p-1 rounded-xl border border-gray-200 dark:border-darkBorder shrink-0">
               {['ALL', 'BUY', 'SELL'].map(type => (
                 <button 
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === type ? 'bg-gray-100 dark:bg-darkBorder text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {type}
                 </button>
               ))}
             </div>
          </div>

          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm overflow-hidden flex-1 min-h-[400px]">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <h2 className="font-black text-gray-900 dark:text-white">Execution History</h2>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-darkBg">{filteredHistory.length} Trades</span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-gray-400">
                <Book size={40} className="mb-3 opacity-20" />
                <p className="font-semibold text-sm">No trades found</p>
                <p className="text-xs mt-1">Execute trades in the Demo Terminal to see them here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-darkBg/50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Time</th>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Side</th>
                      <th className="p-4 text-right">Shares</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                    {filteredHistory.map((h, i) => (
                      <tr key={h.id || i} className="hover:bg-gray-50 dark:hover:bg-darkBg/30 transition-colors">
                        <td className="p-4 text-gray-500 text-xs font-semibold">{new Date(h.time).toLocaleString()}</td>
                        <td className="p-4 font-black tracking-widest text-gray-900 dark:text-white">{h.ticker}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-widest rounded ${h.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {h.type}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-700 dark:text-gray-300">{h.shares}</td>
                        <td className="p-4 text-right font-bold text-gray-700 dark:text-gray-300">{formatPrice(h.price)}</td>
                        <td className="p-4 text-right font-black text-gray-900 dark:text-white">{formatPrice(h.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBookPage;
