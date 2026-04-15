import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stockApi } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import CandlestickChart from '../charts/CandlestickChart';
import TradeConfirmModal from '../components/TradeConfirmModal';
import { STOCK_SYMBOLS } from '../data/stockSymbols';
import { Activity, Wallet, TrendingUp, TrendingDown, DollarSign, Settings, Bell, Clock } from 'lucide-react';

const STORAGE_KEY = 'demoTradingAccount';
const STARTING_CASH = 10000;
const MAX_HISTORY = 30;

const defaultAccount = {
  cash: STARTING_CASH,
  positions: {},
  lastPrices: {},
  history: [],
  autoRules: []
};

function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function loadAccount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAccount;
    const parsed = JSON.parse(raw);
    return {
      cash: numberOrZero(parsed.cash) || STARTING_CASH,
      positions: parsed.positions ?? {},
      lastPrices: parsed.lastPrices ?? {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      autoRules: Array.isArray(parsed.autoRules) ? parsed.autoRules : []
    };
  } catch {
    return defaultAccount;
  }
}

const DemoTradingPage = () => {
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userEmail } = useAuth();

  const activeTicker = searchParams.get('ticker')?.toUpperCase() || 'AAPL';
  const marginEnabled = (() => {
    try {
      const v = localStorage.getItem(`marginEnabled_${userEmail}`);
      return v ? JSON.parse(v) : false;
    } catch {
      return false;
    }
  })();

  const [account, setAccount] = useState(() => loadAccount());
  const [tickerInput, setTickerInput] = useState(activeTicker);
  const [marketPrice, setMarketPrice] = useState(0);
  const [quantity, setQuantity] = useState('1');
  const [feedback, setFeedback] = useState('');
  const [chartData, setChartData] = useState([]);
  const [tradeSide, setTradeSide] = useState('buy');
  const [pendingTrade, setPendingTrade] = useState(null);
  
  // Phase 2 Fields
  const [tradingType, setTradingType] = useState('intraday'); // intraday, swing, positional, scalping
  const [orderType, setOrderType] = useState('market'); // market, limit, stop_loss, stop_limit
  const [targetPrice, setTargetPrice] = useState(''); 
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [newRule, setNewRule] = useState({ condition: 'below', threshold: '', action: 'buy', amount: '1' });

  const tickerSuggestions = useMemo(() => {
    const query = tickerInput.trim().toUpperCase();
    return STOCK_SYMBOLS
      .filter(symbol => !query || symbol.startsWith(query) || symbol.includes(query))
      .slice(0, 20);
  }, [tickerInput]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    if (!activeTicker) return;

    let alive = true;

    const fetchPrice = async () => {
      try {
        const data = await stockApi.getRealtimePrice(activeTicker);
        if (!alive || !data || data.error) return;
        const p = numberOrZero(data.price);
        setMarketPrice(p);
        
        setAccount(prev => {
          const newState = {
            ...prev,
            lastPrices: { ...prev.lastPrices, [activeTicker]: p }
          };
          
          // Basic Auto-Rules Engine implementation
          if (newState.autoRules && newState.autoRules.length > 0) {
             const triggeredRules = newState.autoRules.filter(rule => 
                rule.ticker === activeTicker && !rule.triggered &&
                ((rule.condition === 'below' && p <= rule.threshold) || (rule.condition === 'above' && p >= rule.threshold))
             );
             // Trigger rule visually (actual execution would be here)
             if (triggeredRules.length) {
                console.log("Rule triggered: ", triggeredRules);
                // Update local state to mark triggered
                newState.autoRules = newState.autoRules.map(r => 
                    triggeredRules.find(tr => tr.id === r.id) ? { ...r, triggered: true } : r
                );
                // Send Browser Notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  triggeredRules.forEach(r => {
                      new Notification(`🤖 Auto-Trade Rule Triggered`, {
                          body: `Executed ${r.action.toUpperCase()} ${r.amount} shares of ${r.ticker} at $${p}`,
                          icon: '/favicon.ico'
                      });
                  });
                }
             }
          }
          return newState;
        });
      } catch {}
    };

    fetchPrice();
    const id = setInterval(fetchPrice, 30000);

    const fetchChart = async () => {
      try {
        const cData = await stockApi.getChartData(activeTicker, '1d', '1m');
        if (alive && cData) setChartData(cData);
      } catch {}
    };
    fetchChart();

    return () => { alive = false; clearInterval(id); };
  }, [activeTicker]);

  const position = account.positions[activeTicker] || { shares: 0, avgCost: 0 };
  const tradeQty = Math.max(0, Math.floor(numberOrZero(quantity)));
  // If limit/stop order, price logic changes visually
  const execPrice = (orderType === 'market' || !targetPrice) ? marketPrice : numberOrZero(targetPrice);
  const tradeValue = tradeQty * numberOrZero(execPrice);

  const portfolio = useMemo(() => {
    const entries = Object.entries(account.positions)
      .filter(([, p]) => numberOrZero(p.shares) > 0)
      .map(([ticker, p]) => {
        const shares = numberOrZero(p.shares);
        const avgCost = numberOrZero(p.avgCost);
        const current = ticker === activeTicker ? numberOrZero(marketPrice) : numberOrZero(account.lastPrices[ticker] || avgCost);
        const value = shares * current;
        const pnl = shares * (current - avgCost);
        return { ticker, shares, avgCost, current, value, pnl };
      });
    const holdingsValue = entries.reduce((sum, item) => sum + item.value, 0);
    return { entries, holdingsValue, netWorth: account.cash + holdingsValue, totalPnl: account.cash + holdingsValue - STARTING_CASH };
  }, [account.positions, account.cash, account.lastPrices, activeTicker, marketPrice]);

  const availablePurchasingPower = marginEnabled ? account.cash * 2 : account.cash;

  const setPercentageQty = (percent) => {
    if (execPrice <= 0) return;
    if (tradeSide === 'buy') {
      setQuantity(Math.floor((availablePurchasingPower * percent) / execPrice).toString());
    } else {
      setQuantity(Math.floor(position.shares * percent).toString());
    }
  };

  const handleTickerSubmit = (e) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;
    setSearchParams({ ticker: tickerInput.trim().toUpperCase() });
    setFeedback('');
  };
  
  const addHistory = (row) => {
    setAccount((prev) => ({
      ...prev,
      history: [row, ...prev.history].slice(0, MAX_HISTORY)
    }));
  };

  const executeTrade = () => {
    setFeedback('');
    if (orderType !== 'market') {
      setFeedback('Note: Advanced orders simulate execution immediately at market price for now.');
    }
    if (marketPrice <= 0) return setFeedback('Market price unavailable.');
    if (tradeQty <= 0) return setFeedback('Valid quantity required.');

    setPendingTrade({
      side: tradeSide,
      ticker: activeTicker,
      qty: tradeQty,
      execPrice,
      tradeValue,
      orderType,
      availablePurchasingPower,
    });
  };

  const confirmTrade = () => {
    if (!pendingTrade) return;
    const { side, qty, execPrice: pendingExecPrice, tradeValue: pendingTradeValue, ticker } = pendingTrade;

    if (side === 'buy') {
      if (pendingTradeValue > availablePurchasingPower) return setFeedback(`Insufficient purchasing power. Max ${formatPrice(availablePurchasingPower)}.`);
      setAccount(prev => {
        const p = prev.positions[activeTicker] || { shares: 0, avgCost: 0 };
        return {
          ...prev, cash: prev.cash - tradeValue,
          positions: { ...prev.positions, [ticker]: { shares: p.shares + qty, avgCost: ((p.shares * p.avgCost) + pendingTradeValue) / (p.shares + qty) } },
          lastPrices: { ...prev.lastPrices, [ticker]: pendingExecPrice }
        };
      });
      addHistory({ id: Date.now().toString(), type: 'BUY', ticker, shares: qty, price: pendingExecPrice, total: pendingTradeValue, time: new Date().toISOString() });
      setFeedback(`Bought ${qty} ${ticker}`);
    } else {
      if (qty > position.shares) return setFeedback(`You only hold ${position.shares} shares.`);
      const proceeds = qty * pendingExecPrice;
      setAccount(prev => {
        const p = prev.positions[ticker];
        const rem = p.shares - qty;
        const nPos = { ...prev.positions };
        if (rem <= 0) delete nPos[ticker]; else nPos[ticker] = { shares: rem, avgCost: p.avgCost };
        return { ...prev, cash: prev.cash + proceeds, positions: nPos, lastPrices: { ...prev.lastPrices, [ticker]: pendingExecPrice } };
      });
      addHistory({ id: Date.now().toString(), type: 'SELL', ticker, shares: qty, price: pendingExecPrice, total: proceeds, time: new Date().toISOString() });
      setFeedback(`Sold ${qty} ${ticker}`);
    }

    setPendingTrade(null);
  };

  const saveAutoRule = () => {
    if ('Notification' in window) Notification.requestPermission();
    setAccount(prev => ({
        ...prev,
        autoRules: [...(prev.autoRules||[]), {
            id: Date.now().toString(), ticker: activeTicker, ...newRule, triggered: false
        }]
    }));
    setShowRuleBuilder(false);
    setFeedback('Auto-trade rule saved.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white dark:bg-darkCard p-4 rounded-2xl border border-gray-100 dark:border-darkBorder flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl hidden md:block">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Trading Terminal</h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Advanced Simulator</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-darkBg px-4 py-2 rounded-xl border border-gray-200 dark:border-darkBorder">
           <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Net Worth</span>
              <span className="text-sm font-black dark:text-white">{formatPrice(portfolio.netWorth)}</span>
           </div>
           <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Available {marginEnabled && <span className="text-amber-500">(2X Margin)</span>}</span>
              <span className="text-sm font-black text-primary">{formatPrice(availablePurchasingPower)}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Total PnL</span>
              <span className={`text-sm font-black flex items-center ${portfolio.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {portfolio.totalPnl >= 0 ? '+' : ''}{formatPrice(portfolio.totalPnl)}
              </span>
           </div>
        </div>
        <form onSubmit={handleTickerSubmit} className="flex gap-2">
          <input
            type="text"
            list="terminal-symbols"
            value={tickerInput}
            onChange={e => setTickerInput(e.target.value.toUpperCase())}
            placeholder="Search Symbol"
            className="w-full md:w-32 px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm font-bold focus:outline-none focus:border-primary"
          />
          <datalist id="terminal-symbols">
            {tickerSuggestions.map(symbol => <option key={symbol} value={symbol} />)}
          </datalist>
          <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600">LOAD</button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Charts & Portfolio */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-darkCard p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
            <div className="px-4 pt-4 pb-2 flex justify-between items-center">
              <div>
                 <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-widest">{activeTicker}</h2>
                 </div>
                 <p className="text-sm font-bold mt-1 text-gray-800 dark:text-gray-200">
                    {formatPrice(marketPrice)} <span className="text-emerald-500 text-xs ml-1 animate-pulse">● LIVE</span>
                 </p>
              </div>
            </div>
            <div className="px-2">
               <CandlestickChart data={chartData} timeInterval="1m" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Advanced Order Form */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder overflow-hidden">
             
             {/* Trading System Selector */}
             <div className="p-3 bg-gray-50 dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder">
                <select value={tradingType} onChange={e => setTradingType(e.target.value)} className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                   <option value="intraday">Intraday (Day Tradng)</option>
                   <option value="swing">Swing Trading (Multi-day)</option>
                   <option value="positional">Positional (Long Term)</option>
                   <option value="scalping">Scalping (Seconds/Mins)</option>
                </select>
             </div>

             {/* Buy/Sell Tabs */}
             <div className="flex w-full border-b border-gray-200 dark:border-darkBorder">
               <button onClick={() => setTradeSide('buy')} className={`flex-1 py-4 text-sm font-black uppercase tracking-wider ${tradeSide === 'buy' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400'}`}>Buy</button>
               <button onClick={() => setTradeSide('sell')} className={`flex-1 py-4 text-sm font-black uppercase tracking-wider ${tradeSide === 'sell' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-gray-400'}`}>Sell</button>
             </div>

             <div className="p-5 space-y-5">
                {/* Order Type Dropdown */}
                <div>
                   <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Order Type</label>
                   <select value={orderType} onChange={e => setOrderType(e.target.value)} className="w-full bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white">
                      <option value="market">Market Order</option>
                      <option value="limit">Limit Order</option>
                      <option value="stop_loss">Stop Loss</option>
                      <option value="stop_limit">Stop Limit</option>
                   </select>
                </div>

                <div className="space-y-4">
                  {orderType !== 'market' && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Target/Trigger Price</label>
                      <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm font-bold dark:text-white" />
                    </div>
                  )}

                  <div>
                     <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Quantity</label>
                     <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full px-3 py-2.5 bg-white dark:bg-darkBg border-2 rounded-xl text-sm font-bold dark:text-white ${tradeSide === 'buy' ? 'focus:border-emerald-500' : 'focus:border-rose-500'}`} />
                     <div className="grid grid-cols-4 gap-2 mt-2">
                        {[0.25, 0.50, 0.75, 1.0].map(pct => (
                           <button key={pct} onClick={() => setPercentageQty(pct)} className="py-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-darkBg rounded transition-colors">{pct === 1.0 ? 'MAX' : `${pct*100}%`}</button>
                        ))}
                     </div>
                  </div>

                  <div className="pt-2">
                     <div className="flex justify-between text-sm font-black text-gray-800 dark:text-white">
                        <span>Est. Total</span>
                        <span>{formatPrice(tradeValue)}</span>
                     </div>
                  </div>

                  <button onClick={executeTrade} className={`w-full py-3.5 rounded-xl text-white text-sm font-black tracking-widest uppercase shadow-lg ${tradeSide === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'}`}>
                     PLACE {tradeSide} {orderType} ORDER
                  </button>

                  {feedback && <div className="text-center text-xs font-bold text-primary mt-2">{feedback}</div>}
                </div>
             </div>
          </div>
          
          {/* Auto Trade Module */}
          <div className="bg-white dark:bg-darkCard p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-gray-100 flex items-center gap-2"><Settings size={14}/> Auto-Trade Rules</h2>
             </div>

             <button onClick={() => setShowRuleBuilder(!showRuleBuilder)} className="w-full py-2 border border-dashed border-primary/50 text-primary rounded-xl text-xs font-bold hover:bg-primary/5">
                + Add Trading Rule
             </button>

             {showRuleBuilder && (
               <div className="mt-3 bg-gray-50 dark:bg-darkBg p-3 rounded-xl border border-gray-200 dark:border-darkBorder space-y-2">
                 <select value={newRule.action} onChange={e=>setNewRule(f=>({...f, action: e.target.value}))} className="w-full p-2 text-xs bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-black dark:text-white">
                   <option value="buy">BUY {activeTicker}</option>
                   <option value="sell">SELL {activeTicker}</option>
                 </select>
                 <div className="flex items-center gap-2 text-xs">
                    <span>if price is</span>
                    <select value={newRule.condition} onChange={e=>setNewRule(f=>({...f, condition: e.target.value}))} className="flex-1 p-2 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-black dark:text-white">
                      <option value="below">Below</option>
                      <option value="above">Above</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-500">$</span>
                    <input type="number" placeholder="Price" value={newRule.threshold} onChange={e=>setNewRule(f=>({...f, threshold: e.target.value}))} className="flex-1 p-2 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-black dark:text-white" />
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                    <span>Qty</span>
                    <input type="number" placeholder="Shares" value={newRule.amount} onChange={e=>setNewRule(f=>({...f, amount: e.target.value}))} className="flex-1 p-2 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-black dark:text-white" />
                 </div>
                 <button onClick={saveAutoRule} className="w-full bg-primary text-white py-2 rounded font-bold text-xs">Save Rule</button>
               </div>
             )}

             <div className="mt-4 space-y-2">
               {account.autoRules?.filter(r => r.ticker === activeTicker).map(rule => (
                  <div key={rule.id} className="text-[10px] p-2 bg-gray-50 dark:bg-darkBorder rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700">
                     <span><b>{rule.action.toUpperCase()}</b> {rule.amount} @ {rule.condition} ${rule.threshold}</span>
                     <span className={rule.triggered ? 'text-emerald-500' : 'text-amber-500'}>{rule.triggered ? 'Executed' : 'Active'}</span>
                  </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <TradeConfirmModal
        isOpen={Boolean(pendingTrade)}
        title={pendingTrade?.side === 'buy' ? 'Confirm Buy Order' : 'Confirm Sell Order'}
        details={pendingTrade ? [
          { label: 'Ticker', value: pendingTrade.ticker },
          { label: 'Side', value: pendingTrade.side.toUpperCase() },
          { label: 'Quantity', value: pendingTrade.qty },
          { label: 'Order Type', value: pendingTrade.orderType.toUpperCase() },
          { label: 'Estimated Price', value: formatPrice(pendingTrade.execPrice) },
          { label: 'Estimated Total', value: formatPrice(pendingTrade.tradeValue) },
        ] : []}
        warning="Check the ticker, quantity, and order type carefully before confirming. This action will place the order immediately in the demo account."
        confirmLabel={pendingTrade?.side === 'buy' ? 'Buy Now' : 'Sell Now'}
        confirmTone={pendingTrade?.side === 'buy' ? 'emerald' : 'red'}
        onConfirm={confirmTrade}
        onCancel={() => setPendingTrade(null)}
      />
    </div>
  );
};

export default DemoTradingPage;
