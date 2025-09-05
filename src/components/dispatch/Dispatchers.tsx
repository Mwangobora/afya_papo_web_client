import React, { useMemo, useState } from 'react';
import DispatcherModal from './DispatcherModal';

type DispatcherRow = {
  id: string;
  fullName: string;
  phoneNumber: string;
  onDuty: boolean;
};

const Dispatchers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [onDutyOnly, setOnDutyOnly] = useState(false);
  const [selectedDispatcher, setSelectedDispatcher] = useState<DispatcherRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Replace with real data from backend service
  const dispatchers = useMemo<DispatcherRow[]>(
    () => [
      { id: '1', fullName: 'Dispatcher Peter', phoneNumber: '+255 711 000 111', onDuty: true },
      { id: '2', fullName: 'Dispatcher Mary', phoneNumber: '+255 722 222 333', onDuty: false },
    ],
    []
  );

  const filtered = useMemo(() => {
    return dispatchers.filter(d => {
      const matchesQuery = [d.fullName, d.phoneNumber]
        .some(v => String(v).toLowerCase().includes(query.toLowerCase()));
      const matchesDuty = !onDutyOnly || d.onDuty;
      return matchesQuery && matchesDuty;
    });
  }, [dispatchers, query, onDutyOnly]);

  const handleView = (dispatcher: DispatcherRow) => {
    setSelectedDispatcher(dispatcher);
    setIsModalOpen(true);
  };

  const handleToggleDuty = (id: string) => {
    // TODO: Replace with real API call
    console.log('Toggle duty for dispatcher:', id);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dispatchers</h1>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dispatchers..."
            className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onDutyOnly} onChange={(e) => setOnDutyOnly(e.target.checked)} />
            On Duty only
          </label>
          <button className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">Add Dispatcher</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Duty</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/5">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{d.fullName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{d.phoneNumber}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-md ${d.onDuty ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {d.onDuty ? 'On Duty' : 'Off Duty'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleView(d)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-800">View</button>
                    <button onClick={() => handleToggleDuty(d.id)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-800">Toggle Duty</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No dispatchers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <DispatcherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dispatcher={selectedDispatcher}
        onToggleDuty={handleToggleDuty}
      />
    </div>
  );
};

export default Dispatchers;


