import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, BarChart2, Layers, ArrowLeftRight, BookOpen, Clock, Bookmark, Search } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

const Sidebar = () => {
  const { followedStocks, searchHistory, viewHistory } = useUserData();
  return (
    <div className="w-64 flex flex-col bg-white dark:bg-darkCard border-r border-gray-200 dark:border-darkBorder transition-colors duration-200">
      <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-darkBorder">
        <Activity className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-bold tracking-wider text-gray-800 dark:text-gray-100">Stock <span className="text-primary">Analysis</span></h1>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          <Activity size={20} className="mr-4" />
          <span className="font-medium">Live Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/predictions" 
          className={({ isActive }) => 
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          <BarChart2 size={20} className="mr-4" />
          <span className="font-medium">AI Predictions</span>
        </NavLink>

        <NavLink 
          to="/comparison" 
          className={({ isActive }) => 
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          <Layers size={20} className="mr-4" />
          <span className="font-medium">Market Overview</span>
        </NavLink>

        <NavLink 
          to="/comparetwo" 
          className={({ isActive }) => 
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          <ArrowLeftRight size={20} className="mr-4" />
          <span className="font-medium">Compare Stocks</span>
        </NavLink>

        <NavLink 
          to="/tickers" 
          className={({ isActive }) => 
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white'}`
          }
        >
          <BookOpen size={20} className="mr-4" />
          <span className="font-medium">Stock Directory</span>
        </NavLink>
      </nav>

      {/* User Data Section */}
      <div className="px-4 py-2 mt-2 space-y-4 max-h-48 overflow-y-auto custom-scrollbar">
        {/* Followed Stocks */}
        {followedStocks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <Bookmark size={12} className="mr-1" /> Followed
            </h3>
            <div className="flex flex-wrap gap-2">
              {followedStocks.map((stock) => (
                <span key={`follow-${stock}`} className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">
                  {stock}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Search History */}
        {searchHistory.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center mt-4">
              <Search size={12} className="mr-1" /> Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((stock, idx) => (
                <span key={`search-${stock}-${idx}`} className="px-2 py-1 bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 text-xs rounded-md">
                  {stock}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View History */}
        {viewHistory.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center mt-4">
              <Clock size={12} className="mr-1" /> Viewed
            </h3>
            <div className="flex flex-wrap gap-2">
              {viewHistory.map((stock, idx) => (
                <span key={`view-${stock}-${idx}`} className="px-2 py-1 bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 text-xs rounded-md">
                  {stock}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 m-4 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg/50 text-sm text-gray-500 dark:text-gray-400">
        <p className="font-semibold mb-2">Power Mode Active</p>
        <p>LSTM forecasting running in background via FastAPI.</p>
      </div>
    </div>
  );
};

export default Sidebar;
