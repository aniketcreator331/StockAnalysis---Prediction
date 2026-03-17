import React from 'react';
import { BookOpen, Search } from 'lucide-react';

const TickersPage = () => {
  const stockKeys = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms (Facebook)' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'BAC', name: 'Bank of America Corp.' },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'INTC', name: 'Intel Corp.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
    { symbol: 'CVX', name: 'Chevron Corp.' },
    { symbol: 'COST', name: 'Costco Wholesale Corp.' },
    { symbol: 'MCD', name: 'McDonald\'s Corp.' },
    { symbol: 'T', name: 'AT&T Inc.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <BookOpen className="text-primary mr-3" />
            Stock Keys Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            A handy reference for common stock ticker symbols you can use across the application.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stockKeys.map((stock, idx) => (
            <div key={idx} className="flex items-center p-4 border border-gray-200 dark:border-darkBorder rounded-xl hover:bg-gray-50 dark:hover:bg-darkBg/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-4 shrink-0">
                {stock.symbol.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white tracking-wider">{stock.symbol}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-32 md:w-40">{stock.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickersPage;
