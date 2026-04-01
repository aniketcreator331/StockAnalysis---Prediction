import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, Briefcase, Activity, X, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, type, ticker, quantity, price, total, balance }) => {
  if (!isOpen) return null;

  const isBuy = type === 'buy';
  const accentColor = isBuy ? 'emerald' : 'red';
  const remainingBalance = isBuy ? balance - total : balance + total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-darkCard w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-darkBorder overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-gray-100 dark:border-darkBorder bg-${accentColor}-50 dark:bg-${accentColor}-900/20`}>
          <div className="flex items-center gap-3">
            {isBuy
              ? <TrendingUp size={22} className="text-emerald-500" />
              : <TrendingDown size={22} className="text-red-500" />
            }
            <h2 className={`text-xl font-extrabold text-${accentColor}-600 dark:text-${accentColor}-400`}>
              Confirm {isBuy ? 'Buy' : 'Sell'} Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-darkBorder transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-darkBg rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Stock</span>
              <span className="font-extrabold text-gray-900 dark:text-white text-lg tracking-widest">{ticker}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Quantity</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{quantity} shares</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Price per share</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">${price.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between items-center pt-3 border-t border-gray-200 dark:border-darkBorder`}>
              <span className="text-sm font-extrabold text-gray-700 dark:text-gray-300">Total {isBuy ? 'Cost' : 'Proceeds'}</span>
              <span className={`text-xl font-extrabold text-${accentColor}-500`}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Balance Impact */}
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-500">Balance After Order</span>
            <span className={`font-bold ${remainingBalance < 0 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
              ${remainingBalance.toFixed(2)}
            </span>
          </div>

          {/* Warning if insufficient */}
          {isBuy && balance < total && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
              <AlertTriangle size={16} />
              Insufficient balance to complete this order!
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-darkBg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isBuy && balance < total}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
              ${isBuy
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
              }`}
          >
            Confirm {isBuy ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DemoTradingPage = () => {
  const { formatPrice } = useCurrency();
  const { userEmail } = useAuth();

  const getSavedData = (key, defaultVal) => {
    const saved = localStorage.getItem(`${key}_${userEmail}`);
    return saved ? JSON.parse(saved) : defaultVal;
  };

  const [balance, setBalance] = useState(() => getSavedData('demoBalance', 100000));
  const [ticker, setTicker] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  const [portfolio, setPortfolio] = useState(() => getSavedData('demoPortfolio', [
    { ticker: 'AAPL', quantity: 15, avgPrice: 150 },
    { ticker: 'MSFT', quantity: 10, avgPrice: 280 }
  ]));

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });

  useEffect(() => {
    setBalance(getSavedData('demoBalance', 100000));
    setPortfolio(getSavedData('demoPortfolio', [
      { ticker: 'AAPL', quantity: 15, avgPrice: 150 },
      { ticker: 'MSFT', quantity: 10, avgPrice: 280 }
    ]));
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(`demoBalance_${userEmail}`, JSON.stringify(balance));
  }, [balance, userEmail]);

  useEffect(() => {
    localStorage.setItem(`demoPortfolio_${userEmail}`, JSON.stringify(portfolio));
  }, [portfolio, userEmail]);

  const mockPrices = {
    'AAPL': 185.50, 'MSFT': 335.20, 'GOOGL': 140.00,
    'TSLA': 210.10, 'AMZN': 130.40, 'NVDA': 167.61,
    'META': 520.00, 'JPM': 195.00, 'NFLX': 610.00, 'V': 272.00
  };

  const currentPrice = mockPrices[ticker] || 150.00;
  const orderTotal = currentPrice * quantity;

  // Opens the modal — buy or sell
  const openConfirm = (type) => {
    setConfirmModal({ isOpen: true, type });
  };

  const closeConfirm = () => setConfirmModal({ isOpen: false, type: null });

  const executeBuy = () => {
    const cost = currentPrice * quantity;
    if (balance >= cost) {
      setBalance(b => b - cost);
      setPortfolio(prev => {
        const existing = prev.find(p => p.ticker === ticker);
        if (existing) {
          return prev.map(p => p.ticker === ticker
            ? { ...p, quantity: p.quantity + quantity, avgPrice: ((p.avgPrice * p.quantity) + cost) / (p.quantity + quantity) }
            : p
          );
        }
        return [...prev, { ticker, quantity, avgPrice: currentPrice }];
      });
    }
    closeConfirm();
  };

  const executeSell = () => {
    const existing = portfolio.find(p => p.ticker === ticker);
    if (existing && existing.quantity >= quantity) {
      setBalance(b => b + (currentPrice * quantity));
      setPortfolio(prev =>
        prev.map(p => p.ticker === ticker ? { ...p, quantity: p.quantity - quantity } : p)
            .filter(p => p.quantity > 0)
      );
    }
    closeConfirm();
  };

  const totalPortfolioValue = portfolio.reduce((acc, stock) => {
    const p = mockPrices[stock.ticker] || stock.avgPrice;
    return acc + (p * stock.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        onClose={closeConfirm}
        onConfirm={confirmModal.type === 'buy' ? executeBuy : executeSell}
        ticker={ticker}
        quantity={quantity}
        price={currentPrice}
        total={orderTotal}
        balance={balance}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <RefreshCw className="mr-3 text-primary" />
            Demo <span className="text-primary ml-2">Trading</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Practice buying and selling stocks with real-time market simulation.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Available Cash</p>
          <div className="text-3xl font-extrabold text-green-500 tracking-tight">
            {formatPrice(balance)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Widget */}
        <div className="lg:col-span-1 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <ShoppingCart className="mr-2 text-primary text-sm" /> Place Order
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Ticker Symbol</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-semibold"
                placeholder="e.g. AAPL"
              />
            </div>

            <div className="bg-gray-50 dark:bg-darkBg p-4 border border-gray-100 dark:border-darkBorder rounded-xl flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Latest Price</span>
              <span className="text-xl font-bold dark:text-white">{formatPrice(currentPrice)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quantity (Shares)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-semibold"
              />
            </div>

            {/* Order summary preview */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Estimated Total</span>
              <span className="font-extrabold text-primary text-lg">{formatPrice(orderTotal)}</span>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={() => openConfirm('buy')}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2"
              >
                <TrendingUp size={16} /> Buy
              </button>
              <button
                onClick={() => openConfirm('sell')}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all flex justify-center items-center gap-2"
              >
                <TrendingDown size={16} /> Sell
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <Briefcase className="mr-2 text-primary" size={20} /> My Portfolio
            </h2>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Net Worth</p>
              <p className="text-lg font-bold text-primary">{formatPrice(balance + totalPortfolioValue)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-darkBorder text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-4 font-semibold text-sm">Asset</th>
                  <th className="py-3 px-4 font-semibold text-sm text-right">Shares</th>
                  <th className="py-3 px-4 font-semibold text-sm text-right">Avg Cost</th>
                  <th className="py-3 px-4 font-semibold text-sm text-right">Current Value</th>
                  <th className="py-3 px-4 font-semibold text-sm text-right">Return</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">No assets in portfolio. Start trading!</td>
                  </tr>
                ) : (
                  portfolio.map((item, idx) => {
                    const price = mockPrices[item.ticker] || item.avgPrice;
                    const value = price * item.quantity;
                    const totalCost = item.avgPrice * item.quantity;
                    const profit = value - totalCost;
                    const percentReturn = ((profit / totalCost) * 100).toFixed(2);
                    const isProfit = profit >= 0;

                    return (
                      <tr key={idx} className="border-b border-gray-50 dark:border-darkBorder/50 hover:bg-gray-50 dark:hover:bg-darkBg/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Activity size={14} className="mr-2 text-primary opacity-50" /> {item.ticker}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium text-right">{item.quantity}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-right">{formatPrice(item.avgPrice)}</td>
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white text-right">{formatPrice(value)}</td>
                        <td className={`py-4 px-4 font-bold text-right ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isProfit ? '+' : ''}{formatPrice(profit)} ({percentReturn}%)
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTradingPage;
