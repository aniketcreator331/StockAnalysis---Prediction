import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase, TrendingUp, TrendingDown, Activity, DollarSign,
  PieChart, BarChart2, RefreshCw, AlertTriangle, Info,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Target, Zap, Clock
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Colors ───────────────────────────────────────────────────────────────────
const COLORS = ['#6366f1','#22d3ee','#f59e0b','#10b981','#f43f5e','#a78bfa','#fb923c','#34d399','#38bdf8','#e879f9'];

const SECTOR_MAP = {
  AAPL:'Technology', MSFT:'Technology', GOOGL:'Technology', META:'Technology',
  NVDA:'Technology', INTC:'Technology', CSCO:'Technology', ORCL:'Technology',
  ADBE:'Technology', CRM:'Technology', QCOM:'Technology', IBM:'Technology',
  TXN:'Technology', AVGO:'Technology', INTU:'Technology',
  AMZN:'Consumer', TSLA:'Consumer', WMT:'Consumer', HD:'Consumer',
  MCD:'Consumer', NKE:'Consumer', SBUX:'Consumer', COST:'Consumer',
  TGT:'Consumer', TJX:'Consumer',
  JPM:'Finance', BAC:'Finance', GS:'Finance', MS:'Finance', V:'Finance',
  MA:'Finance', WFC:'Finance', BLK:'Finance', C:'Finance', PYPL:'Finance',
  SPGI:'Finance', CME:'Finance', CB:'Finance', MMC:'Finance',
  JNJ:'Healthcare', PFE:'Healthcare', UNH:'Healthcare', ABBV:'Healthcare',
  ABT:'Healthcare', MRK:'Healthcare', TMO:'Healthcare', AMGN:'Healthcare',
  BIIB:'Healthcare', GILD:'Healthcare', SYK:'Healthcare', MDT:'Healthcare',
  ZTS:'Healthcare', CVS:'Healthcare', LLY:'Healthcare', BMY:'Healthcare',
  XOM:'Energy', CVX:'Energy', SLB:'Energy',
  DIS:'Media', NFLX:'Media', CMCSA:'Media', CHTR:'Media',
  BA:'Industrial', GE:'Industrial', CAT:'Industrial', HON:'Industrial',
  RTX:'Industrial', UNP:'Industrial', NSC:'Industrial', CSX:'Industrial',
  DE:'Industrial', MMM:'Industrial', ITW:'Industrial', FDX:'Industrial',
  KO:'Staples', PEP:'Staples', PG:'Staples', PM:'Staples', MO:'Staples',
  MDLZ:'Staples', KMB:'Staples',
  SO:'Utilities', DUK:'Utilities',
  LIN:'Materials', NEM:'Materials',
  PSA:'Real Estate', WM:'Real Estate',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${fmt(n)}%`;

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue:  { bg: 'bg-blue-50 dark:bg-blue-900/20',   ic: 'text-blue-500',   val: 'text-blue-700 dark:text-blue-300' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', ic: 'text-emerald-500', val: 'text-emerald-700 dark:text-emerald-300' },
    red:   { bg: 'bg-red-50 dark:bg-red-900/20',     ic: 'text-red-500',    val: 'text-red-600 dark:text-red-400' },
    purple:{ bg: 'bg-purple-50 dark:bg-purple-900/20',ic: 'text-purple-500', val: 'text-purple-700 dark:text-purple-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', ic: 'text-amber-500',  val: 'text-amber-700 dark:text-amber-300' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-white/40 dark:border-white/5 shadow-sm relative overflow-hidden group`}>
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`p-2.5 rounded-xl bg-white/60 dark:bg-black/20 ${c.ic}`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${c.val} leading-tight`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Allocation Donut ─────────────────────────────────────────────────────────
function AllocationDonut({ data, title }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <PieChart size={14} className="text-primary" /> {title}
      </h3>
      <div className="flex items-center gap-4">
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer>
            <RechartsPie>
              <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={72}
                dataKey="value" paddingAngle={3}
                onMouseEnter={(_, i) => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    opacity={active === null || active === i ? 1 : 0.45}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`$${fmt(v)}`, 'Value']} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0, display: 'inline-block' }} />
                <span className="text-gray-600 dark:text-gray-400 truncate font-medium">{d.name}</span>
              </div>
              <span className="text-gray-800 dark:text-gray-200 font-bold whitespace-nowrap">
                {total ? ((d.value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Risk Metrics ─────────────────────────────────────────────────────────────
function RiskMeter({ label, value, max, color }) {
  const pct = Math.min((Math.abs(value) / max) * 100, 100);
  const colors = { green: '#10b981', amber: '#f59e0b', red: '#f43f5e', blue: '#6366f1' };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400 font-semibold">{label}</span>
        <span className="font-bold text-gray-700 dark:text-gray-300">{typeof value === 'number' ? fmt(value, 3) : value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-darkBorder rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, background: colors[color] || colors.blue, height: '100%', borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PortfolioPage = () => {
  const { formatPrice } = useCurrency();
  const { userEmail } = useAuth();

  // ── Load from DemoTrading localStorage ───────────────────────────────────
  const getLocal = (key, def) => {
    try { const v = localStorage.getItem(`${key}_${userEmail}`); return v ? JSON.parse(v) : def; }
    catch { return def; }
  };

  const [balance, setBalance] = useState(() => getLocal('demoBalance', 100000));
  const [portfolio, setPortfolio] = useState(() => getLocal('demoPortfolio', [
    { ticker: 'AAPL', quantity: 15, avgPrice: 150 },
    { ticker: 'MSFT', quantity: 10, avgPrice: 280 },
    { ticker: 'NVDA', quantity: 8,  avgPrice: 130 },
    { ticker: 'TSLA', quantity: 5,  avgPrice: 195 },
    { ticker: 'GOOGL', quantity: 12, avgPrice: 125 },
  ]));

  // ── Live prices ───────────────────────────────────────────────────────────
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Phase 4: Margin Trading
  const [marginEnabled, setMarginEnabled] = useState(() => getLocal('marginEnabled', false));

  useEffect(() => {
    localStorage.setItem(`marginEnabled_${userEmail}`, JSON.stringify(marginEnabled));
  }, [marginEnabled, userEmail]);

  const fetchPrices = async () => {
    if (!portfolio.length) return;
    setLoadingPrices(true);
    const results = {};
    await Promise.allSettled(
      portfolio.map(async ({ ticker }) => {
        try {
          const r = await fetch(`${API_BASE}/api/dashboard/${ticker}`);
          const d = await r.json();
          if (d.price) results[ticker] = d;
        } catch {}
      })
    );
    setPrices(results);
    setLastRefresh(new Date());
    setLoadingPrices(false);
  };

  useEffect(() => {
    setBalance(getLocal('demoBalance', 100000));
    setPortfolio(getLocal('demoPortfolio', [
      { ticker: 'AAPL', quantity: 15, avgPrice: 150 },
      { ticker: 'MSFT', quantity: 10, avgPrice: 280 },
    ]));
  }, [userEmail]);

  useEffect(() => { fetchPrices(); }, [portfolio.length, userEmail]);

  // ── Computed metrics ──────────────────────────────────────────────────────
  const enriched = useMemo(() => portfolio.map(h => {
    const live = prices[h.ticker];
    const currentPrice = live?.price ?? h.avgPrice;
    const previousClose = live?.previous_close ?? currentPrice;
    const currentValue = currentPrice * h.quantity;
    const costBasis = h.avgPrice * h.quantity;
    const pnl = currentValue - costBasis;
    const pnlPct = costBasis ? (pnl / costBasis) * 100 : 0;
    const dayChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const dayPnl = (currentPrice - previousClose) * h.quantity;
    const sector = SECTOR_MAP[h.ticker] || 'Other';
    return { ...h, currentPrice, previousClose, currentValue, costBasis, pnl, pnlPct, dayChange, dayPnl, sector };
  }), [portfolio, prices]);

  const totalMarketValue = enriched.reduce((a, h) => a + h.currentValue, 0);
  const totalCostBasis   = enriched.reduce((a, h) => a + h.costBasis, 0);
  const totalPnL         = totalMarketValue - totalCostBasis;
  const totalPnLPct      = totalCostBasis ? (totalPnL / totalCostBasis) * 100 : 0;
  const totalDayPnL      = enriched.reduce((a, h) => a + h.dayPnl, 0);
  const effectiveCash    = marginEnabled ? balance * 2 : balance;
  const netWorth         = balance + totalMarketValue; // Net worth doesn't double, only buying power
  const investedPct      = netWorth ? (totalMarketValue / netWorth) * 100 : 0;

  // ── Allocation data ───────────────────────────────────────────────────────
  const holdingsAlloc = enriched.map(h => ({ name: h.ticker, value: h.currentValue }));

  const sectorAlloc = Object.entries(
    enriched.reduce((acc, h) => {
      acc[h.sector] = (acc[h.sector] || 0) + h.currentValue;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // ── P&L bar data ──────────────────────────────────────────────────────────
  const plBarData = enriched.map(h => ({
    ticker: h.ticker,
    'Unrealized P&L': parseFloat(h.pnl.toFixed(2)),
    'Day P&L': parseFloat(h.dayPnl.toFixed(2)),
  }));

  // ── Risk metrics (simplified) ─────────────────────────────────────────────
  const maxConc = enriched.length
    ? Math.max(...enriched.map(h => totalMarketValue ? (h.currentValue / totalMarketValue) * 100 : 0))
    : 0;
  const avgPnlPct = enriched.length ? enriched.reduce((a, h) => a + h.pnlPct, 0) / enriched.length : 0;
  const volatilityProxy = enriched.length ? Math.sqrt(enriched.reduce((a, h) => a + Math.pow(h.dayChange, 2), 0) / enriched.length) : 0;

  // ── Simulated performance history ─────────────────────────────────────────
  const perfHistory = useMemo(() => {
    const base = netWorth * 0.82;
    return Array.from({ length: 30 }, (_, i) => {
      const noise = (Math.random() - 0.48) * netWorth * 0.015;
      const trending = (netWorth - base) * (i / 29);
      return {
        day: `D${i + 1}`,
        'Portfolio Value': parseFloat((base + trending + noise).toFixed(0)),
      };
    });
  }, [netWorth]);

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState('currentValue');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeTab, setActiveTab] = useState('holdings');

  const sorted = [...enriched].sort((a, b) => {
    const v = sortAsc ? 1 : -1;
    return a[sortKey] > b[sortKey] ? v : a[sortKey] < b[sortKey] ? -v : 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortTh = ({ k, label, right }) => (
    <th onClick={() => toggleSort(k)}
      className={`py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors ${right ? 'text-right' : ''}`}>
      {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : <span className="opacity-30">↕</span>}
    </th>
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4
        bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Briefcase className="text-primary" size={24} />
            My <span className="text-primary ml-1">Portfolio</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time overview of your demo investment holdings, performance & risk analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock size={11} /> Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchPrices} disabled={loadingPrices}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loadingPrices ? 'animate-spin' : ''} />
            {loadingPrices ? 'Refreshing…' : 'Refresh Prices'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {marginEnabled && (
          <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 animate-pulse z-10">
            2X MARGIN ACTIVE
          </div>
        )}
        <KPICard icon={DollarSign} label="Net Worth" color="blue"
          value={`$${fmt(netWorth)}`}
          sub={`Value: $${fmt(totalMarketValue)} · Cash: $${fmt(effectiveCash)}`}
        />
        <KPICard icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
          label="Total Unrealized P&L" color={totalPnL >= 0 ? 'green' : 'red'}
          value={`${totalPnL >= 0 ? '+' : ''}$${fmt(Math.abs(totalPnL))}`}
          sub={`${fmtPct(totalPnLPct)} vs cost basis`}
          trend={totalPnLPct}
        />
        <KPICard icon={Activity} label="Today's P&L" color={totalDayPnL >= 0 ? 'green' : 'red'}
          value={`${totalDayPnL >= 0 ? '+' : ''}$${fmt(Math.abs(totalDayPnL))}`}
          sub="Mark-to-market daily change"
          trend={totalMarketValue ? (totalDayPnL / totalMarketValue) * 100 : 0}
        />
        <KPICard icon={Target} label="Invested" color="purple"
          value={`${fmt(investedPct, 1)}%`}
          sub={`${enriched.length} asset${enriched.length !== 1 ? 's' : ''} · $${fmt(totalCostBasis)} cost basis`}
        />
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-darkBg p-3 rounded-2xl border border-gray-100 dark:border-darkBorder gap-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-darkBorder p-1 rounded-xl w-full sm:w-fit">
          {['holdings', 'charts', 'risk'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex-1 sm:flex-none
                ${activeTab === tab
                  ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {tab === 'holdings' ? '📋 Holdings' : tab === 'charts' ? '📊 Charts' : '🛡 Risk'}
            </button>
          ))}
        </div>
        
        {/* Margin Toggle UI */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-100 dark:border-darkBorder">
           <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">Margin Account</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{marginEnabled ? '2.0x Leverage ON' : 'Leverage OFF'}</span>
           </div>
           <label className="relative inline-flex items-center cursor-pointer ml-2">
             <input type="checkbox" className="sr-only peer" checked={marginEnabled} onChange={() => setMarginEnabled(!marginEnabled)} />
             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
           </label>
        </div>
      </div>

      {/* ────────── HOLDINGS TAB ────────── */}
      {activeTab === 'holdings' && (
        <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-darkBorder flex items-center justify-between">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" /> Holdings Detail
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Click column headers to sort
            </span>
          </div>

          {portfolio.length === 0 ? (
            <div className="py-20 text-center">
              <Briefcase size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No holdings yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Go to <strong>Demo Trading</strong> and buy some stocks to see them here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-darkBg/50 border-b border-gray-100 dark:border-darkBorder">
                  <tr>
                    <SortTh k="ticker"       label="Asset" />
                    <SortTh k="sector"       label="Sector" />
                    <SortTh k="quantity"     label="Shares"    right />
                    <SortTh k="avgPrice"     label="Avg Cost"  right />
                    <SortTh k="currentPrice" label="Live Price" right />
                    <SortTh k="currentValue" label="Mkt Value" right />
                    <SortTh k="pnl"          label="Unrlzd P&L" right />
                    <SortTh k="pnlPct"       label="Return"    right />
                    <SortTh k="dayChange"    label="Day Chg"   right />
                    <SortTh k="dayPnl"       label="Day P&L"   right />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/40">
                  {sorted.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-darkBg/40 transition-colors group">
                      {/* Asset */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
                            style={{ background: COLORS[idx % COLORS.length] }}>
                            {h.ticker.slice(0, 2)}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white tracking-wide">{h.ticker}</span>
                        </div>
                      </td>
                      {/* Sector */}
                      <td className="py-4 px-4">
                        <span className="text-xs bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-semibold">
                          {h.sector}
                        </span>
                      </td>
                      {/* Shares */}
                      <td className="py-4 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">{h.quantity}</td>
                      {/* Avg Cost */}
                      <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">${fmt(h.avgPrice)}</td>
                      {/* Live Price */}
                      <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                        ${fmt(h.currentPrice)}
                        <div className={`text-xs font-semibold mt-0.5 ${h.dayChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {fmtPct(h.dayChange)} today
                        </div>
                      </td>
                      {/* Market Value */}
                      <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                        ${fmt(h.currentValue)}
                        <div className="text-xs text-gray-400 mt-0.5">
                          {totalMarketValue ? ((h.currentValue / totalMarketValue) * 100).toFixed(1) : 0}% of port.
                        </div>
                      </td>
                      {/* Unrealised P&L */}
                      <td className={`py-4 px-4 text-right font-bold ${h.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {h.pnl >= 0 ? '+' : ''}${fmt(Math.abs(h.pnl))}
                      </td>
                      {/* Return % */}
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold
                          ${h.pnlPct >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                          : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                          {h.pnlPct >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                          {fmtPct(h.pnlPct)}
                        </span>
                      </td>
                      {/* Day Chg */}
                      <td className={`py-4 px-4 text-right text-sm font-semibold ${h.dayChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {fmtPct(h.dayChange)}
                      </td>
                      {/* Day P&L */}
                      <td className={`py-4 px-4 text-right text-sm font-semibold ${h.dayPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {h.dayPnl >= 0 ? '+' : ''}${fmt(Math.abs(h.dayPnl))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals footer */}
                <tfoot className="bg-gray-50 dark:bg-darkBg/60 border-t-2 border-gray-200 dark:border-darkBorder">
                  <tr>
                    <td className="py-3 px-4 font-extrabold text-gray-700 dark:text-gray-300" colSpan={2}>TOTAL</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-700 dark:text-gray-300">
                      {enriched.reduce((a, h) => a + h.quantity, 0)}
                    </td>
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900 dark:text-white">${fmt(totalMarketValue)}</td>
                    <td className={`py-3 px-4 text-right font-extrabold ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {totalPnL >= 0 ? '+' : ''}${fmt(Math.abs(totalPnL))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-extrabold
                        ${totalPnLPct >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                           : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                        {fmtPct(totalPnLPct)}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-extrabold ${totalDayPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {totalMarketValue ? fmtPct((totalDayPnL / totalMarketValue) * 100) : '—'}
                    </td>
                    <td className={`py-3 px-4 text-right font-extrabold ${totalDayPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {totalDayPnL >= 0 ? '+' : ''}${fmt(Math.abs(totalDayPnL))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────── CHARTS TAB ────────── */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation donut - by ticker */}
          {holdingsAlloc.length > 0 && (
            <AllocationDonut data={holdingsAlloc} title="Holdings Allocation" />
          )}

          {/* Sector donut */}
          {sectorAlloc.length > 0 && (
            <AllocationDonut data={sectorAlloc} title="Sector Allocation" />
          )}

          {/* P&L Bar Chart */}
          {plBarData.length > 0 && (
            <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart2 size={14} className="text-primary" /> Unrealized P&L by Stock
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={plBarData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="ticker" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v).toLocaleString()}`} />
                  <Tooltip formatter={(v) => [`$${fmt(v)}`, '']} />
                  <Legend />
                  <Bar dataKey="Unrealized P&L" radius={[6, 6, 0, 0]}>
                    {plBarData.map((d, i) => (
                      <Cell key={i} fill={d['Unrealized P&L'] >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                  <Bar dataKey="Day P&L" radius={[6, 6, 0, 0]} fill="#6366f1" opacity={0.65} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Simulated 30-day performance */}
          <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" /> Simulated Portfolio Growth (30 Days)
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1">
              <Info size={11} /> Illustrative trend based on current holdings and typical market variance.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={perfHistory} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${fmt(v)}`, 'Portfolio']} />
                <Area type="monotone" dataKey="Portfolio Value" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#pfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ────────── RISK TAB ────────── */}
      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Risk Score */}
          <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> Risk Summary
            </h3>
            <div className="space-y-5">
              <RiskMeter label="Max Concentration Risk" value={maxConc} max={100} color={maxConc > 60 ? 'red' : maxConc > 40 ? 'amber' : 'green'} />
              <RiskMeter label="Portfolio Avg P&L %" value={avgPnlPct} max={50} color={avgPnlPct >= 0 ? 'green' : 'red'} />
              <RiskMeter label="Intraday Volatility (σ)" value={volatilityProxy} max={5} color={volatilityProxy > 3 ? 'red' : volatilityProxy > 1.5 ? 'amber' : 'green'} />
              <RiskMeter label="Cash Allocation" value={netWorth ? (balance / netWorth) * 100 : 100} max={100} color="blue" />
            </div>
            <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 flex gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>This is a demo portfolio. Risk metrics are estimates based on daily price changes. Not financial advice.</span>
            </div>
          </div>

          {/* Diversification Analysis */}
          <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap size={14} className="text-primary" /> Diversification
            </h3>
            <div className="space-y-3">
              {/* Number of sectors */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-darkBorder">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sectors covered</span>
                <span className="font-bold text-gray-800 dark:text-white">{sectorAlloc.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-darkBorder">
                <span className="text-sm text-gray-500 dark:text-gray-400">Stock holdings</span>
                <span className="font-bold text-gray-800 dark:text-white">{enriched.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-darkBorder">
                <span className="text-sm text-gray-500 dark:text-gray-400">Largest position</span>
                <span className="font-bold text-primary">
                  {enriched.reduce((a, h) => h.currentValue > (a.currentValue || 0) ? h : a, {}).ticker || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-darkBorder">
                <span className="text-sm text-gray-500 dark:text-gray-400">Best performer</span>
                <span className="font-bold text-emerald-500">
                  {enriched.length
                    ? [...enriched].sort((a, b) => b.pnlPct - a.pnlPct)[0].ticker
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Worst performer</span>
                <span className="font-bold text-red-500">
                  {enriched.length
                    ? [...enriched].sort((a, b) => a.pnlPct - b.pnlPct)[0].ticker
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Position sizing */}
          <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target size={14} className="text-primary" /> Position Weights
            </h3>
            <div className="space-y-3">
              {[...enriched]
                .sort((a, b) => b.currentValue - a.currentValue)
                .map((h, i) => {
                  const wt = totalMarketValue ? (h.currentValue / totalMarketValue) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{h.ticker}</span>
                        <span className="text-gray-500">{fmt(wt, 1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-darkBorder rounded-full overflow-hidden">
                        <div style={{
                          width: `${wt}%`, height: '100%',
                          background: COLORS[i % COLORS.length],
                          borderRadius: 99, transition: 'width 0.8s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              {enriched.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No positions</p>
              )}
            </div>
          </div>

          {/* Key stats summary */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cost Basis',   value: `$${fmt(totalCostBasis)}`,         color: 'blue' },
              { label: 'Total Market Value', value: `$${fmt(totalMarketValue)}`,        color: 'purple' },
              { label: 'Unrealized P&L',     value: `${totalPnL >= 0 ? '+' : ''}$${fmt(Math.abs(totalPnL))}`, color: totalPnL >= 0 ? 'green' : 'red' },
              { label: 'Cash Balance',        value: `$${fmt(balance)}`,                color: 'amber' },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 border
                ${s.color === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30'
                : s.color === 'red'   ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
                : s.color === 'purple'? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30'
                : s.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30'
                :                       'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">{s.label}</p>
                <p className={`text-xl font-extrabold
                  ${s.color === 'green' ? 'text-emerald-600 dark:text-emerald-400'
                  : s.color === 'red'   ? 'text-red-600 dark:text-red-400'
                  : s.color === 'purple'? 'text-purple-600 dark:text-purple-400'
                  : s.color === 'amber' ? 'text-amber-600 dark:text-amber-400'
                  :                       'text-blue-600 dark:text-blue-400'}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
