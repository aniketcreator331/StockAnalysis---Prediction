import React, { useState, useEffect } from 'react';
import { Bell, BellOff, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useCurrency } from '../contexts/CurrencyContext';

const PriceAlertsCard = ({ currentTicker, currentPrice }) => {
  const { priceAlerts, addPriceAlert, removePriceAlert, markAlertAsTriggered } = useUserData();
  const { formatLocalPrice, currency } = useCurrency();
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');
  
  // Create an alert 
  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!targetPrice || isNaN(targetPrice)) return;
    addPriceAlert(currentTicker, Number(targetPrice), condition);
    setTargetPrice('');
  };

  // Monitor stock price changes relative to alerts
  useEffect(() => {
    if (!currentPrice || isNaN(currentPrice)) return;

    priceAlerts.forEach((alert) => {
      // Only check alerts for the current ticker that haven't been triggered yet
      if (alert.ticker === currentTicker && !alert.isTriggered) {
        if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
          markAlertAsTriggered(alert.id);
        } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
          markAlertAsTriggered(alert.id);
        }
      }
    });

  }, [currentPrice, currentTicker, priceAlerts, markAlertAsTriggered]);

  const activeAlerts = priceAlerts.filter(a => a.ticker === currentTicker && !a.isTriggered);
  const triggeredAlerts = priceAlerts.filter(a => a.ticker === currentTicker && a.isTriggered);

  return (
    <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
          <Bell className="mr-2 text-primary" size={20}/>
          Price Alerts for {currentTicker}
        </h2>
      </div>

      <form onSubmit={handleAddAlert} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <select 
            value={condition} 
            onChange={(e) => setCondition(e.target.value)}
            className="px-4 py-2 bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer border-r border-gray-200 dark:border-darkBorder"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input 
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={`Target in USD (e.g. ${currentPrice ? (currentPrice * 1.05).toFixed(2) : '150'})`}
            className="flex-1 px-4 py-2 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[150px]"
            required
          />
        </div>
        <button 
          type="submit"
          className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center"
        >
          <Bell size={16} className="mr-2" />
          Set Alert
        </button>
      </form>

      {activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          <BellOff size={24} className="mx-auto mb-2 opacity-50" />
          No alerts set for {currentTicker}
        </div>
      ) : (
        <div className="space-y-4">
          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Active Alerts</h3>
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-center text-sm">
                    {alert.condition === 'above' ? 
                      <ArrowUpRight className="text-emerald-500 mr-3" size={18} /> : 
                      <ArrowDownRight className="text-red-500 mr-3" size={18} />
                    }
                    <span className="text-gray-700 dark:text-gray-300">
                      Alert when <strong>{currentTicker}</strong> goes <strong>{alert.condition}</strong> {formatLocalPrice(alert.targetPrice)}
                    </span>
                  </div>
                  <button 
                    onClick={() => removePriceAlert(alert.id)}
                    className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {triggeredAlerts.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Triggered Alerts</h3>
              {triggeredAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
                  <div className="flex items-center text-sm">
                    <Bell className="text-emerald-500 mr-3 animate-pulse" size={18} />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      <strong>Target Hit!</strong> {currentTicker} went {alert.condition} {formatLocalPrice(alert.targetPrice)}
                    </span>
                  </div>
                  <button 
                    onClick={() => removePriceAlert(alert.id)}
                    className="p-1.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceAlertsCard;
