import React, { useMemo, useState } from 'react';

type BedRow = { id: string; bedNumber: string; type: string; status: string; hasOxygen: boolean };

const Beds: React.FC = () => {
  const [query, setQuery] = useState('');
  const rows = useMemo<BedRow[]>(() => ([
    { id: 'b1', bedNumber: 'E-01', type: 'EMERGENCY', status: 'OCCUPIED', hasOxygen: true },
    { id: 'b2', bedNumber: 'E-02', type: 'EMERGENCY', status: 'AVAILABLE', hasOxygen: true },
    { id: 'b3', bedNumber: 'ICU-01', type: 'ICU', status: 'OCCUPIED', hasOxygen: true },
    { id: 'b4', bedNumber: 'G-10', type: 'GENERAL', status: 'MAINTENANCE', hasOxygen: false },
  ]), []);

  const filtered = rows.filter(r =>
    [r.bedNumber, r.type, r.status].some(v => v.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Bed Management</h1>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search beds..." className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm" />
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">Bed</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Oxygen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{r.bedNumber}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{r.hasOxygen ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Beds;


