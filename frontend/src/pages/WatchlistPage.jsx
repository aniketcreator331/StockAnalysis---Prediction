import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, X, TrendingUp, TrendingDown, Search, Bookmark, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'stockDashboard_watchlists';

const defaultLists = [
  { id: 'default', name: 'My Watchlist', stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK'] },
];

function loadLists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultLists;
  } catch {
    return defaultLists;
  }
}

// ─── Price ticker for a single symbol ─────────────────────────────────────────
const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TickerPrice = ({ symbol }) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND}/realtime/${symbol}`);
        const data = await res.json();
        if (!alive) return;
        setPrice(data.price ?? null);
        setChange(data.change_percent ?? null);
      } catch {}
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [symbol]);

  if (price === null) return <span className="text-xs text-gray-400 animate-pulse">Loading...</span>;

  const pos = change >= 0;
  return (
    <div className="text-right">
      <p className="font-black text-gray-900 dark:text-white text-sm">${Number(price).toFixed(2)}</p>
      {change !== null && (
        <p className={`text-xs font-bold flex items-center justify-end gap-0.5 ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
          {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {pos ? '+' : ''}{Number(change).toFixed(2)}%
        </p>
      )}
    </div>
  );
};

// ─── Add ticker modal ──────────────────────────────────────────────────────────
const AddTickerModal = ({ onAdd, onClose }) => {
  const [input, setInput] = useState('');
  const suggestions = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BTC-USD', 'ETH-USD', 'NFLX', 'AMD', 'JPM'];

  const handleAdd = (sym) => {
    if (!sym.trim()) return;
    onAdd(sym.trim().toUpperCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-darkCard rounded-2xl shadow-2xl border border-gray-100 dark:border-darkBorder w-full max-w-sm p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-900 dark:text-white">Add to Watchlist</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-darkBorder text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAdd(input)}
              placeholder="e.g. AAPL, BTC-USD"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button onClick={() => handleAdd(input)} className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-colors">
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => handleAdd(s)} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-darkBg text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-primary hover:text-white transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main watchlist page ───────────────────────────────────────────────────────
const WatchlistPage = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState(() => loadLists());
  const [activeId, setActiveId] = useState(() => loadLists()[0]?.id || 'default');
  const [showAddTicker, setShowAddTicker] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  const activeList = lists.find(l => l.id === activeId);

  const createList = () => {
    if (!newListName.trim()) return;
    const id = Date.now().toString();
    setLists(prev => [...prev, { id, name: newListName.trim(), stocks: [] }]);
    setActiveId(id);
    setNewListName('');
    setShowNewList(false);
  };

  const deleteList = (id) => {
    if (lists.length === 1) return;
    setLists(prev => prev.filter(l => l.id !== id));
    setActiveId(lists[0].id);
  };

  const addStock = (symbol) => {
    setLists(prev => prev.map(l =>
      l.id === activeId && !l.stocks.includes(symbol)
        ? { ...l, stocks: [...l.stocks, symbol] }
        : l
    ));
  };

  const removeStock = (symbol) => {
    setLists(prev => prev.map(l =>
      l.id === activeId ? { ...l, stocks: l.stocks.filter(s => s !== symbol) } : l
    ));
  };

  return (
    <div className="space-y-6">
      {showAddTicker && <AddTickerModal onAdd={addStock} onClose={() => setShowAddTicker(false)} />}

      {/* Header */}
      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Star className="text-amber-500 w-5 h-5" />
            </div>
            Watchlists
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
            Track your favourite assets across multiple lists
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewList(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-darkBorder text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkBorder transition-all"
          >
            <Plus size={14} /> New List
          </button>
          <button
            onClick={() => setShowAddTicker(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={14} /> Add Symbol
          </button>
        </div>
      </div>

      {/* New list input */}
      {showNewList && (
        <div className="bg-white dark:bg-darkCard p-4 rounded-2xl border border-primary/30 shadow-sm flex gap-3">
          <input
            autoFocus
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createList()}
            placeholder="Watchlist name (e.g. Tech Giants)"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={createList} className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600">Create</button>
          <button onClick={() => setShowNewList(false)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder text-gray-500 text-sm hover:bg-gray-50 dark:hover:bg-darkBorder">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* List sidebar */}
        <div className="xl:col-span-3 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Your Lists</p>
          {lists.map(l => (
            <div
              key={l.id}
              onClick={() => setActiveId(l.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                activeId === l.id
                  ? 'bg-primary/10 border border-primary/30 text-primary'
                  : 'bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder text-gray-700 dark:text-gray-300 hover:border-primary/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={14} className={activeId === l.id ? 'text-primary' : 'text-gray-400'} />
                <span className="font-bold text-sm">{l.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-darkBg px-1.5 py-0.5 rounded-full">{l.stocks.length}</span>
              </div>
              {lists.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deleteList(l.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Stocks panel */}
        <div className="xl:col-span-9">
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-darkBorder">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <h2 className="font-black text-gray-900 dark:text-white">{activeList?.name || 'Watchlist'}</h2>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-darkBg px-2 py-0.5 rounded-full">
                  {activeList?.stocks.length || 0} symbols
                </span>
              </div>
            </div>

            {!activeList?.stocks.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Star size={40} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">This watchlist is empty</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Symbol" to start tracking</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-darkBorder">
                {activeList.stocks.map(symbol => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-darkBg transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                        {symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white tracking-wider">{symbol}</p>
                        <p className="text-xs text-gray-400">Click to open chart</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <TickerPrice symbol={symbol} />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/dashboard?ticker=${symbol}`)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                          title="Open Dashboard"
                        >
                          <TrendingUp size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/alerts?ticker=${symbol}`)}
                          className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition-colors"
                          title="Set Price Alert"
                        >
                          <Bell size={14} />
                        </button>
                        <button
                          onClick={() => removeStock(symbol)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
