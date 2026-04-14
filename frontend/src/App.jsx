import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import PredictionPage from './pages/PredictionPage';
import ComparisonPage from './pages/ComparisonPage';
import CompareTwoPage from './pages/CompareTwoPage';
import TickersPage from './pages/TickersPage';
import DemoTradingPage from './pages/DemoTradingPage';
import CalculatorsPage from './pages/CalculatorsPage';
import PortfolioPage from './pages/PortfolioPage';
import IntradayFnOPage from './pages/IntradayFnOPage';
import AboutPage from './pages/AboutPage';
import MarketExplorerPage from './pages/MarketExplorerPage';
import WatchlistPage from './pages/WatchlistPage';
import PriceAlertsPage from './pages/PriceAlertsPage';
import OrderBookPage from './pages/OrderBookPage';
import ChartIndicatorsPage from './pages/ChartIndicatorsPage';
import { Moon, Sun, DollarSign, HelpCircle, User, UserPlus, Settings } from 'lucide-react';
import { useCurrency } from './contexts/CurrencyContext';
import { useAuth } from './contexts/AuthContext';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import ScarletAssistant from './components/ScarletAssistant';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { authApi } from './services/api';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultLogin, setAuthDefaultLogin] = useState(true);
  const { currency, setCurrency } = useCurrency();
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-200">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-end items-center p-4 bg-white/50 dark:bg-darkCard/50 backdrop-blur-sm border-b border-gray-200 dark:border-darkBorder gap-4">
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="p-2 mr-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-darkBorder transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300"
              title="Help & Guides"
            >
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 mr-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-darkBorder transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/50">
                   <User size={16} />
                   <span className="text-sm font-bold">{user.name}</span>
                   <button onClick={() => setUser(null)} className="ml-2 text-xs opacity-70 hover:opacity-100 uppercase font-semibold text-green-900 dark:text-green-100">Logout</button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthDefaultLogin(true); setIsAuthOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder rounded-xl transition-all shadow-sm"
                  >
                    <User size={16} />
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setAuthDefaultLogin(false); setIsAuthOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/30"
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </header>
          
          <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-darkBg p-6">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/predictions" element={<PredictionPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/comparetwo" element={<CompareTwoPage />} />
                <Route path="/tickers" element={<TickersPage />} />
                <Route path="/demotrading" element={<DemoTradingPage />} />
                <Route path="/calculators" element={<CalculatorsPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/intraday-fno" element={<IntradayFnOPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/market-explorer" element={<MarketExplorerPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/alerts" element={<PriceAlertsPage />} />
                <Route path="/order-book" element={<OrderBookPage />} />
                <Route path="/charts" element={<ChartIndicatorsPage />} />
              </Routes>
            </div>
            
            {/* Footer with Founders Details */}
            <footer className="mt-8 pt-6 pb-2 border-t border-gray-200 dark:border-darkBorder flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-start gap-1">
                <p>Designed & Developed by <span className="font-semibold text-primary">Micro Tech</span></p>
                <p className="text-xs">Aniket · Arun · Prasoon · Himanshu — AI-Driven Stock Intelligence.</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                <a href="mailto:stockgpt331@gmail.com" className="flex items-center hover:text-primary transition-colors duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  stockgpt331@gmail.com
                </a>
                <a href="https://wa.me/919784087841" target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors duration-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  +91-9784087841
                </a>
              </div>
            </footer>
          </main>
        </div>
      </div>
      
      {/* Scarlet AI Assistant */}
      <ScarletAssistant />

      {/* Global Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultIsLogin={authDefaultLogin}
        setUser={setUser}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        user={user}
        setUser={setUser}
      />
    </Router>
  );
}

export default App;
