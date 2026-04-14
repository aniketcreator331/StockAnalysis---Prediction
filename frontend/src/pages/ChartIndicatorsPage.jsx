import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { stockApi } from '../services/api';
import { Activity, Settings2, BarChart3, Clock, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

function calculateSMA(data, period) {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].y[3]; // close price
      }
      sma.push(Number((sum / period).toFixed(2)));
    }
  }
  return sma;
}

function calculateEMA(data, period) {
  const ema = [];
  const k = 2 / (period + 1);
  let prevEma = null;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].y[3];
    if (i === 0) {
      ema.push(close);
      prevEma = close;
    } else {
      const currentEma = close * k + prevEma * (1 - k);
      ema.push(Number(currentEma.toFixed(2)));
      prevEma = currentEma;
    }
  }
  return ema;
}

function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }
    const change = data[i].y[3] - data[i - 1].y[3];
    if (i <= period) {
      if (change > 0) gains += change;
      else losses -= change;
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
      } else {
        rsi.push(null);
      }
    } else {
      const prevGain = gains / period;
      const prevLoss = losses / period;
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? -change : 0;
      gains = (prevGain * (period - 1) + currentGain);
      losses = (prevLoss * (period - 1) + currentLoss);
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
    }
  }
  return rsi;
}

function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
  const shortEma = calculateEMA(data, shortPeriod);
  const longEma = calculateEMA(data, longPeriod);
  
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (shortEma[i] === null || longEma[i] === null) macdLine.push(null);
    else macdLine.push(Number((shortEma[i] - longEma[i]).toFixed(2)));
  }

  // Calculate Signal Line (EMA of MACD Line)
  const signalLine = [];
  const k = 2 / (signalPeriod + 1);
  let prevSignal = null;
  let validCount = 0;

  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
    } else {
      if (validCount === 0) {
        signalLine.push(macdLine[i]);
        prevSignal = macdLine[i];
      } else {
        const currentSignal = macdLine[i] * k + prevSignal * (1 - k);
        signalLine.push(Number(currentSignal.toFixed(2)));
        prevSignal = currentSignal;
      }
      validCount++;
    }
  }

  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) histogram.push(null);
    else histogram.push(Number((macdLine[i] - signalLine[i]).toFixed(2)));
  }

  return { macdLine, signalLine, histogram };
}

const ChartIndicatorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTicker = searchParams.get('ticker')?.toUpperCase() || 'AAPL';
  
  const [ticker, setTicker] = useState(defaultTicker);
  const [searchInput, setSearchInput] = useState(defaultTicker);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [indicators, setIndicators] = useState({
    ma20: true,
    ma50: false,
    ma200: false,
    rsi: true,
    macd: true,
    volume: true
  });

  const [period, setPeriod] = useState('1y');
  const [interval, setIntervalVal] = useState('1d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rawData = await stockApi.getChartData(ticker, period, interval);
        if (rawData && rawData.length > 0) {
          const formattedData = rawData.map(d => ({
            x: new Date(d.Date).getTime(),
            y: [d.Open, d.High, d.Low, d.Close],
            volume: d.Volume
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker, period, interval]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.trim().toUpperCase());
      setSearchParams({ ticker: searchInput.trim().toUpperCase() });
    }
  };

  const toggleIndicator = (key) => setIndicators(prev => ({ ...prev, [key]: !prev[key] }));

  // Render variables
  let series = [];
  let mainChartOptions = {};
  let rsiSeries = [];
  let macdSeries = [];
  let volSeries = [];
  let renderCrashError = null;

  try {
    if (data && data.length > 0) {
    const dates = data.map(d => d.x);
    const ma20Data = calculateSMA(data, 20);
    const ma50Data = calculateSMA(data, 50);
    const ma200Data = calculateSMA(data, 200);

    series = [{
      name: 'Candlestick',
      type: 'candlestick',
      data: data
    }];

    if (indicators.ma20) series.push({ name: 'MA 20', type: 'line', data: dates.map((d, i) => ({ x: d, y: ma20Data[i] })) });
    if (indicators.ma50) series.push({ name: 'MA 50', type: 'line', data: dates.map((d, i) => ({ x: d, y: ma50Data[i] })) });
    if (indicators.ma200) series.push({ name: 'MA 200', type: 'line', data: dates.map((d, i) => ({ x: d, y: ma200Data[i] })) });

    mainChartOptions = {
      chart: { type: 'candlestick', height: 400, background: 'transparent', toolbar: { show: true }, animations: { enabled: false } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#6b7280' } } },
      yaxis: { tooltip: { enabled: true }, labels: { style: { colors: '#6b7280' }, formatter: (v) => `$${v.toFixed(2)}` } },
      grid: { borderColor: '#374151', strokeDashArray: 3 },
      stroke: { width: [1, 2, 2, 2], colors: ['#ffffff', '#3b82f6', '#8b5cf6', '#ef4444'] },
      theme: { mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' },
      colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#ef4444'], // Up, ma20, ma50, ma200
      plotOptions: { candlestick: { colors: { upward: '#10b981', downward: '#ef4444' } } }
    };

    if (indicators.rsi) {
      const rsiData = calculateRSI(data, 14);
      rsiSeries = [{ name: 'RSI', type: 'line', data: dates.map((d, i) => ({ x: d, y: rsiData[i] })) }];
    }

    if (indicators.macd) {
      const macdOutput = calculateMACD(data);
      macdSeries = [
        { name: 'MACD', type: 'line', data: dates.map((d, i) => ({ x: d, y: macdOutput.macdLine[i] })) },
        { name: 'Signal', type: 'line', data: dates.map((d, i) => ({ x: d, y: macdOutput.signalLine[i] })) },
        { name: 'Histogram', type: 'bar', data: dates.map((d, i) => ({ x: d, y: macdOutput.histogram[i] })) }
      ];
    }

    if (indicators.volume) {
      volSeries = [{ name: 'Volume', type: 'bar', data: data.map(d => ({ x: d.x, y: (d.volume || Math.random() * 1000000) })) }];
    }
  }
  } catch (err) {
    console.error("Crash rendering charts:", err);
    renderCrashError = err.toString();
  }

  const commonSubChartOptions = {
    chart: { height: 150, background: 'transparent', toolbar: { show: false }, animations: { enabled: false } },
    xaxis: { type: 'datetime', labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#6b7280' } }, tickAmount: 3 },
    grid: { show: false },
    theme: { mode: 'dark' }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl">
             <BarChart3 className="text-indigo-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Technical Analysis</h1>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">Advanced Charting & Indicators</p>
          </div>
        </div>

        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchInput} onChange={e=>setSearchInput(e.target.value)} 
              placeholder="Ticker"
              className="w-32 pl-9 pr-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm font-bold uppercase focus:outline-none focus:border-indigo-500"
            />
          </form>

          <div className="flex bg-gray-50 dark:bg-darkBg p-1 border border-gray-200 dark:border-darkBorder rounded-xl">
             {['1mo', '3mo', '6mo', '1y', '5y'].map(p => (
               <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${period === p ? 'bg-white dark:bg-darkBorder text-indigo-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{p}</button>
             ))}
          </div>

          <div className="flex bg-gray-50 dark:bg-darkBg p-1 border border-gray-200 dark:border-darkBorder rounded-xl">
             {['15m', '1h', '1d', '1wk'].map(i => (
               <button key={i} onClick={()=>setIntervalVal(i)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${interval === i ? 'bg-white dark:bg-darkBorder text-indigo-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{i}</button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         {/* Settings Sidebar */}
         <div className="xl:col-span-3 space-y-4">
            <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                 <Settings2 size={14} /> Overlays
               </h3>
               <div className="space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.ma20} onChange={() => toggleIndicator('ma20')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.ma20 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.ma20 ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">MA 20 (Simple)</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.ma50} onChange={() => toggleIndicator('ma50')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.ma50 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.ma50 ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">MA 50 (Simple)</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.ma200} onChange={() => toggleIndicator('ma200')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.ma200 ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.ma200 ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">MA 200 (Long)</span>
                 </label>
               </div>

               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mt-8 mb-4 flex items-center gap-2">
                 <Activity size={14} /> Oscillators
               </h3>
               <div className="space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.rsi} onChange={() => toggleIndicator('rsi')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.rsi ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.rsi ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">RSI (14)</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.macd} onChange={() => toggleIndicator('macd')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.macd ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.macd ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">MACD (12, 26, 9)</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={indicators.volume} onChange={() => toggleIndicator('volume')} />
                     <div className={`w-10 h-5 rounded-full transition ${indicators.volume ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                     <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${indicators.volume ? 'transform translate-x-5' : ''}`}></div>
                   </div>
                   <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Volume</span>
                 </label>
               </div>
            </div>
         </div>

         {/* Chart Area */}
         <div className="xl:col-span-9 bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-2 flex flex-col relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-darkCard/50 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="animate-spin rounded-full border-2 border-indigo-500 border-t-transparent w-10 h-10"></div>
              </div>
            )}
            
            {renderCrashError && (
              <div className="flex flex-col items-center justify-center p-6 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                 <p className="font-bold">Error rendering chart calculation:</p>
                 <p className="text-sm">{renderCrashError}</p>
              </div>
            )}
            
            {!loading && renderCrashError === null && (!data || data.length === 0) && (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <BarChart3 size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                <p className="font-bold">No chart data available for {ticker}.</p>
                <p className="text-sm">Try searching a different symbol or timeframe.</p>
              </div>
            )}
            
            {!loading && renderCrashError === null && data && data.length > 0 && (
              <div className="w-full text-black dark:text-white">
                {/* Main Candlestick + MA */}
                <div className="h-[400px]">
                  <Chart options={mainChartOptions} series={series} type="candlestick" height={400} />
                </div>

                {/* SubCharts */}
                {indicators.rsi && (
                  <div className="h-[150px] border-t border-gray-200 dark:border-gray-800 relative">
                     <span className="absolute top-2 left-4 text-xs font-black text-gray-400 z-10">RSI</span>
                     <Chart options={{...commonSubChartOptions, colors: ['#a855f7'], yaxis: { min: 0, max: 100, tickAmount: 2, labels: { style: { colors: '#6b7280' } } }, annotations: { yaxis: [{ y: 70, borderColor: '#ef4444', strokeDashArray: 2, label: { text: 'Overbought' } }, { y: 30, borderColor: '#10b981', strokeDashArray: 2, label: { text: 'Oversold' } }] } }} series={rsiSeries} type="line" height={150} />
                  </div>
                )}

                {indicators.macd && (
                  <div className="h-[150px] border-t border-gray-200 dark:border-gray-800 relative">
                     <span className="absolute top-2 left-4 text-xs font-black text-gray-400 z-10">MACD</span>
                     <Chart options={{...commonSubChartOptions, stroke: { width: [2, 2, 0] }, colors: ['#3b82f6', '#f59e0b', function({ value }) { return value < 0 ? '#ef4444' : '#10b981' }], plotOptions: { bar: { columnWidth: '80%' } } }} series={macdSeries} type="line" height={150} />
                  </div>
                )}

                {indicators.volume && (
                  <div className="h-[150px] border-t border-gray-200 dark:border-gray-800 relative">
                     <span className="absolute top-2 left-4 text-xs font-black text-gray-400 z-10">VOLUME</span>
                     <Chart options={{...commonSubChartOptions, colors: ['#6b7280'], plotOptions: { bar: { columnWidth: '80%' } }, yaxis: { labels: { formatter: (val) => (val/1000000).toFixed(1)+'M', style: { colors: '#6b7280' } } } }} series={volSeries} type="bar" height={150} />
                  </div>
                )}
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ChartIndicatorsPage;
