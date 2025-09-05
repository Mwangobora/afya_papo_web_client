import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [realtime, setRealtime] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
      <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
          Enable Dark Mode
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={realtime} onChange={(e) => setRealtime(e.target.checked)} />
          Real-time Updates
        </label>
        <button className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">Save</button>
      </div>
    </div>
  );
};

export default Settings;


