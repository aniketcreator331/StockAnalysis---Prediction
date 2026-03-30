import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, BarChart2, Briefcase, Activity } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

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

  // Mock price lookup for simplicity
  const mockPrices = {
    'AAPL': 185.50,
    'MSFT': 335.20,
    'GOOGL': 140.00,
    'TSLA': 210.10,
    'AMZN': 130.40
  };

  const currentPrice = mockPrices[ticker] || 150.00;

  const handleBuy = () => {
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
        } else {
          return [...prev, { ticker, quantity, avgPrice: currentPrice }];
        }
      });
    } else {
      alert("Insufficient balance!");
    }
  };

  const handleSell = () => {
    const existing = portfolio.find(p => p.ticker === ticker);
    if (existing && existing.quantity >= quantity) {
      setBalance(b => b + (currentPrice * quantity));
      setPortfolio(prev => {
        return prev.map(p => {
          if (p.ticker === ticker) {
            return { ...p, quantity: p.quantity - quantity };
          }
          return p;
        }).filter(p => p.quantity > 0);
      });
    } else {
      alert("Not enough shares to sell!");
    }
  };

  const totalPortfolioValue = portfolio.reduce((acc, stock) => {
    const p = mockPrices[stock.ticker] || stock.avgPrice;
    return acc + (p * stock.quantity);
  }, 0);

  return (
    <div className="space-y-6">
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

            <div className="pt-2 flex justify-between gap-3">
              <button 
                onClick={handleBuy}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all flex justify-center items-center"
              >
                Buy
              </button>
              <button 
                onClick={handleSell}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all flex justify-center items-center"
              >
                Sell
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
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white flex items-center">
                          <Activity size={14} className="mr-2 text-primary opacity-50"/> {item.ticker}
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium text-right">{item.quantity}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-right">{formatPrice(item.avgPrice)}</td>
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white text-right">{formatPrice(value)}</td>
                        <td className={`py-4 px-4 font-bold text-right ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
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
