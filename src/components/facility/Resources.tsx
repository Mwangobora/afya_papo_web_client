import React, { useMemo, useState } from 'react';

type ResourceRow = { id: string; name: string; quantity: number; status: string };

const Resources: React.FC = () => {
  const [query, setQuery] = useState('');
  const rows = useMemo<ResourceRow[]>(() => ([
    { id: 'r1', name: 'Oxygen Cylinders', quantity: 24, status: 'OK' },
    { id: 'r2', name: 'Ventilators', quantity: 5, status: 'LOW' },
    { id: 'r3', name: 'PPE Kits', quantity: 200, status: 'OK' },
  ]), []);

  const filtered = rows.filter(r =>
    [r.name, r.status].some(v => v.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Resource Management</h1>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search resources..." className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm" />
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Resources;


