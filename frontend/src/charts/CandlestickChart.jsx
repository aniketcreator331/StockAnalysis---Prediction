import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { useCurrency } from '../contexts/CurrencyContext';

const CandlestickChart = ({ data, timeInterval }) => {
  const [series, setSeries] = useState([]);
  const { formatLocalPrice, getConvertedValue } = useCurrency();

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((d) => {
        return {
          x: new Date(d.Date).getTime(),
          y: [
            getConvertedValue(d.Open), 
            getConvertedValue(d.High), 
            getConvertedValue(d.Low), 
            getConvertedValue(d.Close)
          ]
        };
      });
      setSeries([{ data: formattedData }]);
    }
  }, [data, getConvertedValue]);

  const isDarkMode = document.documentElement.classList.contains('dark');

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: 'transparent',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      text: 'Historical Price Chart',
      align: 'left',
      style: {
        color: isDarkMode ? '#f3f4f6' : '#111827',
        fontSize: '16px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        formatter: (value) => { return formatLocalPrice(value) }
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      strokeDashArray: 4,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light'
    }
  };

  if (!data || data.length === 0) return (
    <div className="h-64 flex items-center justify-center text-gray-500 font-medium">
      <div className="animate-pulse flex space-x-2 items-center">
        <div className="w-4 h-4 rounded-full bg-primary/50"></div>
        <span>Loading chart data...</span>
      </div>
    </div>
  );

  return (
    <div className="candlestick-chart">
      <Chart options={options} series={series} type="candlestick" height={450} />
    </div>
  );
};

export default CandlestickChart;
