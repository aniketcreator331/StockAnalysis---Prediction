import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/api';
import ComparisonChart from '../charts/ComparisonChart';
import { Layers, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const ComparisonPage = () => {
  const { formatPrice } = useCurrency();
  const [topStocks, setTopStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStocks = async () => {
      setLoading(true);
      try {
        const dbData = await stockApi.getRecommendations();
        setTopStocks(dbData);
      } catch (error) {
        console.error("Error fetching top stocks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopStocks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <Layers className="text-primary mr-3" />
            Market Overview & AI Recommendations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Top performing tech stocks with AI-driven Buy/Hold/Sell signals.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <Activity className="mr-2 text-primary" size={20}/>
              Daily Growth Comparison %
            </h2>
            <ComparisonChart data={topStocks} />
          </div>

          <div className="bg-white dark:bg-darkCard overflow-hidden rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-darkBg/50 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Ticker</th>
                    <th scope="col" className="px-6 py-4">Price</th>
                    <th scope="col" className="px-6 py-4">Daily Growth</th>
                    <th scope="col" className="px-6 py-4">Volume</th>
                    <th scope="col" className="px-6 py-4">Volatility</th>
                    <th scope="col" className="px-6 py-4 rounded-tr-xl">AI Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {topStocks.map((stock, idx) => (
                    <tr key={idx} className="bg-white dark:bg-darkCard border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkBg transition-colors">
                      <th scope="row" className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                          {stock.symbol.charAt(0)}
                        </div>
                        {stock.symbol}
                      </th>
                      <td className="px-6 py-4 font-medium">{formatPrice(stock.price)}</td>
                      <td className={`px-6 py-4 font-bold flex items-center mt-2 ${stock.daily_growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stock.daily_growth >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {Math.abs(stock.daily_growth).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4">{(stock.volume / 1000000).toFixed(2)}M</td>
                      <td className="px-6 py-4">{stock.volatility?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max
                          ${stock.recommendation === 'Buy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                          ${stock.recommendation === 'Sell' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : ''}
                          ${stock.recommendation === 'Hold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : ''}
                        `}>
                          {stock.recommendation === 'Buy' && <TrendingUp size={12} className="mr-1" />}
                          {stock.recommendation === 'Sell' && <TrendingDown size={12} className="mr-1" />}
                          {stock.recommendation === 'Hold' && <Minus size={12} className="mr-1" />}
                          {stock.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonPage;
