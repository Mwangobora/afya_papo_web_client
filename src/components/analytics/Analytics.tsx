import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Incidents Today</div>
          <div className="mt-2 text-2xl font-semibold">18</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Avg. Response Time</div>
          <div className="mt-2 text-2xl font-semibold">7m 42s</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Ambulances Dispatched</div>
          <div className="mt-2 text-2xl font-semibold">9</div>
        </div>
      </div>

      <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Trends</div>
        <div className="h-56 flex items-center justify-center text-gray-500">Chart placeholder</div>
      </div>
    </div>
  );
};

export default Analytics;


