import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.daily_growth >= 0;
    return (
      <div className="p-3 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{data.symbol}</p>
        <p className="font-medium flex items-center">
          <span className="text-gray-600 dark:text-gray-400 mr-2">Daily Growth:</span>
          <span className={`${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{data.daily_growth}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const ComparisonChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse">Loading market data...</div>;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
        <XAxis 
          dataKey="symbol" 
          stroke="#888888" 
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#888888', fontSize: 12, fontWeight: 600 }}
        />
        <YAxis 
          stroke="#888888" 
          tickFormatter={(tick) => `${tick}%`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
        <Bar dataKey="daily_growth" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.daily_growth >= 0 ? '#10b981' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;
