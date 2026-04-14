import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import scarletLogo from '../assets/scarlet_logo.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────────────────────────────────────── */
const WATCHLIST_KEY = 'scarlet_watchlist';
const TABS = ['chat', 'watchlist', 'market', 'tools'];
const TAB_ICONS = { chat: '💬', watchlist: '👁', market: '🌐', tools: '🛠' };
const TAB_LABELS = { chat: 'Chat', watchlist: 'Watchlist', market: 'Market', tools: 'Tools' };

const QUICK_CMDS = [
  { label: '📈 AAPL', msg: 'What is AAPL price?' },
  { label: '💡 RSI', msg: 'Explain RSI' },
  { label: '🐂 Bull/Bear', msg: 'What is a bull market?' },
  { label: '🎮 Demo', msg: 'How does Demo Trading work?' },
  { label: '🤖 Predict', msg: 'How to use AI Prediction?' },
  { label: '📊 P/E Ratio', msg: 'Explain P/E ratio' },
];

function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return 'N/A';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCARLET SVG LOGO (inline fallback if image fails)
───────────────────────────────────────────────────────────────────────────── */
function ScarletLogo({ size = 36, glow = false, pulse = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(145deg,#00081a 0%,#00183d 40%,#000 100%)',
        border: '1.5px solid rgba(45,127,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: glow
          ? '0 0 18px rgba(45,127,255,0.7), 0 0 40px rgba(45,127,255,0.3)'
          : '0 4px 16px rgba(45,127,255,0.35)',
        animation: pulse ? 'sc-pulse 1.8s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    >
      <img
        src={scarletLogo}
        alt="Scarlet"
        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
        onError={e => {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = '<span style="font-size:' + size * 0.5 + 'px">🔴</span>';
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '6px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#2d7fff',
          animation: `sc-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 8,
      animation: 'sc-fadein 0.35s cubic-bezier(.2,.8,.4,1)',
    }}>
      {!isUser && <ScarletLogo size={26} />}
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#2d7fff 0%,#0040c0 100%)'
          : 'rgba(255,255,255,0.055)',
        color: '#fff',
        fontSize: 13,
        lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: isUser
          ? '0 4px 20px rgba(45,127,255,0.35)'
          : '0 2px 12px rgba(0,0,0,0.25)',
        wordBreak: 'break-word',
      }}>
        <div className="sc-md">
          <ReactMarkdown components={{
            p: c => <p style={{ margin: '2px 0' }}>{c.children}</p>,
            strong: c => <strong style={{ color: '#70b0ff', fontWeight: 700 }}>{c.children}</strong>,
            ul: c => <ul style={{ margin: '4px 0', paddingLeft: 18 }}>{c.children}</ul>,
            ol: c => <ol style={{ margin: '4px 0', paddingLeft: 18 }}>{c.children}</ol>,
            li: c => <li style={{ margin: '2px 0' }}>{c.children}</li>,
            code: c => <code style={{ background: 'rgba(45,127,255,0.2)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5, fontFamily: 'monospace' }}>{c.children}</code>,
            h3: c => <h3 style={{ color: '#70b0ff', fontSize: 13, margin: '6px 0 3px', fontWeight: 700 }}>{c.children}</h3>,
          }}>
            {msg.content}
          </ReactMarkdown>
        </div>
        <div style={{ fontSize: 9.5, opacity: 0.38, marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(45,127,255,0.2)', border: '1px solid rgba(45,127,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUGGESTION CHIPS
───────────────────────────────────────────────────────────────────────────── */
function SuggestionChips({ suggestions, onSelect }) {
  if (!suggestions?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: 34 }}>
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => onSelect(s)} style={{
          padding: '4px 11px', borderRadius: 20,
          border: '1px solid rgba(45,127,255,0.35)',
          background: 'rgba(45,127,255,0.07)', color: '#70b0ff',
          fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.background = 'rgba(45,127,255,0.22)'; e.target.style.borderColor = 'rgba(45,127,255,0.7)'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(45,127,255,0.07)'; e.target.style.borderColor = 'rgba(45,127,255,0.35)'; }}
        >{s}</button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WATCHLIST TAB
───────────────────────────────────────────────────────────────────────────── */
function WatchlistTab({ onAsk }) {
  const [tickers, setTickers] = useState(() => JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '["AAPL","TSLA","NVDA","MSFT"]'));
  const [input, setInput] = useState('');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState({});

  const fetchPrice = useCallback(async (sym) => {
    setLoading(p => ({ ...p, [sym]: true }));
    try {
      const r = await fetch(`${API_BASE}/api/dashboard/${sym}`);
      const d = await r.json();
      setPrices(p => ({ ...p, [sym]: d }));
    } catch { setPrices(p => ({ ...p, [sym]: { error: true } })); }
    finally { setLoading(p => ({ ...p, [sym]: false })); }
  }, []);

  useEffect(() => { tickers.forEach(fetchPrice); }, [tickers, fetchPrice]);

  const addTicker = () => {
    const sym = input.trim().toUpperCase();
    if (!sym || tickers.includes(sym)) return;
    const next = [...tickers, sym];
    setTickers(next);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
    setInput('');
    fetchPrice(sym);
  };

  const removeTicker = (sym) => {
    const next = tickers.filter(t => t !== sym);
    setTickers(next);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }} className="sc-scroll">
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        <input
          value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && addTicker()}
          placeholder="Add ticker (e.g. GOOGL)"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(45,127,255,0.25)',
            borderRadius: 10, padding: '7px 12px', color: '#fff', fontSize: 12.5,
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={addTicker} style={{
          padding: '7px 14px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#2d7fff,#0040c0)', color: '#fff',
          fontSize: 12, cursor: 'pointer', fontWeight: 600,
        }}>+ Add</button>
      </div>

      {tickers.map(sym => {
        const d = prices[sym];
        const pct = d && d.price && d.previous_close
          ? ((d.price - d.previous_close) / d.previous_close * 100).toFixed(2)
          : null;
        const up = pct !== null && parseFloat(pct) >= 0;
        return (
          <div key={sym} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center',
            gap: 10, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,127,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onClick={() => onAsk(`What is ${sym} price?`)}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: up ? 'rgba(34,215,64,0.12)' : 'rgba(45,127,255,0.12)',
              border: `1px solid ${up ? 'rgba(34,215,64,0.3)' : 'rgba(45,127,255,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: up ? '#22d740' : '#70b0ff',
            }}>{sym.slice(0, 3)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{sym}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                {loading[sym] ? 'Loading…' : d?.error ? 'Error' : d ? `$${fmtNum(d.price)}` : '—'}
              </div>
            </div>
            {pct !== null && (
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: up ? '#22d740' : '#70b0ff',
                background: up ? 'rgba(34,215,64,0.1)' : 'rgba(45,127,255,0.1)',
                padding: '3px 8px', borderRadius: 8,
              }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</div>
            )}
            <button onClick={e => { e.stopPropagation(); removeTicker(sym); }} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer', fontSize: 14, padding: '0 4px', lineHeight: 1,
            }}
              onMouseEnter={e => e.target.style.color = '#2d7fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
            >✕</button>
          </div>
        );
      })}
      {tickers.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', marginTop: 40, fontSize: 13 }}>
          No stocks in watchlist.<br />Add a ticker above!
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARKET MOOD TAB
───────────────────────────────────────────────────────────────────────────── */
function MarketTab({ onAsk }) {
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/top-stocks`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const gainers = data.filter(s => (s.daily_growth || 0) > 0).length;
        const total = data.length;
        const bullPct = Math.round((gainers / total) * 100);
        const top5 = [...data].sort((a, b) => (b.daily_growth || 0) - (a.daily_growth || 0)).slice(0, 5);
        const bot5 = [...data].sort((a, b) => (a.daily_growth || 0) - (b.daily_growth || 0)).slice(0, 5);
        setMood({ bullPct, total, gainers, top5, bot5 });
      })
      .catch(() => setMood(null))
      .finally(() => setLoading(false));
  }, []);

  const moodLabel = mood
    ? mood.bullPct >= 65 ? '🐂 Strongly Bullish'
      : mood.bullPct >= 50 ? '📈 Bullish'
        : mood.bullPct >= 35 ? '📉 Bearish'
          : '🐻 Strongly Bearish'
    : '—';

  const moodColor = mood
    ? mood.bullPct >= 50 ? '#22d740' : '#2d7fff'
    : 'rgba(255,255,255,0.3)';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }} className="sc-scroll">
      {/* Mood Gauge */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px', textAlign: 'center',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Market Sentiment</div>
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Analyzing market…</div>
        ) : mood ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: moodColor, marginBottom: 6 }}>{moodLabel}</div>
            {/* Bar */}
            <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', margin: '0 4px' }}>
              <div style={{
                height: '100%', width: `${mood.bullPct}%`,
                background: `linear-gradient(90deg, #2d7fff 0%, #22d740 100%)`,
                borderRadius: 8, transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <span>🐻 Bearish</span>
              <span>{mood.gainers}/{mood.total} stocks up ({mood.bullPct}%)</span>
              <span>Bullish 🐂</span>
            </div>
          </>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Could not load market data</div>
        )}
      </div>

      {/* Top Gainers */}
      {mood?.top5 && (
        <div>
          <div style={{ color: '#22d740', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>🏆 Top Gainers</div>
          {mood.top5.map(s => (
            <div key={s.ticker} onClick={() => onAsk(`What is ${s.ticker} price?`)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 12px', borderRadius: 10, marginBottom: 4,
                background: 'rgba(34,215,64,0.05)', border: '1px solid rgba(34,215,64,0.12)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,215,64,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,215,64,0.05)'}
            >
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 12.5 }}>{s.ticker}</span>
              <span style={{ color: '#22d740', fontWeight: 700, fontSize: 12 }}>▲ {(s.daily_growth || 0).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Top Losers */}
      {mood?.bot5 && (
        <div>
          <div style={{ color: '#2d7fff', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>📉 Top Losers</div>
          {mood.bot5.map(s => (
            <div key={s.ticker} onClick={() => onAsk(`What is ${s.ticker} price?`)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 12px', borderRadius: 10, marginBottom: 4,
                background: 'rgba(45,127,255,0.05)', border: '1px solid rgba(45,127,255,0.12)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,127,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,127,255,0.05)'}
            >
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 12.5 }}>{s.ticker}</span>
              <span style={{ color: '#70b0ff', fontWeight: 700, fontSize: 12 }}>▼ {Math.abs(s.daily_growth || 0).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOLS TAB — ROI Calculator + Compound Interest + Quick Links
───────────────────────────────────────────────────────────────────────────── */
function ToolsTab({ onAsk }) {
  const [tool, setTool] = useState('roi');
  // ROI
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [shares, setShares] = useState('');
  const roiResult = (() => {
    const b = parseFloat(buy), s = parseFloat(sell), sh = parseFloat(shares) || 1;
    if (!b || !s) return null;
    const profit = (s - b) * sh;
    const pct = ((s - b) / b * 100).toFixed(2);
    return { profit: profit.toFixed(2), pct };
  })();

  // Compound
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const compResult = (() => {
    const p = parseFloat(principal), r = parseFloat(rate), y = parseFloat(years);
    if (!p || !r || !y) return null;
    const total = p * Math.pow(1 + r / 100, y);
    return { total: total.toFixed(2), gain: (total - p).toFixed(2) };
  })();

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(45,127,255,0.2)',
    borderRadius: 9, padding: '7px 10px', color: '#fff',
    fontSize: 12.5, outline: 'none', fontFamily: 'inherit', marginBottom: 7,
  };
  const labelStyle = { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 3, display: 'block' };
  const resultBox = { background: 'rgba(45,127,255,0.1)', border: '1px solid rgba(45,127,255,0.25)', borderRadius: 10, padding: '10px 14px', marginTop: 4 };

  const quickLinks = [
    { label: '🏠 Home Page', msg: 'Take me to the home page' },
    { label: '📊 Live Dashboard', msg: 'How to use Live Dashboard?' },
    { label: '🤖 AI Predictions', msg: 'How to use AI Predictions?' },
    { label: '🎮 Demo Trading', msg: 'How does Demo Trading work?' },
    { label: '📐 Calculators', msg: 'What calculators are available?' },
    { label: '📈 Market Overview', msg: 'What is market overview?' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} className="sc-scroll">
      {/* Tool selector */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        {[{ id: 'roi', label: '📊 ROI' }, { id: 'compound', label: '💰 Compound' }, { id: 'links', label: '🔗 Links' }].map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{
            flex: 1, padding: '6px 4px', borderRadius: 9, border: 'none',
            background: tool === t.id ? 'linear-gradient(135deg,#2d7fff,#0040c0)' : 'transparent',
            color: tool === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 11.5, fontWeight: tool === t.id ? 700 : 400,
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ROI Calculator */}
      {tool === 'roi' && (
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10 }}>Calculate your stock trade profit/loss.</div>
          <label style={labelStyle}>Buy Price (per share)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 150" value={buy} onChange={e => setBuy(e.target.value)} />
          <label style={labelStyle}>Sell Price (per share)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 180" value={sell} onChange={e => setSell(e.target.value)} />
          <label style={labelStyle}>Number of Shares</label>
          <input style={inputStyle} type="number" placeholder="e.g. 10" value={shares} onChange={e => setShares(e.target.value)} />
          {roiResult && (
            <div style={resultBox}>
              <div style={{ color: parseFloat(roiResult.profit) >= 0 ? '#22d740' : '#70b0ff', fontWeight: 800, fontSize: 18 }}>
                {parseFloat(roiResult.profit) >= 0 ? '▲' : '▼'} ${Math.abs(roiResult.profit)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, marginTop: 2 }}>
                Return: <span style={{ color: parseFloat(roiResult.pct) >= 0 ? '#22d740' : '#70b0ff', fontWeight: 700 }}>{roiResult.pct}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compound Interest */}
      {tool === 'compound' && (
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10 }}>Grow your investment with compound interest.</div>
          <label style={labelStyle}>Principal Amount ($)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 10000" value={principal} onChange={e => setPrincipal(e.target.value)} />
          <label style={labelStyle}>Annual Interest Rate (%)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 12" value={rate} onChange={e => setRate(e.target.value)} />
          <label style={labelStyle}>Number of Years</label>
          <input style={inputStyle} type="number" placeholder="e.g. 5" value={years} onChange={e => setYears(e.target.value)} />
          {compResult && (
            <div style={resultBox}>
              <div style={{ color: '#70b0ff', fontWeight: 800, fontSize: 18 }}>${Number(compResult.total).toLocaleString()}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, marginTop: 2 }}>
                Total gain: <span style={{ color: '#22d740', fontWeight: 700 }}>+${Number(compResult.gain).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      {tool === 'links' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 2 }}>Quick navigation & help links</div>
          {quickLinks.map((l, i) => (
            <button key={i} onClick={() => onAsk(l.msg)} style={{
              padding: '9px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#e0e0e0',
              fontSize: 12.5, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(45,127,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(45,127,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >{l.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHAT TAB
───────────────────────────────────────────────────────────────────────────── */
function ChatTab({ messages, isLoading, onSend, suggestions }) {
  const [input, setInput] = useState('');
  const [showQuick, setShowQuick] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const send = (text) => {
    const t = (text || input).trim();
    if (!t || isLoading) return;
    setInput('');
    setShowQuick(false);
    onSend(t);
  };

  return (
    <>
      {/* Messages */}
      <div className="sc-scroll" style={{
        flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <MessageBubble msg={msg} />
            {msg.role === 'assistant' && idx === messages.length - 1 && suggestions.length > 0 && (
              <SuggestionChips suggestions={suggestions} onSelect={send} />
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <ScarletLogo size={26} pulse />
            <div style={{ padding: '8px 14px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Commands Panel */}
      {showQuick && (
        <div style={{
          padding: '8px 12px', borderTop: '1px solid rgba(45,127,255,0.12)',
          display: 'flex', flexWrap: 'wrap', gap: 5, background: 'rgba(0,0,0,0.2)',
          animation: 'sc-fadein 0.2s ease',
        }}>
          {QUICK_CMDS.map((c, i) => (
            <button key={i} onClick={() => send(c.msg)} style={{
              padding: '4px 10px', borderRadius: 20,
              border: '1px solid rgba(45,127,255,0.3)', background: 'rgba(45,127,255,0.08)',
              color: '#70b0ff', fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(45,127,255,0.2)'}
              onMouseLeave={e => e.target.style.background = 'rgba(45,127,255,0.08)'}
            >{c.label}</button>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(45,127,255,0.1)', flexShrink: 0 }} />

      {/* Input row */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: 7, alignItems: 'flex-end', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
        <button onClick={() => setShowQuick(q => !q)} style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(45,127,255,0.3)',
          background: showQuick ? 'rgba(45,127,255,0.2)' : 'rgba(255,255,255,0.05)',
          color: '#70b0ff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s',
        }} title="Quick commands">⚡</button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask Scarlet anything…"
          rows={1}
          disabled={isLoading}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(45,127,255,0.25)', borderRadius: 14,
            padding: '9px 13px', color: '#fff', fontSize: 13, resize: 'none',
            maxHeight: 90, overflowY: 'auto', fontFamily: 'inherit', lineHeight: 1.4,
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(45,127,255,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(45,127,255,0.25)'}
          className="sc-input"
        />

        <button onClick={() => send()} disabled={isLoading || !input.trim()} style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: isLoading || !input.trim() ? 'rgba(45,127,255,0.18)' : 'linear-gradient(135deg,#2d7fff,#0040c0)',
          color: '#fff', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 14px rgba(45,127,255,0.45)',
          transition: 'all 0.2s',
        }}>➤</button>
      </div>

      {/* Bottom brand */}
      <div style={{ padding: '5px 0 8px', textAlign: 'center', color: 'rgba(255,255,255,0.17)', fontSize: 10, background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
        Scarlet AI · Stock Analysis Dashboard
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ScarletAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm **Scarlet** — your AI stock market assistant 🚀\n\nI can help you:\n- 📈 Get **live stock prices**\n- 📚 Explain **market concepts**\n- 👁 Manage your **watchlist**\n- 🌐 Check **market mood**\n- 🛠 Use **financial tools**\n\nTap the tabs above or just ask me anything!",
    time: Date.now(),
    suggestions: ['Show AAPL price', 'Explain RSI', 'What is a bull market?', 'How does Demo Trading work?'],
  }]);
  const [suggestions, setSuggestions] = useState(['Show AAPL price', 'Explain RSI', 'What is a bull market?']);
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  // Focus input when switching to chat
  useEffect(() => {
    if (isOpen && !isMinimized) setUnread(0);
  }, [isOpen, isMinimized, activeTab]);

  const handleSend = async (userText) => {
    if (!userText || isLoading) return;
    const userMsg = { role: 'user', content: userText, time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setActiveTab('chat');
    setIsLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_BASE}/api/scarlet/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const aMsg = { role: 'assistant', content: data.reply, time: Date.now() };
      setMessages(prev => [...prev, aMsg]);
      setSuggestions(data.suggestions || []);
      if (!isOpen || isMinimized) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ I couldn't reach the server. Make sure the backend is running on `localhost:8000`.",
        time: Date.now(),
      }]);
    } finally { setIsLoading(false); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I'm **Scarlet** — how can I help you? 🚀",
      time: Date.now(),
      suggestions: ['Show TSLA price', 'Explain MACD', 'Top gainers today'],
    }]);
    setSuggestions(['Show TSLA price', 'Explain MACD', 'Top gainers today']);
  };

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @keyframes sc-pulse { 0%{box-shadow:0 0 0 0 rgba(45,127,255,0.7)} 70%{box-shadow:0 0 0 14px rgba(45,127,255,0)} 100%{box-shadow:0 0 0 0 rgba(45,127,255,0)} }
        @keyframes sc-bounce { 0%,80%,100%{transform:scale(0.55);opacity:0.35} 40%{transform:scale(1);opacity:1} }
        @keyframes sc-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sc-open   { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sc-fab    { from{opacity:0;transform:scale(0) rotate(-180deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        .sc-input::placeholder{color:rgba(255,255,255,0.28)}
        .sc-input:focus{outline:none}
        .sc-scroll::-webkit-scrollbar{width:3px}
        .sc-scroll::-webkit-scrollbar-track{background:transparent}
        .sc-scroll::-webkit-scrollbar-thumb{background:rgba(45,127,255,0.3);border-radius:4px}
      `}</style>

      {/* ── FAB Button ── */}
      {!isOpen && (
        <button
          id="scarlet-fab"
          onClick={() => setIsOpen(true)}
          title="Chat with Scarlet AI"
          style={{
            position: 'fixed', bottom: 28, right: 28,
            width: 62, height: 62, borderRadius: '50%',
            background: 'linear-gradient(145deg,#00081a 0%,#00183d 40%,#000 100%)',
            border: '2px solid rgba(45,127,255,0.6)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(45,127,255,0.55), 0 0 0 0 rgba(45,127,255,0.4)',
            animation: 'sc-pulse 2.5s infinite, sc-fab 0.5s cubic-bezier(.2,.8,.4,1)',
            zIndex: 9999, overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s',
            padding: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.14)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(45,127,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(45,127,255,0.55)'; }}
        >
          <img src={scarletLogo} alt="Scarlet" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              color: '#0040c0', fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #2d7fff',
            }}>{unread}</div>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div id="scarlet-chat-window" style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 400, height: isMinimized ? 72 : 600,
          borderRadius: 22,
          background: 'linear-gradient(160deg,rgba(6,10,22,0.98) 0%,rgba(6,12,28,0.98) 100%)',
          border: '1px solid rgba(45,127,255,0.2)',
          boxShadow: '0 28px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,127,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', zIndex: 9999,
          animation: 'sc-open 0.35s cubic-bezier(.2,.8,.4,1)',
          transition: 'height 0.35s cubic-bezier(.4,0,.2,1)',
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '12px 14px',
            background: 'linear-gradient(90deg,rgba(45,127,255,0.12) 0%,rgba(0,40,120,0.08) 100%)',
            borderBottom: '1px solid rgba(45,127,255,0.12)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            {/* Logo (click = minimize) */}
            <div onClick={() => setIsMinimized(m => !m)} style={{ cursor: 'pointer' }}>
              <ScarletLogo size={40} glow pulse={isLoading} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 0.2 }}>Scarlet</span>
                <span style={{ color: '#70b0ff', fontSize: 11, fontWeight: 600, background: 'rgba(45,127,255,0.15)', padding: '1px 6px', borderRadius: 6, border: '1px solid rgba(45,127,255,0.3)' }}>AI</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d740', display: 'inline-block', boxShadow: '0 0 7px #22d740', marginLeft: 2 }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>
                {isLoading ? '✦ Thinking…' : 'Stock Intelligence Assistant'}
              </div>
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { icon: '🗑', title: 'Clear chat', action: clearChat },
                { icon: isMinimized ? '⬆' : '⬇', title: isMinimized ? 'Expand' : 'Minimize', action: () => setIsMinimized(m => !m) },
                { icon: '✕', title: 'Close', action: () => setIsOpen(false) },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} title={btn.title} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', fontSize: 15,
                  padding: '3px 5px', borderRadius: 7, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.color = i === 2 ? '#2d7fff' : '#fff'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.35)'; e.target.style.background = 'none'; }}
                >{btn.icon}</button>
              ))}
            </div>
          </div>

          {/* ── Tab Bar (only when not minimized) ── */}
          {!isMinimized && (
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(45,127,255,0.1)',
              background: 'rgba(0,0,0,0.2)', flexShrink: 0,
            }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: '9px 4px', border: 'none', cursor: 'pointer',
                  background: 'none', fontSize: 12,
                  color: activeTab === tab ? '#70b0ff' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab ? '2px solid #2d7fff' : '2px solid transparent',
                  fontWeight: activeTab === tab ? 700 : 400,
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}>
                  <span style={{ fontSize: 14 }}>{TAB_ICONS[tab]}</span>
                  <span style={{ fontSize: 9.5 }}>{TAB_LABELS[tab]}</span>
                  {tab === 'chat' && isLoading && (
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2d7fff', display: 'block', animation: 'sc-pulse 1s infinite' }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Tab Content ── */}
          {!isMinimized && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {activeTab === 'chat' && (
                <ChatTab messages={messages} isLoading={isLoading} onSend={handleSend} suggestions={suggestions} />
              )}
              {activeTab === 'watchlist' && <WatchlistTab onAsk={t => { handleSend(t); setActiveTab('chat'); }} />}
              {activeTab === 'market' && <MarketTab onAsk={t => { handleSend(t); setActiveTab('chat'); }} />}
              {activeTab === 'tools' && <ToolsTab onAsk={t => { handleSend(t); setActiveTab('chat'); }} />}
            </div>
          )}
        </div>
      )}
    </>
  );
}
