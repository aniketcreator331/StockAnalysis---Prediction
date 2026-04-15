import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { stockApi } from '../services/api';
import { Activity, Settings2, BarChart3, Clock, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

// Chart indicators coming soon

const ChartIndicatorsPage = () => {
  const [ticker, setTicker] = useState('AAPL');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl">
            <BarChart3 className="text-indigo-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Technical Analysis</h1>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">Advanced Charting & Indicators</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-20 flex flex-col items-center justify-center text-center">
        <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Technical Analysis Page</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Chart indicators component is loading...</p>
      </div>
    </div>
  );
};

export default ChartIndicatorsPage;
