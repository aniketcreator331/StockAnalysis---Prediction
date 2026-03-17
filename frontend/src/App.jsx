import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PredictionPage from './pages/PredictionPage';
import ComparisonPage from './pages/ComparisonPage';
import CompareTwoPage from './pages/CompareTwoPage';
import TickersPage from './pages/TickersPage';
import { Moon, Sun, DollarSign, HelpCircle } from 'lucide-react';
import { useCurrency } from './contexts/CurrencyContext';
import HelpModal from './components/HelpModal';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

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
            <div className="flex items-center bg-gray-100 dark:bg-darkBorder rounded-xl overflow-hidden px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <span className="text-gray-500 mr-2 text-sm font-semibold">
                CURRENCY:
              </span>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer focus:outline-none appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="p-2 mr-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-darkBorder transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300"
              title="Help & Guides"
            >
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-darkBorder transition-colors flex items-center justify-center"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
          </header>
          
          <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-darkBg p-6">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/predictions" element={<PredictionPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/comparetwo" element={<CompareTwoPage />} />
                <Route path="/tickers" element={<TickersPage />} />
              </Routes>
            </div>
            
            {/* Footer with Founders Details */}
            <footer className="mt-8 pt-6 pb-2 border-t border-gray-200 dark:border-darkBorder flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-start gap-1">
                <p>Designed & Developed by <span className="font-medium text-gray-700 dark:text-gray-300">Aniket, Arun, Prasoon, Himanshu</span></p>
                <p className="text-xs">Providing AI-Driven Insights for the Modern Stock Market Investor.</p>
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
      
      {/* Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Router>
  );
}

export default App;
