import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Zap, TrendingUp, TrendingDown, X, AlertTriangle, CheckCircle,
  RefreshCw, Clock, BarChart2, Target, Shield, Info, ChevronDown,
  ChevronUp, Activity, Flame, DollarSign, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Mock market data ─────────────────────────────────────────────────────────
const BASE_PRICES = {
  AAPL:185.50, MSFT:335.20, GOOGL:140.00, TSLA:210.10, AMZN:130.40,
  NVDA:167.61, META:520.00, JPM:195.00, NFLX:610.00, V:272.00,
  RELIANCE:2480, INFY:1580, TCS:3900, WIPRO:480, HDFC:1680,
  'NIFTY50':22800, 'BANKNIFTY':48200,
};

const INTRADAY_LEVERAGE = 5;  // 5x margin for intraday
const LOT_SIZES = {
  AAPL:100, MSFT:100, GOOGL:100, TSLA:100, NVDA:100,
  AMZN:100, META:100, 'NIFTY50':50, 'BANKNIFTY':25,
};

const EXPIRIES = ['25 Apr 2026', '01 May 2026', '29 May 2026', '26 Jun 2026'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n, d=2) => Number(n||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtS = (n) => `${n>=0?'+':''}${fmt(n)}`;
const fmtP = (n) => `${n>=0?'+':''}${fmt(n)}%`;
const clr  = (n) => n>=0 ? 'text-emerald-500' : 'text-red-500';
const bg   = (n) => n>=0 ? 'bg-emerald-500' : 'bg-red-500';

// Realistic live price with micro-noise
const livePrice = (ticker, overrideMap) => {
  const base = overrideMap[ticker] || BASE_PRICES[ticker] || 100;
  return base;
};

// Simple Black-Scholes approximation for call/put premium
function optionPremium(S, K, T, r=0.06, sigma=0.25, type='call') {
  if (T <= 0) return Math.max(type==='call' ? S-K : K-S, 0);
  const d1 = (Math.log(S/K) + (r + 0.5*sigma*sigma)*T) / (sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  const N  = (x) => {
    const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
    const sign = x<0?-1:1; x=Math.abs(x);
    const t=1/(1+p*x);
    const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5*(1+sign*y);
  };
  if (type==='call') return S*N(d1) - K*Math.exp(-r*T)*N(d2);
  return K*Math.exp(-r*T)*N(-d2) - S*N(-d1);
}

// Greeks (simplified)
function greeks(S, K, T, sigma=0.25, r=0.06, type='call') {
  if (T<=0) return { delta:0, gamma:0, theta:0, vega:0 };
  const d1 = (Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  const phi = (x) => Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);
  const N   = (x) => {
    const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
    const sign=x<0?-1:1; x=Math.abs(x);
    const t=1/(1+p*x);
    const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5*(1+sign*y);
  };
  const delta = type==='call' ? N(d1) : N(d1)-1;
  const gamma = phi(d1)/(S*sigma*Math.sqrt(T));
  const vega  = S*phi(d1)*Math.sqrt(T)/100;
  const theta = (type==='call'
    ? -(S*phi(d1)*sigma)/(2*Math.sqrt(T)) - r*K*Math.exp(-r*T)*N(d2)
    : -(S*phi(d1)*sigma)/(2*Math.sqrt(T)) + r*K*Math.exp(-r*T)*N(-d2)) / 365;
  return { delta:+delta.toFixed(4), gamma:+gamma.toFixed(6), theta:+theta.toFixed(4), vega:+vega.toFixed(4) };
}

// Build options chain for a given underlying
function buildChain(spot, expiry) {
  const T = Math.max(
    (new Date(expiry) - new Date()) / (1000*60*60*24*365), 0.001
  );
  const strikes = [-8,-6,-4,-2,0,2,4,6,8].map(d => Math.round((spot + d*spot*0.01)/5)*5);
  return strikes.map(K => {
    const cp = optionPremium(spot, K, T, 0.06, 0.25, 'call');
    const pp = optionPremium(spot, K, T, 0.06, 0.25, 'put');
    const cg = greeks(spot, K, T, 0.25, 0.06, 'call');
    const pg = greeks(spot, K, T, 0.25, 0.06, 'put');
    const itm = K < spot;
    return { K, cp:+cp.toFixed(2), pp:+pp.toFixed(2), cg, pg, itm, T };
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(()=>{ if(msg){ const t=setTimeout(onClose,4000); return ()=>clearTimeout(t); } },[msg]);
  if(!msg) return null;
  const ok = msg.type==='success';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-bounce-in
      ${ok?'bg-emerald-900/90 border-emerald-600 text-emerald-200':'bg-red-900/90 border-red-600 text-red-200'}`}>
      {ok?<CheckCircle size={16}/>:<AlertTriangle size={16}/>}
      {msg.text}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14}/></button>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Card({ children, className='' }) {
  return (
    <div className={`bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Order Panel ──────────────────────────────────────────────────────────────
function OrderPanel({ mode, ticker, setTicker, balance, onExecute, prices }) {
  const isIntraday = mode === 'intraday';
  const [side, setSide]      = useState('BUY');
  const [qty, setQty]        = useState(1);
  const [orderType, setOT]   = useState('MARKET');
  const [limitPx, setLimPx]  = useState('');
  const [sl, setSl]          = useState('');
  const [target, setTarget]  = useState('');
  const [product, setProduct] = useState(isIntraday ? 'MIS' : 'NRML');

  const spotPrice = prices[ticker] || BASE_PRICES[ticker] || 100;
  const execPrice = orderType==='LIMIT' && parseFloat(limitPx) ? parseFloat(limitPx) : spotPrice;
  const leverage  = isIntraday ? INTRADAY_LEVERAGE : 1;
  const margin    = (execPrice * qty) / leverage;
  const totalVal  = execPrice * qty;

  const execute = () => {
    if (side==='BUY' && margin > balance) {
      onExecute(null, `Insufficient margin. Need ₹${fmt(margin)}, have ₹${fmt(balance)}`);
      return;
    }
    onExecute({
      ticker, side, qty: parseInt(qty,10), execPrice,
      sl:    parseFloat(sl)||null,
      target:parseFloat(target)||null,
      product, orderType, leverage, margin,
      mode,
    });
  };

  return (
    <Card className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Zap size={15} className="text-primary"/> Place {isIntraday?'Intraday':'F&O'} Order
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-darkBorder rounded-lg p-0.5">
          {['BUY','SELL'].map(s=>(
            <button key={s} onClick={()=>setSide(s)}
              className={`px-4 py-1.5 rounded-md text-xs font-extrabold transition-all ${side===s
                ?(s==='BUY'?'bg-emerald-500 text-white shadow':'bg-red-500 text-white shadow')
                :'text-gray-500 dark:text-gray-400'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Symbol */}
      <div>
        <label className="label-xs">Symbol</label>
        <select value={ticker} onChange={e=>setTicker(e.target.value)}
          className="input-field font-bold">
          {Object.keys(isIntraday ? BASE_PRICES : LOT_SIZES).map(k=>(
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Order Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Order Type</label>
          <select value={orderType} onChange={e=>setOT(e.target.value)} className="input-field">
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="SL-M">SL-Market</option>
          </select>
        </div>
        <div>
          <label className="label-xs">Product</label>
          <select value={product} onChange={e=>setProduct(e.target.value)} className="input-field">
            {isIntraday
              ? <><option value="MIS">MIS (Intraday)</option><option value="CNC">CNC (Delivery)</option></>
              : <><option value="NRML">NRML (Carry)</option><option value="MIS">MIS (Intraday F&O)</option></>
            }
          </select>
        </div>
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Qty / Lots</label>
          <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}
            className="input-field font-bold text-lg"/>
        </div>
        {orderType!=='MARKET' && (
          <div>
            <label className="label-xs">Limit Price</label>
            <input type="number" value={limitPx} onChange={e=>setLimPx(e.target.value)}
              placeholder={fmt(spotPrice)} className="input-field"/>
          </div>
        )}
      </div>

      {/* SL / Target */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs flex items-center gap-1"><Shield size={10}/> Stop Loss</label>
          <input type="number" value={sl} onChange={e=>setSl(e.target.value)}
            placeholder="Optional" className="input-field text-red-400 dark:text-red-400"/>
        </div>
        <div>
          <label className="label-xs flex items-center gap-1"><Target size={10}/> Target</label>
          <input type="number" value={target} onChange={e=>setTarget(e.target.value)}
            placeholder="Optional" className="input-field text-emerald-400"/>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500 font-semibold">Live Price</span>
          <span className="font-bold text-gray-800 dark:text-white">${fmt(spotPrice)}</span>
        </div>
        {isIntraday && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-semibold">Leverage</span>
            <span className="font-bold text-amber-500">{leverage}x</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500 font-semibold">Order Value</span>
          <span className="font-bold text-gray-800 dark:text-white">${fmt(totalVal)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-darkBorder pt-1.5">
          <span className="font-extrabold text-gray-700 dark:text-gray-300">Margin Required</span>
          <span className={`font-extrabold ${margin > balance ? 'text-red-500':'text-primary'}`}>${fmt(margin)}</span>
        </div>
      </div>

      {margin > balance && side==='BUY' && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-3 py-2 text-xs font-semibold">
          <AlertTriangle size={13}/> Insufficient margin balance
        </div>
      )}

      <button onClick={execute}
        className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm shadow-lg transition-all active:scale-95
          ${side==='BUY'?'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30':'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
        {side==='BUY'?<TrendingUp className="inline mr-1.5" size={14}/>:<TrendingDown className="inline mr-1.5" size={14}/>}
        {side} {qty} × {ticker} @ {orderType==='MARKET'?'Market':fmt(execPrice)}
      </button>
    </Card>
  );
}

// ─── Intraday Positions ───────────────────────────────────────────────────────
function IntradayPositions({ positions, prices, onSquareOff, onSquareAll }) {
  if(!positions.length) return (
    <Card className="p-8 text-center">
      <Activity size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3"/>
      <p className="text-gray-500 dark:text-gray-400 font-medium">No open intraday positions</p>
      <p className="text-xs text-gray-400 mt-1">Place a MIS order to start intraday trading</p>
    </Card>
  );

  const totalPnL = positions.reduce((a,p)=>{
    const cur = prices[p.ticker]||p.execPrice;
    const pnl = (cur - p.execPrice) * p.qty * (p.side==='BUY'?1:-1);
    return a+pnl;
  },0);

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-darkBorder">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Flame size={14} className="text-amber-500"/> Intraday Positions
        </h3>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-extrabold ${clr(totalPnL)}`}>
            Total P&L: {fmtS(totalPnL)} USD
          </span>
          <button onClick={onSquareAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-200 transition-all">
            Square All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-darkBg/50 border-b border-gray-100 dark:border-darkBorder">
            <tr className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-4">Symbol</th>
              <th className="py-2.5 px-4">Side</th>
              <th className="py-2.5 px-4 text-right">Qty</th>
              <th className="py-2.5 px-4 text-right">Avg Price</th>
              <th className="py-2.5 px-4 text-right">LTP</th>
              <th className="py-2.5 px-4 text-right">P&L</th>
              <th className="py-2.5 px-4 text-right">P&L %</th>
              <th className="py-2.5 px-4 text-right">SL</th>
              <th className="py-2.5 px-4 text-right">Target</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/30">
            {positions.map((p,i)=>{
              const ltp = prices[p.ticker]||p.execPrice;
              const pnl = (ltp - p.execPrice)*p.qty*(p.side==='BUY'?1:-1);
              const pnlPct = (pnl/(p.execPrice*p.qty))*100;
              const slHit = p.sl && (p.side==='BUY'?ltp<=p.sl:ltp>=p.sl);
              const tgHit = p.target && (p.side==='BUY'?ltp>=p.target:ltp<=p.target);
              return (
                <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-darkBg/40 transition-colors ${slHit?'bg-red-50/50 dark:bg-red-900/10':tgHit?'bg-emerald-50/50 dark:bg-emerald-900/10':''}`}>
                  <td className="py-3 px-4 font-extrabold text-gray-900 dark:text-white">{p.ticker}
                    {slHit && <span className="ml-2 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">SL Hit</span>}
                    {tgHit && <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">Target!</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${p.side==='BUY'?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400':'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>{p.side}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">{p.qty}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">${fmt(p.execPrice)}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">${fmt(ltp)}</td>
                  <td className={`py-3 px-4 text-right font-extrabold ${clr(pnl)}`}>{fmtS(pnl)}</td>
                  <td className={`py-3 px-4 text-right font-bold ${clr(pnlPct)}`}>{fmtP(pnlPct)}</td>
                  <td className="py-3 px-4 text-right text-red-400 text-xs">{p.sl?`$${fmt(p.sl)}`:'—'}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 text-xs">{p.target?`$${fmt(p.target)}`:'—'}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={()=>onSquareOff(i,ltp,pnl)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 font-semibold hover:bg-primary/10 hover:text-primary transition-all">
                      Exit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── F&O Positions ────────────────────────────────────────────────────────────
function FnOPositions({ positions, prices, onExit }) {
  if(!positions.length) return (
    <Card className="p-8 text-center">
      <Layers size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3"/>
      <p className="text-gray-500 dark:text-gray-400 font-medium">No open F&O positions</p>
      <p className="text-xs text-gray-400 mt-1">Trade futures or buy/sell options to open a position</p>
    </Card>
  );

  return (
    <Card>
      <div className="p-4 border-b border-gray-100 dark:border-darkBorder">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BarChart2 size={14} className="text-primary"/> Open F&O Positions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-darkBg/50 border-b border-gray-100 dark:border-darkBorder">
            <tr className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Instrument</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3 text-right">Qty/Lots</th>
              <th className="py-2.5 px-3 text-right">Strike</th>
              <th className="py-2.5 px-3 text-right">Avg Premium</th>
              <th className="py-2.5 px-3 text-right">LTP</th>
              <th className="py-2.5 px-3 text-right">P&L</th>
              <th className="py-2.5 px-3 text-right">Delta</th>
              <th className="py-2.5 px-3 text-right">Theta/day</th>
              <th className="py-2.5 px-3 text-right">Expiry</th>
              <th className="py-2.5 px-3 text-center">Exit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/30">
            {positions.map((p,i)=>{
              const spot = prices[p.underlying]||BASE_PRICES[p.underlying]||100;
              const T = Math.max((new Date(p.expiry)-new Date())/(1000*60*60*24*365),0.001);
              const curPrem = p.isFutures
                ? spot + (spot-p.strike)*0.01
                : +optionPremium(spot, p.strike, T, 0.06, 0.25, p.optType).toFixed(2);
              const lot = LOT_SIZES[p.underlying]||100;
              const pnl = (curPrem - p.avgPremium)*p.lots*lot*(p.side==='BUY'?1:-1);
              const g = p.isFutures ? {delta:1,theta:0,gamma:0,vega:0} : greeks(spot,p.strike,T,0.25,0.06,p.optType);
              return (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-darkBg/40">
                  <td className="py-3 px-3 font-extrabold text-gray-900 dark:text-white">{p.underlying}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.isFutures?'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400':p.optType==='call'?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {p.isFutures?'FUT':p.optType==='call'?'CE':'PE'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.side==='BUY'?'text-emerald-500':'text-red-500'}`}>{p.side}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">{p.lots} × {lot}</td>
                  <td className="py-3 px-3 text-right">{p.isFutures?'—':fmt(p.strike,0)}</td>
                  <td className="py-3 px-3 text-right text-gray-500">${fmt(p.avgPremium)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white">${fmt(curPrem)}</td>
                  <td className={`py-3 px-3 text-right font-extrabold ${clr(pnl)}`}>{fmtS(pnl)}</td>
                  <td className="py-3 px-3 text-right text-gray-500">{fmt(g.delta,3)}</td>
                  <td className="py-3 px-3 text-right text-red-400">{fmt(g.theta,3)}</td>
                  <td className="py-3 px-3 text-right text-xs text-gray-400">{p.expiry}</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={()=>onExit(i,curPrem,pnl)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 font-semibold hover:bg-primary/10 hover:text-primary transition-all">
                      Exit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Options Chain ────────────────────────────────────────────────────────────
function OptionsChain({ underlying, spot, prices, onTrade }) {
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const chain = useMemo(()=>buildChain(spot, expiry),[spot, expiry]);

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-darkBorder flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart2 size={14} className="text-primary"/> Options Chain — {underlying}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Spot: <span className="font-bold text-gray-700 dark:text-gray-300">${fmt(spot)}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Expiry:</span>
          <select value={expiry} onChange={e=>setExpiry(e.target.value)}
            className="text-xs font-bold bg-gray-100 dark:bg-darkBorder text-gray-800 dark:text-gray-200 border-none rounded-lg px-3 py-1.5 cursor-pointer">
            {EXPIRIES.map(e=><option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-darkBorder">
              <th colSpan={5} className="py-2.5 text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-900/10">CALL (CE)</th>
              <th className="py-2.5 px-3 bg-gray-100 dark:bg-darkBg font-extrabold text-gray-700 dark:text-gray-300 text-sm">STRIKE</th>
              <th colSpan={5} className="py-2.5 text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-900/10">PUT (PE)</th>
            </tr>
            <tr className="border-b border-gray-100 dark:border-darkBorder text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-2 px-2 bg-blue-50/50 dark:bg-blue-900/5">Buy</th>
              <th className="py-2 px-2 bg-blue-50/50 dark:bg-blue-900/5">Sell</th>
              <th className="py-2 px-2 bg-blue-50/50 dark:bg-blue-900/5">LTP</th>
              <th className="py-2 px-2 bg-blue-50/50 dark:bg-blue-900/5">Delta</th>
              <th className="py-2 px-2 bg-blue-50/50 dark:bg-blue-900/5">Theta</th>
              <th className="py-2 px-3 bg-gray-100 dark:bg-darkBg text-gray-700 dark:text-gray-300"></th>
              <th className="py-2 px-2 bg-amber-50/50 dark:bg-amber-900/5">Theta</th>
              <th className="py-2 px-2 bg-amber-50/50 dark:bg-amber-900/5">Delta</th>
              <th className="py-2 px-2 bg-amber-50/50 dark:bg-amber-900/5">LTP</th>
              <th className="py-2 px-2 bg-amber-50/50 dark:bg-amber-900/5">Buy</th>
              <th className="py-2 px-2 bg-amber-50/50 dark:bg-amber-900/5">Sell</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((row,i)=>{
              const atm = Math.abs(row.K-spot)<(spot*0.01*1.5);
              return (
                <tr key={i} className={`border-b border-gray-50 dark:border-darkBorder/30 ${atm?'bg-yellow-50/60 dark:bg-yellow-900/10 font-bold':''} hover:brightness-95 transition-all`}>
                  {/* CALL cells */}
                  <td className="py-2 px-2 bg-blue-50/30 dark:bg-blue-900/5">
                    <button onClick={()=>onTrade({type:'call',side:'BUY',strike:row.K,premium:row.cp,expiry,underlying})}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">{fmt(row.cp)}</button>
                  </td>
                  <td className="py-2 px-2 bg-blue-50/30 dark:bg-blue-900/5">
                    <button onClick={()=>onTrade({type:'call',side:'SELL',strike:row.K,premium:row.cp,expiry,underlying})}
                      className="text-red-500 dark:text-red-400 hover:underline font-bold">{fmt(row.cp)}</button>
                  </td>
                  <td className="py-2 px-2 bg-blue-50/30 dark:bg-blue-900/5 font-bold text-gray-800 dark:text-gray-200">{fmt(row.cp)}</td>
                  <td className="py-2 px-2 bg-blue-50/30 dark:bg-blue-900/5 text-gray-500">{fmt(row.cg.delta,3)}</td>
                  <td className="py-2 px-2 bg-blue-50/30 dark:bg-blue-900/5 text-red-400">{fmt(row.cg.theta,3)}</td>
                  {/* Strike */}
                  <td className={`py-2 px-4 bg-gray-100 dark:bg-darkBg font-extrabold text-sm ${atm?'text-primary':'text-gray-700 dark:text-gray-200'} ${row.itm?'':'opacity-70'}`}>
                    {fmt(row.K,0)}
                    {atm && <div className="text-xs text-primary font-bold">ATM</div>}
                    {!atm && row.itm && <div className="text-xs text-emerald-500">ITM</div>}
                    {!atm && !row.itm && <div className="text-xs text-gray-400">OTM</div>}
                  </td>
                  {/* PUT cells */}
                  <td className="py-2 px-2 bg-amber-50/30 dark:bg-amber-900/5 text-red-400">{fmt(row.pg.theta,3)}</td>
                  <td className="py-2 px-2 bg-amber-50/30 dark:bg-amber-900/5 text-gray-500">{fmt(row.pg.delta,3)}</td>
                  <td className="py-2 px-2 bg-amber-50/30 dark:bg-amber-900/5 font-bold text-gray-800 dark:text-gray-200">{fmt(row.pp)}</td>
                  <td className="py-2 px-2 bg-amber-50/30 dark:bg-amber-900/5">
                    <button onClick={()=>onTrade({type:'put',side:'BUY',strike:row.K,premium:row.pp,expiry,underlying})}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">{fmt(row.pp)}</button>
                  </td>
                  <td className="py-2 px-2 bg-amber-50/30 dark:bg-amber-900/5">
                    <button onClick={()=>onTrade({type:'put',side:'SELL',strike:row.K,premium:row.pp,expiry,underlying})}
                      className="text-red-500 dark:text-red-400 hover:underline font-bold">{fmt(row.pp)}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <Info size={11}/> Premiums computed using Black-Scholes model (σ=25%, r=6%). Click Buy/Sell to instantly add to your F&O positions.
        </div>
      </div>
    </Card>
  );
}

// ─── FNO Order Panel ──────────────────────────────────────────────────────────
function FnOOrderPanel({ balance, prices, onExecute }) {
  const [instrType, setInstrType] = useState('options'); // 'futures' | 'options'
  const [underlying, setUnderlying] = useState('NIFTY50');
  const [side, setSide]  = useState('BUY');
  const [lots, setLots]  = useState(1);
  const [optType, setOptType] = useState('call');
  const [expiry, setExpiry]   = useState(EXPIRIES[0]);
  const [strike, setStrike]   = useState('');
  const spot = prices[underlying]||BASE_PRICES[underlying]||100;
  const lot  = LOT_SIZES[underlying]||100;
  const T    = Math.max((new Date(expiry)-new Date())/(1000*60*60*24*365),0.001);
  const K    = parseFloat(strike)||Math.round(spot/5)*5;
  const premium = instrType==='futures'
    ? spot
    : +optionPremium(spot, K, T, 0.06, 0.25, optType).toFixed(2);
  const margin = instrType==='futures'
    ? spot*lot*lots*0.1
    : side==='BUY' ? premium*lot*lots : premium*lot*lots*0.5;

  const execute = () => {
    if(side==='BUY' && margin > balance){
      onExecute(null,'Insufficient margin balance');
      return;
    }
    onExecute({
      fno:true, underlying, side,
      isFutures: instrType==='futures',
      optType: instrType==='options' ? optType : null,
      strike: K, expiry, lots: parseInt(lots,10), lot,
      avgPremium: premium, margin,
    });
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Layers size={15} className="text-primary"/> F&O Order
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-darkBorder rounded-lg p-0.5">
          {['BUY','SELL'].map(s=>(
            <button key={s} onClick={()=>setSide(s)}
              className={`px-4 py-1.5 rounded-md text-xs font-extrabold transition-all
                ${side===s?(s==='BUY'?'bg-emerald-500 text-white':'bg-red-500 text-white'):'text-gray-500 dark:text-gray-400'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Instrument type */}
      <div className="flex gap-2">
        {['futures','options'].map(t=>(
          <button key={t} onClick={()=>setInstrType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold capitalize border transition-all
              ${instrType===t?'bg-primary text-white border-primary shadow-lg shadow-primary/30':'border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400 hover:border-primary/50'}`}>
            {t==='futures'?'📈 Futures':'⚡ Options'}
          </button>
        ))}
      </div>

      {/* Underlying */}
      <div>
        <label className="label-xs">Underlying</label>
        <select value={underlying} onChange={e=>setUnderlying(e.target.value)} className="input-field font-bold">
          {Object.keys(LOT_SIZES).map(k=><option key={k} value={k}>{k} (lot:{LOT_SIZES[k]})</option>)}
        </select>
      </div>

      {/* Options-specific */}
      {instrType==='options' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-xs">Option Type</label>
            <div className="flex gap-1 mt-1">
              {['call','put'].map(t=>(
                <button key={t} onClick={()=>setOptType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold uppercase border transition-all
                    ${optType===t?(t==='call'?'bg-blue-500 text-white border-blue-500':'bg-amber-500 text-white border-amber-500'):'border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400'}`}>
                  {t==='call'?'CE Call':'PE Put'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-xs">Strike Price</label>
            <input type="number" value={strike} onChange={e=>setStrike(e.target.value)}
              placeholder={String(Math.round(spot/5)*5)} className="input-field"/>
          </div>
        </div>
      )}

      {/* Expiry + Lots */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Expiry</label>
          <select value={expiry} onChange={e=>setExpiry(e.target.value)} className="input-field text-xs">
            {EXPIRIES.map(e=><option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="label-xs">Lots</label>
          <input type="number" min="1" value={lots} onChange={e=>setLots(e.target.value)} className="input-field font-bold"/>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Spot</span>
          <span className="font-bold text-gray-800 dark:text-white">${fmt(spot)}</span>
        </div>
        {instrType==='options'&&(
          <div className="flex justify-between">
            <span className="text-gray-500">Strike / Type</span>
            <span className="font-bold text-gray-800 dark:text-white">{fmt(K,0)} {optType==='call'?'CE':'PE'}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">{instrType==='futures'?'Futures Price':'Option Premium'}</span>
          <span className="font-bold text-gray-800 dark:text-white">${fmt(premium)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Lot Size × Lots</span>
          <span className="font-bold text-gray-800 dark:text-white">{lot} × {lots} = {lot*lots} units</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-darkBorder pt-1.5">
          <span className="font-extrabold text-gray-700 dark:text-gray-300">Margin Required</span>
          <span className={`font-extrabold ${margin>balance?'text-red-500':'text-primary'}`}>${fmt(margin)}</span>
        </div>
      </div>

      {margin>balance&&side==='BUY'&&(
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-3 py-2 text-xs font-semibold">
          <AlertTriangle size={13}/> Insufficient margin balance
        </div>
      )}

      <button onClick={execute}
        className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm shadow-lg transition-all active:scale-95
          ${side==='BUY'?'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30':'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
        {side==='BUY'?<TrendingUp className="inline mr-1" size={14}/>:<TrendingDown className="inline mr-1" size={14}/>}
        {side} {instrType==='futures'?'FUT':optType.toUpperCase()} {lots} Lot{lots>1?'s':''} · {underlying}
      </button>
    </Card>
  );
}

// ─── Trade Log ────────────────────────────────────────────────────────────────
function TradeLog({ trades }) {
  if(!trades.length) return null;
  return (
    <Card>
      <div className="p-4 border-b border-gray-100 dark:border-darkBorder">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Clock size={14} className="text-gray-400"/> Trade Log (Today)
        </h3>
      </div>
      <div className="overflow-x-auto max-h-56 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-darkBg/50 sticky top-0">
            <tr className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-darkBorder">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Symbol</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Side</th>
              <th className="py-2 px-3 text-right">Price</th>
              <th className="py-2 px-3 text-right">Qty</th>
              <th className="py-2 px-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/30">
            {[...trades].reverse().map((t,i)=>(
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-darkBg/30">
                <td className="py-2 px-3 text-gray-400">{t.time}</td>
                <td className="py-2 px-3 font-bold text-gray-800 dark:text-white">{t.symbol}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${t.tradeType==='FNO'?'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300':'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    {t.tradeType}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span className={`font-bold ${t.side==='BUY'?'text-emerald-500':'text-red-500'}`}>{t.side}</span>
                </td>
                <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${fmt(t.price)}</td>
                <td className="py-2 px-3 text-right">{t.qty}</td>
                <td className={`py-2 px-3 text-right font-bold ${t.pnl!=null?clr(t.pnl):'text-gray-400'}`}>
                  {t.pnl!=null?fmtS(t.pnl):'Open'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IntradayFnOPage() {
  const { userEmail } = useAuth();
  const [tab, setTab] = useState('intraday');

  // Live prices state (with small random drift for simulation)
  const [prices, setPrices] = useState({...BASE_PRICES});

  // Drift prices every 5s
  useEffect(()=>{
    const drift = () => setPrices(prev=>{
      const next={...prev};
      Object.keys(next).forEach(k=>{
        const chg = (Math.random()-0.498)*next[k]*0.0008;
        next[k] = Math.max(next[k]+chg, 1);
      });
      return next;
    });
    const id = setInterval(drift,5000);
    return ()=>clearInterval(id);
  },[]);

  // Try to fetch real prices
  useEffect(()=>{
    ['AAPL','MSFT','GOOGL','TSLA','NVDA','JPM','META','AMZN','NFLX','V'].forEach(async ticker=>{
      try {
        const r = await fetch(`${API_BASE}/api/dashboard/${ticker}`);
        const d = await r.json();
        if(d.price) setPrices(prev=>({...prev,[ticker]:d.price}));
      } catch {}
    });
  },[]);

  // Balance shared with DemoTrading
  const getLocal=(key,def)=>{ try{const v=localStorage.getItem(`${key}_${userEmail}`);return v?JSON.parse(v):def;}catch{return def;} };
  const [balance, setBalance] = useState(()=>getLocal('demoBalance',100000));

  useEffect(()=>{
    const handler=()=>setBalance(getLocal('demoBalance',100000));
    window.addEventListener('storage',handler);
    return ()=>window.removeEventListener('storage',handler);
  },[userEmail]);

  const saveBalance=(b)=>{
    setBalance(b);
    localStorage.setItem(`demoBalance_${userEmail}`,JSON.stringify(b));
  };

  // Intraday state
  const [intradayTicker, setIntradayTicker] = useState('AAPL');
  const [intradayPositions, setIntradayPositions] = useState([]);
  const [fnoPositions, setFnoPositions]   = useState([]);
  const [tradeLog, setTradeLog]           = useState([]);
  const [toast, setToast]                 = useState(null);

  const addLog=(entry)=>setTradeLog(prev=>[...prev,{...entry, time:new Date().toLocaleTimeString()}]);

  // ── Execute Intraday Order ─────────────────────────────────────────────────
  const executeIntraday = (order, err) => {
    if(!order) { setToast({type:'error',text:err}); return; }
    if(order.side==='BUY'){
      saveBalance(balance - order.margin);
      setIntradayPositions(prev=>[...prev,{
        ticker:order.ticker, side:'BUY', qty:order.qty, execPrice:order.execPrice,
        sl:order.sl, target:order.target, product:order.product, leverage:order.leverage,
      }]);
      addLog({symbol:order.ticker,tradeType:'INTRADAY',side:'BUY',price:order.execPrice,qty:order.qty,pnl:null});
      setToast({type:'success',text:`✅ Bought ${order.qty} × ${order.ticker} @ $${fmt(order.execPrice)} (margin $${fmt(order.margin)})`});
    } else {
      // Sell: find matching long position (simplified: just open a short)
      setIntradayPositions(prev=>[...prev,{
        ticker:order.ticker,side:'SELL',qty:order.qty,execPrice:order.execPrice,
        sl:order.sl,target:order.target,product:order.product,leverage:order.leverage,
      }]);
      addLog({symbol:order.ticker,tradeType:'INTRADAY',side:'SELL',price:order.execPrice,qty:order.qty,pnl:null});
      setToast({type:'success',text:`✅ Shorted ${order.qty} × ${order.ticker} @ $${fmt(order.execPrice)}`});
    }
  };

  const squareOff=(idx,ltp,pnl)=>{
    const pos=intradayPositions[idx];
    saveBalance(balance + pos.margin + pnl);
    setIntradayPositions(prev=>prev.filter((_,i)=>i!==idx));
    addLog({symbol:pos.ticker,tradeType:'INTRADAY',side:pos.side==='BUY'?'SELL':'BUY',price:ltp,qty:pos.qty,pnl});
    setToast({type:pnl>=0?'success':'error', text:`${pnl>=0?'🟢':'🔴'} ${pos.ticker} squared off. P&L: ${fmtS(pnl)}`});
  };

  const squareAll=()=>{
    let totalReturn=0;
    intradayPositions.forEach(p=>{
      const ltp=prices[p.ticker]||p.execPrice;
      const pnl=(ltp-p.execPrice)*p.qty*(p.side==='BUY'?1:-1);
      totalReturn+=(p.margin||0)+pnl;
      addLog({symbol:p.ticker,tradeType:'INTRADAY',side:p.side==='BUY'?'SELL':'BUY',price:ltp,qty:p.qty,pnl});
    });
    saveBalance(balance+totalReturn);
    setIntradayPositions([]);
    setToast({type:'success',text:`All intraday positions squared off!`});
  };

  // ── Execute F&O Order ──────────────────────────────────────────────────────
  const executeFnO = (order, err) => {
    if(!order){setToast({type:'error',text:err});return;}
    saveBalance(balance - order.margin);
    setFnoPositions(prev=>[...prev,{
      underlying: order.underlying, side: order.side,
      isFutures:  order.isFutures, optType: order.optType,
      strike: order.strike, expiry: order.expiry,
      lots: order.lots, lot: order.lot,
      avgPremium: order.avgPremium, margin: order.margin,
    }]);
    const label = order.isFutures ? 'FUT' : (order.optType==='call'?'CE':'PE');
    addLog({symbol:`${order.underlying} ${label}`,tradeType:'FNO',side:order.side,price:order.avgPremium,qty:`${order.lots}L`,pnl:null});
    setToast({type:'success',text:`✅ ${order.side} ${order.lots}L ${order.underlying} ${label} @ $${fmt(order.avgPremium)}`});
  };

  const exitFnO=(idx,curPrem,pnl)=>{
    const pos=fnoPositions[idx];
    saveBalance(balance+pos.margin+pnl);
    setFnoPositions(prev=>prev.filter((_,i)=>i!==idx));
    addLog({symbol:`${pos.underlying}`,tradeType:'FNO',side:pos.side==='BUY'?'SELL':'BUY',price:curPrem,qty:`${pos.lots}L`,pnl});
    setToast({type:pnl>=0?'success':'error',text:`${pnl>=0?'🟢':'🔴'} F&O position closed. P&L: ${fmtS(pnl)}`});
  };

  // Quick chain trade from options chain
  const chainTrade=(info)=>{
    const margin = info.premium*(LOT_SIZES[info.underlying]||100);
    if(info.side==='BUY' && margin>balance){setToast({type:'error',text:'Insufficient margin'});return;}
    if(info.side==='BUY') saveBalance(balance-margin);
    setFnoPositions(prev=>[...prev,{
      underlying:info.underlying, side:info.side,
      isFutures:false, optType:info.type,
      strike:info.strike, expiry:info.expiry,
      lots:1, lot:LOT_SIZES[info.underlying]||100,
      avgPremium:info.premium, margin,
    }]);
    setToast({type:'success',text:`✅ ${info.side} 1L ${info.underlying} ${info.type==='call'?'CE':'PE'} ${fmt(info.strike,0)} @ $${fmt(info.premium)}`});
  };

  // ── Total scores ──────────────────────────────────────────────────────────
  const intradayPnL = intradayPositions.reduce((a,p)=>{
    const ltp=prices[p.ticker]||p.execPrice;
    return a+(ltp-p.execPrice)*p.qty*(p.side==='BUY'?1:-1);
  },0);
  const fnoPnL = fnoPositions.reduce((a,p)=>{
    const spot=prices[p.underlying]||BASE_PRICES[p.underlying]||100;
    const T=Math.max((new Date(p.expiry)-new Date())/(1000*60*60*24*365),0.001);
    const cur=p.isFutures?spot:+optionPremium(spot,p.strike,T).toFixed(2);
    return a+(cur-p.avgPremium)*p.lots*p.lot*(p.side==='BUY'?1:-1);
  },0);

  const fnoUnderlying = fnoPositions.length>0 ? fnoPositions[0].underlying : 'NIFTY50';
  const chainSpot = prices[fnoUnderlying]||BASE_PRICES[fnoUnderlying]||100;

  return (
    <div className="space-y-5">
      <Toast msg={toast} onClose={()=>setToast(null)}/>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4
        bg-white dark:bg-darkCard p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="text-amber-400" size={24}/>
            Intraday <span className="text-primary mx-1">&</span> F&O
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full ml-1">DEMO</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Simulated intraday trading with leverage · Futures & Options with real Black-Scholes pricing
          </p>
        </div>
        {/* Live Summary KPIs */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Cash Balance</p>
            <p className="font-extrabold text-primary">${fmt(balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Intraday P&L</p>
            <p className={`font-extrabold ${clr(intradayPnL)}`}>{fmtS(intradayPnL)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">F&O P&L</p>
            <p className={`font-extrabold ${clr(fnoPnL)}`}>{fmtS(fnoPnL)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Open Positions</p>
            <p className="font-extrabold text-gray-800 dark:text-white">{intradayPositions.length + fnoPositions.length}</p>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300 font-medium">
        <AlertTriangle size={14} className="shrink-0 mt-0.5"/>
        <span>This is a <strong>DEMO simulator</strong>. No real money involved. Prices are live-fetched where possible and augmented with realistic micro-drift simulation. Options priced via Black-Scholes (σ=25%, r=6%). Not financial advice.</span>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-darkBorder p-1 rounded-xl w-fit">
        {[
          {id:'intraday', label:'⚡ Intraday', badge: intradayPositions.length},
          {id:'fno',      label:'📊 F&O',      badge: fnoPositions.length},
          {id:'chain',    label:'🔗 Options Chain'},
          {id:'log',      label:'📋 Trade Log', badge: tradeLog.length},
        ].map(({id,label,badge})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab===id?'bg-white dark:bg-darkCard text-primary shadow-sm':'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {label}
            {badge>0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Intraday Tab ── */}
      {tab==='intraday' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <OrderPanel mode="intraday" ticker={intradayTicker} setTicker={setIntradayTicker}
              balance={balance} prices={prices} onExecute={executeIntraday}/>
            {/* Live Ticker board */}
            <Card className="mt-4 p-4">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Live Prices</h3>
              <div className="space-y-1.5">
                {['AAPL','MSFT','TSLA','NVDA','GOOGL','JPM','META'].map(t=>{
                  const p=prices[t];
                  const base=BASE_PRICES[t];
                  const chg=((p-base)/base)*100;
                  return (
                    <div key={t} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-darkBorder/30 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-darkBg/40 rounded px-2"
                      onClick={()=>setIntradayTicker(t)}>
                      <span className={`text-xs font-extrabold ${intradayTicker===t?'text-primary':''}`}>{t}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-800 dark:text-white">${fmt(p)}</span>
                        <span className={`ml-2 text-[10px] font-bold ${clr(chg)}`}>{fmtP(chg)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <IntradayPositions positions={intradayPositions} prices={prices} onSquareOff={squareOff} onSquareAll={squareAll}/>
          </div>
        </div>
      )}

      {/* ── F&O Tab ── */}
      {tab==='fno' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <FnOOrderPanel balance={balance} prices={prices} onExecute={executeFnO}/>
          </div>
          <div className="lg:col-span-2">
            <FnOPositions positions={fnoPositions} prices={prices} onExit={exitFnO}/>
          </div>
        </div>
      )}

      {/* ── Options Chain Tab ── */}
      {tab==='chain' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(LOT_SIZES).map(u=>(
              <button key={u}
                onClick={()=>setFnoPositions(p=>p)} // just selecting: we use chainTrade to execute
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-300 font-semibold hover:bg-primary/10 hover:text-primary transition-all">
                {u} — ${fmt(prices[u]||BASE_PRICES[u]||0)}
              </button>
            ))}
          </div>
          <OptionsChain underlying={fnoUnderlying} spot={chainSpot} prices={prices}
            onTrade={(info)=>chainTrade({...info, underlying: fnoUnderlying})}/>
        </div>
      )}

      {/* ── Trade Log Tab ── */}
      {tab==='log' && (
        <TradeLog trades={tradeLog}/>
      )}

    </div>
  );
}
