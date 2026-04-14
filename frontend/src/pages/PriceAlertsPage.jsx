import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, TrendingUp, TrendingDown, Check, Search } from 'lucide-react';

const STORAGE_KEY = 'stockDashboard_priceAlerts';
const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function loadAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const PriceAlertsPage = () => {
  const [alerts, setAlerts] = useState(() => loadAlerts());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', condition: 'above', price: '' });
  const [prices, setPrices] = useState({});
  const [triggered, setTriggered] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  // Poll prices for all alert tickers
  useEffect(() => {
    const tickers = [...new Set(alerts.map(a => a.ticker))];
    if (!tickers.length) return;

    let alive = true;
    const poll = async () => {
      const results = {};
      await Promise.all(tickers.map(async ticker => {
        try {
          const res = await fetch(`${BACKEND}/realtime/${ticker}`);
          const data = await res.json();
          if (data.price) results[ticker] = data.price;
        } catch {}
      }));
      if (!alive) return;
      setPrices(results);

      // Check alerts
      setAlerts(prev => {
        const nowTriggered = [];
        const updated = prev.map(alert => {
          if (alert.triggered) return alert;
          const currentPrice = results[alert.ticker];
          if (!currentPrice) return alert;
          const hit =
            (alert.condition === 'above' && currentPrice >= alert.price) ||
            (alert.condition === 'below' && currentPrice <= alert.price);
          if (hit) {
            nowTriggered.push(alert);
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`📈 Price Alert: ${alert.ticker}`, {
                body: `${alert.ticker} is now $${currentPrice.toFixed(2)} (${alert.condition} $${alert.price})`,
                icon: '/favicon.ico',
              });
            }
            return { ...alert, triggered: true, triggeredAt: new Date().toISOString(), triggeredPrice: currentPrice };
          }
          return alert;
        });
        if (nowTriggered.length) setTriggered(t => [...t, ...nowTriggered]);
        return updated;
      });
    };

    poll();
    const id = setInterval(poll, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [alerts.length]);

  const requestNotifPermission = () => {
    if ('Notification' in window) Notification.requestPermission();
  };

  const addAlert = () => {
    if (!form.ticker.trim() || !form.price) return;
    const newAlert = {
      id: Date.now().toString(),
      ticker: form.ticker.trim().toUpperCase(),
      condition: form.condition,
      price: parseFloat(form.price),
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setForm({ ticker: '', condition: 'above', price: '' });
    setShowForm(false);
    requestNotifPermission();
  };

  const deleteAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const clearTriggered = () => setAlerts(prev => prev.filter(a => !a.triggered));

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Bell className="text-rose-500 w-5 h-5" />
            </div>
            Price Alerts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
            Get notified when any stock crosses your target price
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={15} /> New Alert
        </button>
      </div>

      {/* Add Alert Form */}
      {showForm && (
        <div className="bg-white dark:bg-darkCard p-6 rounded-2xl border border-primary/30 shadow-sm animate-fade-in-up">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 text-base">Create Alert</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="label-xs">Ticker Symbol</label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.ticker}
                  onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                  placeholder="e.g. AAPL"
                  className="input-field pl-8"
                />
              </div>
            </div>
            <div>
              <label className="label-xs">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                className="input-field"
              >
                <option value="above">Price goes ABOVE</option>
                <option value="below">Price goes BELOW</option>
              </select>
            </div>
            <div>
              <label className="label-xs">Target Price ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 200"
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addAlert} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-colors">
                Set Alert
              </button>
              <button onClick={() => setShowForm(false)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder text-gray-500 hover:bg-gray-50 dark:hover:bg-darkBorder transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification permission banner */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-3 rounded-xl flex items-center justify-between">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            🔔 Enable browser notifications to get real-time alerts
          </p>
          <button onClick={requestNotifPermission} className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">
            Enable
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active alerts */}
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-black text-gray-900 dark:text-white text-sm">Active Alerts</h2>
            <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 dark:bg-darkBg px-2 py-0.5 rounded-full">{activeAlerts.length}</span>
          </div>

          {!activeAlerts.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-semibold">No active alerts</p>
              <p className="text-xs mt-1">Click "New Alert" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-darkBorder">
              {activeAlerts.map(alert => {
                const currentPrice = prices[alert.ticker];
                const pos = alert.condition === 'above';
                return (
                  <div key={alert.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-darkBg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${pos ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {pos ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white">{alert.ticker}</p>
                        <p className="text-xs text-gray-500">
                          Alert when {alert.condition} <span className="font-bold text-gray-700 dark:text-gray-300">${alert.price.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {currentPrice && (
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Current</p>
                        </div>
                      )}
                      <button onClick={() => deleteAlert(alert.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Triggered alerts */}
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            <h2 className="font-black text-gray-900 dark:text-white text-sm">Triggered</h2>
            <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 dark:bg-darkBg px-2 py-0.5 rounded-full">{triggeredAlerts.length}</span>
            {triggeredAlerts.length > 0 && (
              <button onClick={clearTriggered} className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors">Clear all</button>
            )}
          </div>

          {!triggeredAlerts.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Check size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-semibold">No triggered alerts yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-darkBorder">
              {triggeredAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between px-6 py-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10">
                      <Check size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{alert.ticker}</p>
                      <p className="text-xs text-gray-500">
                        Hit {alert.condition} ${alert.price.toFixed(2)}
                        {alert.triggeredPrice && ` @ $${Number(alert.triggeredPrice).toFixed(2)}`}
                      </p>
                      {alert.triggeredAt && (
                        <p className="text-[10px] text-gray-400">{new Date(alert.triggeredAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteAlert(alert.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAlertsPage;
