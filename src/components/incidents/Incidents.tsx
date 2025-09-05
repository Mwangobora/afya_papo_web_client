import React from 'react';
import { useIncidents } from '../../hooks/useIncidents';
import type { Incident } from '../../types';

const Incidents: React.FC = () => {
  // TODO: replace with real facility selection/state
  const facilityId = 'current-facility';
  const { incidents, loading, error, refetch } = useIncidents(facilityId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Incidents</h1>
        <button onClick={() => refetch()} className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center">Loading incidents...</div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">#</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Severity</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Reported</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc: Incident) => (
                <tr key={inc.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{inc.incidentNumber}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{inc.incidentType}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{inc.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(inc.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No incidents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Incidents;

