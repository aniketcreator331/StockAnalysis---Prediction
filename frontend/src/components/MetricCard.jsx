import React from 'react';

const MetricCard = ({ title, value, icon: Icon, colorClass, change }) => {
  return (
    <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide uppercase">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20 dark:bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h2>
        {change !== undefined && (
          <p className={`text-sm font-medium flex items-center ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className="mr-1">{change >= 0 ? '+' : ''}{change}%</span>
            <span className="text-gray-400 font-normal ml-1">since last close</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
