import React, { useState } from 'react';
import { stockApi } from '../services/api';
import MetricCard from '../components/MetricCard';
import { ArrowLeftRight, Banknote, TrendingUp, TrendingDown, Activity, Search } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const CompareTwoPage = () => {
  const { formatPrice } = useCurrency();
  const [ticker1, setTicker1] = useState('AAPL');
  const [ticker2, setTicker2] = useState('MSFT');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComparisonData = async () => {
    if (!ticker1.trim() || !ticker2.trim()) return;
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        stockApi.getDashboardData(ticker1),
        stockApi.getDashboardData(ticker2)
      ]);
      setData1(res1);
      setData2(res2);
    } catch (error) {
      console.error("Error fetching comparison data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchComparisonData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <ArrowLeftRight className="text-primary mr-3" />
            Stock Comparison Tool
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Compare two stocks side by side to see metrics such as price, daily growth, volume, and volatility.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={ticker1}
              onChange={(e) => setTicker1(e.target.value.toUpperCase())}
              placeholder="Stock 1 (e.g. AAPL)" 
              className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all uppercase"
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <span className="font-bold text-gray-400">VS</span>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={ticker2}
              onChange={(e) => setTicker2(e.target.value.toUpperCase())}
              placeholder="Stock 2 (e.g. MSFT)" 
              className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all uppercase"
              required
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            {loading ? 'Comparing...' : 'Compare Insights'}
          </button>
        </form>

        {loading && !data1 && !data2 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data1 && data2 && (
          <div className="p-4 bg-gray-50 dark:bg-darkBg rounded-xl border border-gray-100 dark:border-darkBorder">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-darkBorder">
              {/* Stock 1 */}
              <div className="space-y-4 pt-4 lg:pt-0 lg:pr-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                    {data1.symbol.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{data1.symbol}</h2>
                    <p className="text-gray-500 text-sm">Last Update: {data1.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCard title="Price" value={formatPrice(data1.price)} icon={Banknote} colorClass="bg-blue-500" />
                  <MetricCard 
                    title="Daily Growth" 
                    value={`${data1.daily_growth > 0 ? '+' : ''}${data1.daily_growth?.toFixed(2)}%`} 
                    icon={data1.daily_growth >= 0 ? TrendingUp : TrendingDown} 
                    colorClass={data1.daily_growth >= 0 ? "bg-emerald-500" : "bg-red-500"} 
                  />
                  <MetricCard title="High" value={formatPrice(data1.high)} icon={TrendingUp} colorClass="bg-indigo-500" />
                  <MetricCard title="Low" value={formatPrice(data1.low)} icon={TrendingDown} colorClass="bg-orange-500" />
                  <MetricCard title="Volume" value={(data1.volume / 1000000)?.toFixed(2) + 'M'} icon={Activity} colorClass="bg-purple-500" />
                  <MetricCard title="Volatility" value={`${data1.volatility?.toFixed(2)}%`} icon={Activity} colorClass="bg-amber-500" />
                </div>
              </div>

              {/* Stock 2 */}
              <div className="space-y-4 pt-8 lg:pt-0 lg:pl-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl">
                    {data2.symbol.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{data2.symbol}</h2>
                    <p className="text-gray-500 text-sm">Last Update: {data2.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCard title="Price" value={formatPrice(data2.price)} icon={Banknote} colorClass="bg-blue-500" />
                  <MetricCard 
                    title="Daily Growth" 
                    value={`${data2.daily_growth > 0 ? '+' : ''}${data2.daily_growth?.toFixed(2)}%`} 
                    icon={data2.daily_growth >= 0 ? TrendingUp : TrendingDown} 
                    colorClass={data2.daily_growth >= 0 ? "bg-emerald-500" : "bg-red-500"} 
                  />
                  <MetricCard title="High" value={formatPrice(data2.high)} icon={TrendingUp} colorClass="bg-indigo-500" />
                  <MetricCard title="Low" value={formatPrice(data2.low)} icon={TrendingDown} colorClass="bg-orange-500" />
                  <MetricCard title="Volume" value={(data2.volume / 1000000)?.toFixed(2) + 'M'} icon={Activity} colorClass="bg-purple-500" />
                  <MetricCard title="Volatility" value={`${data2.volatility?.toFixed(2)}%`} icon={Activity} colorClass="bg-amber-500" />
                </div>
              </div>
            </div>
            
            {/* Quick Summary Comparer logic */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-darkBorder">
              <h3 className="text-lg font-bold mb-4 dark:text-white text-center tracking-wide">🏆 Comparison Verdict</h3>
              <div className="flex flex-col md:flex-row justify-around text-center gap-4">
                <div className="p-4 bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-100 dark:border-darkBorder">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Higher Growth Today</p>
                  <p className="text-xl font-bold dark:text-white mt-1">
                    {data1.daily_growth > data2.daily_growth ? data1.symbol : data2.symbol}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-100 dark:border-darkBorder">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Higher Volume Traded</p>
                  <p className="text-xl font-bold dark:text-white mt-1">
                    {data1.volume > data2.volume ? data1.symbol : data2.symbol}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-100 dark:border-darkBorder">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Less Visually Volatile</p>
                  <p className="text-xl font-bold dark:text-white mt-1">
                    {data1.volatility < data2.volatility ? data1.symbol : data2.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareTwoPage;
