import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/api';
import MetricCard from '../components/MetricCard';
import CandlestickChart from '../charts/CandlestickChart';
import { Banknote, TrendingUp, TrendingDown, Clock, Activity, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUserData } from '../contexts/UserDataContext';
import PriceAlertsCard from '../components/PriceAlertsCard';

const Dashboard = () => {
  const { formatPrice } = useCurrency();
  const { toggleFollowStock, isFollowing, addViewHistory, addSearchHistory } = useUserData();
  const [ticker, setTicker] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervalOption, setIntervalOption] = useState('1d');
  const [periodOption, setPeriodOption] = useState('3mo');

  const fetchData = async () => {
    setLoading(true);
    try {
      const dbData = await stockApi.getDashboardData(ticker);
      setDashboardData(dbData);
      
      // Track view history on successful fetch
      if (dbData && dbData.symbol) {
        addViewHistory(dbData.symbol);
      }
      
      const cData = await stockApi.getChartData(ticker, periodOption, intervalOption);
      setChartData(cData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto Refresh every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      fetchData();
    }, 300000);

    return () => clearInterval(interval);
  }, [ticker, periodOption, intervalOption]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const formattedTicker = searchQuery.toUpperCase();
      setTicker(formattedTicker);
      addSearchHistory(formattedTicker);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
              {dashboardData?.symbol || ticker} <span className="text-primary font-medium ml-2 mr-2">Overview</span>
            </h1>
            <button 
              onClick={() => toggleFollowStock(dashboardData?.symbol || ticker)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-darkBorder transition-colors focus:outline-none"
              title="Follow/Unfollow Stock"
            >
              {isFollowing(dashboardData?.symbol || ticker) ? (
                <BookmarkCheck size={24} className="text-primary fill-primary/20" />
              ) : (
                <Bookmark size={24} className="text-gray-400 hover:text-primary" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <Clock size={14} className="mr-1" />
            Last updated: {dashboardData?.timestamp || 'Loading...'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative w-full md:w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all"
            />
          </form>

          <select 
            value={periodOption} 
            onChange={(e) => setPeriodOption(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="1d">1 Day</option>
            <option value="5d">5 Days</option>
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="1y">1 Year</option>
          </select>
          
          <select 
            value={intervalOption} 
            onChange={(e) => setIntervalOption(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            {periodOption === '1d' && <option value="1m">1 Min</option>}
            {['1d','5d'].includes(periodOption) && <option value="5m">5 Min</option>}
            {['1d','5d','1mo'].includes(periodOption) && <option value="15m">15 Min</option>}
            {['1d','5d','1mo'].includes(periodOption) && <option value="1h">1 Hour</option>}
            <option value="1d">1 Day</option>
          </select>
        </div>
      </div>

      {loading && !dashboardData ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Current Price" 
              value={formatPrice(dashboardData?.price)} 
              icon={Banknote}
              colorClass="bg-blue-500" 
              change={dashboardData?.daily_growth}
            />
            <MetricCard 
              title="Daily High" 
              value={formatPrice(dashboardData?.high)} 
              icon={TrendingUp}
              colorClass="bg-emerald-500" 
            />
            <MetricCard 
              title="Daily Low" 
              value={formatPrice(dashboardData?.low)} 
              icon={TrendingDown}
              colorClass="bg-rose-500" 
            />
            <MetricCard 
              title="Volume Traded" 
              value={(dashboardData?.volume / 1000000)?.toFixed(2) + 'M'} 
              icon={Activity}
              colorClass="bg-indigo-500" 
            />
          </div>

          {/* Lower Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Activity className="mr-2 text-primary" size={20}/>
                Price History
              </h2>
              <CandlestickChart data={chartData} timeInterval={intervalOption} />
            </div>

            {/* Price Alerts Section */}
            <div className="lg:col-span-1">
              <PriceAlertsCard 
                currentTicker={ticker} 
                currentPrice={dashboardData?.price} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
