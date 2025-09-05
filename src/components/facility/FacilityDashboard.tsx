import React, { useMemo } from 'react';

const FacilityDashboard: React.FC = () => {
  const stats = useMemo(() => ({
    totalBeds: 120,
    occupiedBeds: 83,
    icuBeds: 12,
    ambulancesAvailable: 4,
  }), []);

  const departments = useMemo(() => ([
    { name: 'Emergency', occupancy: '78%', status: 'Operational' },
    { name: 'ICU', occupancy: '92%', status: 'High Load' },
    { name: 'Maternity', occupancy: '61%', status: 'Operational' },
  ]), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Total Beds</div>
          <div className="mt-2 text-2xl font-semibold">{stats.totalBeds}</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Occupied Beds</div>
          <div className="mt-2 text-2xl font-semibold">{stats.occupiedBeds}</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">ICU Beds</div>
          <div className="mt-2 text-2xl font-semibold">{stats.icuBeds}</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Ambulances Available</div>
          <div className="mt-2 text-2xl font-semibold">{stats.ambulancesAvailable}</div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Department</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Occupancy</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.name} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.occupancy}</td>
                <td className="px-4 py-3">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacilityDashboard;


