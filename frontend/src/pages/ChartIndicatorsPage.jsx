import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { BarChart3, Activity, RefreshCw } from 'lucide-react';
import { stockApi } from '../services/api';
import { STOCK_SYMBOLS } from '../data/stockSymbols';

const PERIOD_OPTIONS = ['1mo', '3mo', '6mo', '1y'];
const INTERVAL_OPTIONS = ['1d', '1h', '15m'];

function toFixedOrDash(value, digits = 2) {
  if (!Number.isFinite(value)) return '--';
  return Number(value).toFixed(digits);
}

function computeEMA(values, period) {
  if (!Array.isArray(values) || values.length === 0 || period <= 1) return [];
  const k = 2 / (period + 1);
  const out = [];
  let ema = values[0];
  for (let i = 0; i < values.length; i += 1) {
    const v = Number(values[i]);
    if (!Number.isFinite(v)) {
      out.push(null);
      continue;
    }
    ema = i === 0 ? v : (v * k) + (ema * (1 - k));
    out.push(i < period - 1 ? null : Number(ema.toFixed(4)));
  }
  return out;
}

function computeRSI(values, period = 14) {
  if (!Array.isArray(values) || values.length <= period) return Array(values?.length || 0).fill(null);
  const out = Array(values.length).fill(null);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : Number((100 - (100 / (1 + (avgGain / avgLoss)))).toFixed(2));

  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : Number((100 - (100 / (1 + (avgGain / avgLoss)))).toFixed(2));
  }

  return out;
}

function computeMACD(values) {
  const ema12 = computeEMA(values, 12);
  const ema26 = computeEMA(values, 26);
  const macd = values.map((_, i) => {
    if (!Number.isFinite(ema12[i]) || !Number.isFinite(ema26[i])) return null;
    return Number((ema12[i] - ema26[i]).toFixed(4));
  });

  const compact = macd.map((v) => (Number.isFinite(v) ? v : 0));
  const signalRaw = computeEMA(compact, 9);
  const signal = signalRaw.map((v, i) => (Number.isFinite(macd[i]) ? v : null));
  const histogram = macd.map((v, i) => {
    if (!Number.isFinite(v) || !Number.isFinite(signal[i])) return null;
    return Number((v - signal[i]).toFixed(4));
  });

  return { macd, signal, histogram };
}

