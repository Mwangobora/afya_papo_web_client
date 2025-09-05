import React, { useMemo } from 'react';

const Reports: React.FC = () => {
  const reports = useMemo(() => ([
    { id: 'rep-1', name: 'Daily Incident Summary', date: '2025-09-05', status: 'Ready' },
    { id: 'rep-2', name: 'Weekly Response Performance', date: '2025-09-01', status: 'Ready' },
  ]), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h1>
        <button className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">Generate Report</button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-800">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;


