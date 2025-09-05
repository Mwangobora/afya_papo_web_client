import React, { useMemo, useState } from 'react';
import DispatchControl from './DispatchControl';

type AmbulanceRow = { id: string; unitNumber: string; status: string; equipmentLevel: string };

const Ambulances: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showDispatch, setShowDispatch] = useState(false);
  const rows = useMemo<AmbulanceRow[]>(() => ([
    { id: 'a1', unitNumber: 'AMB-01', status: 'AVAILABLE', equipmentLevel: 'ADVANCED' },
    { id: 'a2', unitNumber: 'AMB-02', status: 'DISPATCHED', equipmentLevel: 'BASIC' },
  ]), []);

  const filtered = rows.filter(r =>
    [r.unitNumber, r.status, r.equipmentLevel].some(v => v.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Ambulance Fleet</h1>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ambulances..." className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm" />
          <button onClick={() => setShowDispatch(!showDispatch)} className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">
            {showDispatch ? 'Hide Dispatch' : 'Show Dispatch'}
          </button>
        </div>
      </div>
      
      {showDispatch && <DispatchControl />}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Equipment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{r.unitNumber}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{r.equipmentLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ambulances;


