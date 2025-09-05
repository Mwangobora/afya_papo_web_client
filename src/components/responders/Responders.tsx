import React, { useEffect, useMemo, useState } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import type { User } from '../../types/auth.types';
import ResponderModal from './ResponderModal';

type ResponderRow = Pick<User, 'id'> & {
  fullName: string;
  phoneNumber: string;
  responderType?: string | null;
  verified: boolean;
};

const mockResponders: ResponderRow[] = [
  { id: '1', fullName: 'Dr. Mwombeki', phoneNumber: '+255 700 111 222', responderType: 'DOCTOR', verified: true },
  { id: '2', fullName: 'Christa mpina', phoneNumber: '+255 700 333 444', responderType: 'NURSE', verified: false },
  { id: '3', fullName: 'Paramedic Denis mwaipopo', phoneNumber: '+255 700 555 666', responderType: 'PARAMEDIC', verified: true },
];

const Responders: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [rows, setRows] = useState<ResponderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponder, setSelectedResponder] = useState<ResponderRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasRole } = useRBAC();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // TODO: replace with real backend call when available
        // const apiRows = await respondersService.list({ ...filters });
        const apiRows: ResponderRow[] | null = null;
        const data = apiRows && Array.isArray(apiRows) ? apiRows : mockResponders;
        if (!cancelled) setRows(data);
      } catch (_e) {
        if (!cancelled) setRows(mockResponders);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesQuery = [r.fullName, r.phoneNumber, r.responderType]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(query.toLowerCase()));
      const matchesStatus =
        status === 'all' || (status === 'verified' ? r.verified : !r.verified);
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status]);

  const handleView = (responder: ResponderRow) => {
    setSelectedResponder(responder);
    setIsModalOpen(true);
  };

  const handleVerify = (id: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, verified: true } : r));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Responders</h1>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search responders..."
            className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <button className="px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">Add Responder</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        {loading ? (
          <div className="py-10 text-center">Loading responders...</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Verified</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.fullName}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{r.phoneNumber}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{r.responderType ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-md ${r.verified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {r.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(r)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-800">View</button>
                      {hasRole('HOSPITAL_ADMIN') && (
                        <button onClick={() => handleVerify(r.id)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-800">Verify</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No responders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      <ResponderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        responder={selectedResponder}
        onVerify={handleVerify}
      />
    </div>
  );
};

export default Responders;