const ChartIndicatorsPage = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [period, setPeriod] = useState('3mo');
  const [interval, setInterval] = useState('1d');
  const [chartRows, setChartRows] = useState([]);
  const [technicalData, setTechnicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(false);
  const [showRsi, setShowRsi] = useState(true);
  const [showMacd, setShowMacd] = useState(true);

  const isDarkMode = document.documentElement.classList.contains('dark');

  const fetchChart = useCallback(async (withRetry = true) => {
    setLoading(true);
    setError('');
    try {
      const [chartResult, indicatorResult] = await Promise.allSettled([
        stockApi.getChartData(ticker, period, interval),
        stockApi.getTechnicalIndicators(ticker, period, interval),
      ]);

      if (chartResult.status !== 'fulfilled') {
        throw chartResult.reason || new Error('No chart data returned');
      }

      const chartData = chartResult.value;
      const indicatorData = indicatorResult.status === 'fulfilled' ? indicatorResult.value : null;

      if (!Array.isArray(chartData) || chartData.length === 0) {
        throw new Error('No chart data returned');
      }

      const normalized = chartData
        .map((d) => ({
          time: new Date(d.Date).getTime(),
          open: Number(d.Open),
          high: Number(d.High),
          low: Number(d.Low),
          close: Number(d.Close),
          volume: Number(d.Volume || 0),
        }))
        .filter((d) => Number.isFinite(d.time) && Number.isFinite(d.close))
        .sort((a, b) => a.time - b.time);

      setChartRows(normalized);
      setTechnicalData(indicatorData && !indicatorData.error ? indicatorData : null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      if (withRetry) {
        fetchChart(false);
        return;
      }
      setError('Could not load chart data. Try another symbol or refresh.');
    } finally {
      setLoading(false);
    }
  }, [ticker, period, interval]);

  useEffect(() => {
    fetchChart(true);
  }, [fetchChart]);

  const { priceSeries, ema20Series, ema50Series, rsiSeries, macdSeries, macdSignalSeries, macdHistogramSeries } = useMemo(() => {
    const times = chartRows.map((r) => r.time);
    const closes = chartRows.map((r) => r.close);

    const backendSeries = technicalData
      ? {
          priceSeries: technicalData.prices || [],
          ema20Series: technicalData.ema20 || [],
          ema50Series: technicalData.ema50 || [],
          rsiSeries: technicalData.rsi14 || [],
          macdSeries: technicalData.macd || [],
          macdSignalSeries: technicalData.signal || [],
          macdHistogramSeries: technicalData.histogram || [],
        }
      : null;

    if (backendSeries) {
      return backendSeries;
    }

    const ema20 = computeEMA(closes, 20);
    const ema50 = computeEMA(closes, 50);
    const rsi = computeRSI(closes, 14);
    const macd = computeMACD(closes);

    return {
      priceSeries: times.map((t, i) => ({ x: t, y: closes[i] })),
      ema20Series: times.map((t, i) => ({ x: t, y: ema20[i] })),
      ema50Series: times.map((t, i) => ({ x: t, y: ema50[i] })),
      rsiSeries: times.map((t, i) => ({ x: t, y: rsi[i] })),
      macdSeries: times.map((t, i) => ({ x: t, y: macd.macd[i] })),
      macdSignalSeries: times.map((t, i) => ({ x: t, y: macd.signal[i] })),
      macdHistogramSeries: times.map((t, i) => ({ x: t, y: macd.histogram[i] })),
    };
  }, [chartRows, technicalData]);

  const latest = chartRows[chartRows.length - 1];
  const prev = chartRows[chartRows.length - 2];
  const changePct = latest && prev && prev.close > 0
    ? ((latest.close - prev.close) / prev.close) * 100
    : 0;

  const mainSeries = useMemo(() => {
    const out = [{ name: `${ticker} Close`, data: priceSeries }];
    if (showEma20) out.push({ name: 'EMA 20', data: ema20Series });
    if (showEma50) out.push({ name: 'EMA 50', data: ema50Series });
    return out;
  }, [ticker, priceSeries, ema20Series, ema50Series, showEma20, showEma50]);

  const mainOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: true },
      background: 'transparent',
    },
    stroke: { curve: 'smooth', width: [3, 2, 2] },
    colors: ['#2563eb', '#10b981', '#f59e0b'],
    grid: { borderColor: isDarkMode ? '#374151' : '#e5e7eb', strokeDashArray: 3 },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' } },
    },
    yaxis: {
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' },
        formatter: (v) => `$${toFixedOrDash(v)}`,
      },
    },
    legend: { position: 'top', labels: { colors: isDarkMode ? '#d1d5db' : '#374151' } },
    tooltip: { x: { format: 'dd MMM HH:mm' } },
  }), [isDarkMode]);

  const rsiOptions = useMemo(() => ({
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#8b5cf6'],
    xaxis: { type: 'datetime', labels: { show: false } },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' } },
    },
    annotations: {
      yaxis: [
        { y: 70, borderColor: '#ef4444', label: { text: 'Overbought', style: { background: '#ef4444', color: '#fff' } } },
        { y: 30, borderColor: '#10b981', label: { text: 'Oversold', style: { background: '#10b981', color: '#fff' } } },
      ],
    },
    grid: { borderColor: isDarkMode ? '#374151' : '#e5e7eb' },
  }), [isDarkMode]);

  const macdOptions = useMemo(() => ({
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: [2, 2, 1] },
    colors: ['#0ea5e9', '#f97316', '#a78bfa'],
    xaxis: { type: 'datetime', labels: { show: false } },
    yaxis: { labels: { style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' } } },
    grid: { borderColor: isDarkMode ? '#374151' : '#e5e7eb' },
    plotOptions: {
      bar: { columnWidth: '70%' },
    },
    legend: { labels: { colors: isDarkMode ? '#d1d5db' : '#374151' } },
  }), [isDarkMode]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3 rounded-xl">
              <BarChart3 className="text-indigo-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">Technical Analysis</h1>
              <p className="text-sm font-semibold text-gray-400 mt-0.5">Real-time indicators with fast fallback and retries</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              list="technical-chart-symbols"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-sm font-bold text-gray-900 dark:text-white"
              placeholder="Ticker"
            />
            <datalist id="technical-chart-symbols">
              {STOCK_SYMBOLS.slice(0, 220).map((symbol) => <option key={symbol} value={symbol} />)}
            </datalist>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-sm font-bold text-gray-900 dark:text-white"
            >
              {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-sm font-bold text-gray-900 dark:text-white"
            >
              {INTERVAL_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>

            <button
              onClick={() => fetchChart(true)}
              className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold inline-flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 min-h-[420px]">
            <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300 font-bold">
              <Activity size={16} className="text-primary" />
              Price & Moving Averages
            </div>

            {loading ? (
              <div className="h-[340px] rounded-2xl border border-dashed border-gray-200 dark:border-darkBorder flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                Loading technical chart...
              </div>
            ) : error ? (
              <div className="h-[340px] rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-red-600 dark:text-red-300">
                <p>{error}</p>
                <button onClick={() => fetchChart(true)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">Retry</button>
              </div>
            ) : (
              <Chart options={mainOptions} series={mainSeries} type="line" height={340} />
            )}
          </div>

          {showRsi && !loading && !error && (
            <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-900 dark:text-white mb-3">RSI (14)</h2>
              <Chart options={rsiOptions} series={[{ name: 'RSI', data: rsiSeries }]} type="line" height={180} />
            </div>
          )}

          {showMacd && !loading && !error && (
            <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-900 dark:text-white mb-3">MACD (12, 26, 9)</h2>
              <Chart
                options={macdOptions}
                series={[
                  { name: 'MACD', data: macdSeries, type: 'line' },
                  { name: 'Signal', data: macdSignalSeries, type: 'line' },
                  { name: 'Histogram', data: macdHistogramSeries, type: 'column' },
                ]}
                type="line"
                height={200}
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 space-y-3">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Snapshot</h2>
            <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 text-sm">
              <p className="text-gray-500">Ticker</p>
              <p className="font-black text-gray-900 dark:text-white">{ticker}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 text-sm">
              <p className="text-gray-500">Last Close</p>
              <p className="font-black text-gray-900 dark:text-white">${toFixedOrDash(latest?.close)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 text-sm">
              <p className="text-gray-500">Daily Move</p>
              <p className={`font-black ${changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{changePct >= 0 ? '+' : ''}{toFixedOrDash(changePct)}%</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-3 text-sm">
              <p className="text-gray-500">Volume</p>
              <p className="font-black text-gray-900 dark:text-white">{Number.isFinite(latest?.volume) ? latest.volume.toLocaleString('en-US') : '--'}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {technicalData?.updated_at || lastUpdated || '--'}</p>
          </div>

          <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 space-y-3">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Indicators</h2>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
              EMA 20
              <input type="checkbox" checked={showEma20} onChange={(e) => setShowEma20(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
              EMA 50
              <input type="checkbox" checked={showEma50} onChange={(e) => setShowEma50(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
              RSI
              <input type="checkbox" checked={showRsi} onChange={(e) => setShowRsi(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
              MACD
              <input type="checkbox" checked={showMacd} onChange={(e) => setShowMacd(e.target.checked)} />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data fetch includes retry and uses backend provider fallback for faster and more stable chart loading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartIndicatorsPage;
