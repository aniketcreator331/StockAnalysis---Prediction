import React from 'react';
import Chart from 'react-apexcharts';
import { BarChart3, Activity } from 'lucide-react';

const series = [
  {
    name: 'AAPL',
    data: [12, 15, 14, 18, 17, 20, 22],
  },
];

const options = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#3b82f6'],
  grid: { borderColor: '#e5e7eb' },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yaxis: { labels: { formatter: (val) => `${val}` } },
};

const ChartIndicatorsPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm flex items-center gap-4">
        <div className="bg-indigo-500/10 p-3 rounded-xl">
          <BarChart3 className="text-indigo-500 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Technical Analysis</h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">Interactive indicators preview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 min-h-[420px]">
          <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300 font-bold">
            <Activity size={16} className="text-primary" />
            Live Chart Preview
          </div>
          <Chart options={options} series={series} type="line" height={340} />
        </div>

        <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Status</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">This page now loads immediately and can be extended with RSI, MACD, and volume overlays later.</p>
          <div className="rounded-xl bg-gray-50 dark:bg-darkBg p-4 text-sm text-gray-600 dark:text-gray-300">
            Indicator components are intentionally lightweight here to avoid the long loading state you were seeing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartIndicatorsPage;
