import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Activity, BarChart2, ArrowLeftRight,
  BookOpen, Clock, Bookmark, Search, ShoppingCart,
  Calculator, Briefcase, Zap, Info, Globe,
  Star, Bell, ChevronDown, ChevronRight, TrendingUp,
  LineChart, Layers
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: Home, label: 'Home' },
      { to: '/dashboard', icon: Activity, label: 'Dashboard', accent: 'text-primary' },
    ],
  },
  {
    label: 'Markets',
    items: [
      { to: '/market-explorer', icon: Globe, label: 'Market Explorer', accent: 'text-sky-500' },
      { to: '/comparison', icon: Layers, label: 'Market Overview', accent: 'text-indigo-500' },
      { to: '/comparetwo', icon: ArrowLeftRight, label: 'Compare Stocks' },
      { to: '/tickers', icon: BookOpen, label: 'Stock Directory' },
    ],
  },
  {
    label: 'AI & Charts',
    items: [
      { to: '/predictions', icon: BarChart2, label: 'AI Predictions', accent: 'text-violet-500' },
      { to: '/charts', icon: LineChart, label: 'Technical Charts', accent: 'text-indigo-500' },
      { to: '/intraday-fno', icon: Zap, label: 'Intraday & F&O', accent: 'text-amber-500' },
    ],
  },
  {
    label: 'Trading',
    items: [
      { to: '/demotrading', icon: ShoppingCart, label: 'Trading Terminal', accent: 'text-emerald-500' },
      { to: '/portfolio', icon: Briefcase, label: 'Portfolio', accent: 'text-blue-500' },
      { to: '/order-book', icon: BookOpen, label: 'Order Book', accent: 'text-orange-500' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/watchlist', icon: Star, label: 'Watchlist', accent: 'text-amber-400' },
      { to: '/alerts', icon: Bell, label: 'Price Alerts', accent: 'text-rose-500' },
      { to: '/calculators', icon: Calculator, label: 'Calculators', accent: 'text-purple-500' },
    ],
  },
  {
    label: 'Info',
    items: [
      { to: '/about', icon: Info, label: 'About Us', accent: 'text-indigo-400' },
    ],
  },
];

const NavItem = ({ to, icon: Icon, label, accent }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 group text-sm
      ${isActive
        ? 'bg-primary/10 text-primary dark:text-primary font-bold'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder hover:text-gray-900 dark:hover:text-white font-medium'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          size={17}
          className={`mr-3 shrink-0 transition-colors ${isActive ? 'text-primary' : (accent || 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300')}`}
        />
        <span className="truncate">{label}</span>
      </>
    )}
  </NavLink>
);

const NavGroup = ({ label, items, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
      >
        {label}
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {items.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { followedStocks, searchHistory } = useUserData();

  return (
    <div className="w-60 flex flex-col bg-white dark:bg-darkCard border-r border-gray-200 dark:border-darkBorder transition-colors duration-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-darkBorder">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-none">Stock<span className="text-primary">IQ</span></h1>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">AI Market Platform</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {NAV_GROUPS.map(group => (
          <NavGroup key={group.label} label={group.label} items={group.items} defaultOpen />
        ))}
      </nav>

      {/* Quick access - followed stocks */}
      {followedStocks.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-darkBorder">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Bookmark size={10} /> Followed
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {followedStocks.slice(0, 6).map(stock => (
              <span key={stock} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-md">
                {stock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search history */}
      {searchHistory.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-darkBorder">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Search size={10} /> Recent
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {searchHistory.slice(0, 4).map((stock, idx) => (
              <span key={`${stock}-${idx}`} className="px-2 py-0.5 bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-md">
                {stock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer brand */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-darkBorder">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/15">
          <Activity size={13} className="text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-black text-primary leading-tight">Micro Tech</p>
            <p className="text-[9px] text-gray-400">AI Stock Intelligence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
