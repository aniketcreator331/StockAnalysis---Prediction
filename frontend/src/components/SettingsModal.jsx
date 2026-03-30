import React, { useState } from 'react';
import { X, Moon, Sun, Globe, Bell, RefreshCw, Database, User } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const SettingsModal = ({ isOpen, onClose, darkMode, setDarkMode, user, setUser }) => {
  const { currency, setCurrency } = useCurrency();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-darkCard w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-darkBorder overflow-hidden animate-In flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-darkBorder">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-darkBorder"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Profile Section */}
          <div className="bg-gray-50 dark:bg-darkBg p-4 rounded-2xl border border-gray-100 dark:border-darkBorder mb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
              <User size={14} className="mr-1.5" /> Profile details
            </h3>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email || 'Google Authenticated'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setUser(null); onClose(); }} 
                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-gray-500 text-sm">
                <span>Not signed in with Google.</span>
              </div>
            )}
          </div>

          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-darkBg rounded-lg text-primary">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Appearance</p>
                <p className="text-sm text-gray-500">Toggle dark or light mode</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${darkMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Currency Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-darkBg rounded-lg text-primary">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Base Currency</p>
                <p className="text-sm text-gray-500">Global display currency</p>
              </div>
            </div>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm font-semibold text-gray-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          {/* Notifications Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-darkBg rounded-lg text-primary">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Push Alerts</p>
                <p className="text-sm text-gray-500">Browser price notifications</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Auto Refresh Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-darkBg rounded-lg text-primary">
                <RefreshCw size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Auto-Refresh</p>
                <p className="text-sm text-gray-500">Live data pull every 5m</p>
              </div>
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-12 h-6 rounded-full transition-colors relative ${autoRefresh ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoRefresh ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Data Sync */}
          <div className="pt-4 border-t border-gray-100 dark:border-darkBorder">
             <button 
               onClick={() => { localStorage.clear(); window.location.reload(); }}
               className="w-full py-3 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-darkBg dark:hover:bg-darkBorder text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
             >
               <Database size={16} />
               Clear Local Storage & History
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
