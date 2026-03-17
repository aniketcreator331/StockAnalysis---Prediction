import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

const CustomTooltip = ({ active, payload, label }) => {
  const { formatLocalPrice } = useCurrency();
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {formatLocalPrice(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PredictionLineChart = ({ historicalData, predictedData }) => {
  const { getConvertedValue, formatLocalPrice } = useCurrency();
  
  if (!historicalData || historicalData.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse">Loading AI prediction model...</div>;

  // Combine historical and predicted
  const combinedData = [...historicalData.map(d => ({
    time: new Date(d.Date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    actual: getConvertedValue(d.Close),
    predicted: null
  }))];

  // Assuming predictedData is an array of future prices starting from now
  const lastTime = new Date(historicalData[historicalData.length - 1].Date);
  
  if (predictedData && predictedData.length > 0) {
    // connect last point
    combinedData[combinedData.length - 1].predicted = combinedData[combinedData.length - 1].actual;
    
    predictedData.forEach((price, index) => {
      // simulate 5 minutes intervals for future predictions
      const newTime = new Date(lastTime.getTime() + (index + 1) * 5 * 60000);
      combinedData.push({
        time: newTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        actual: null,
        predicted: getConvertedValue(price)
      });
    });
  }

  // Calculate dynamic Y domain to make the chart look detailed
  const allPrices = [
    ...combinedData.filter(d => d.actual !== null).map(d => d.actual),
    ...combinedData.filter(d => d.predicted !== null).map(d => d.predicted)
  ];
  
  const min = Math.min(...allPrices) * 0.995;
  const max = Math.max(...allPrices) * 1.005;

  return (
    <ResponsiveContainer width="100%" height={450}>
      <ComposedChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#888888" 
          tickFormatter={(tick, i) => i % Math.ceil(combinedData.length / 10) === 0 ? tick : ''}
          minTickGap={20}
        />
        <YAxis 
          domain={[min, max]} 
          stroke="#888888" 
          tickFormatter={(tick) => formatLocalPrice(tick)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
        
        {/* Draw a subtle separator line where predicted starts */}
        {predictedData && predictedData.length > 0 && (
          <ReferenceLine 
            x={combinedData[combinedData.length - predictedData.length - 1].time} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label={{ position: 'top', value: 'Now', fill: '#ef4444', fontSize: 12, fontWeight: 600 }} 
          />
        )}
        
        <Line 
          type="monotone" 
          dataKey="actual" 
          name="Historical Price" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
        />
        
        <Line 
          type="monotone" 
          dataKey="predicted" 
          name="LSTM Predicted Price (Next 5-30m)" 
          stroke="#10b981" 
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PredictionLineChart;
