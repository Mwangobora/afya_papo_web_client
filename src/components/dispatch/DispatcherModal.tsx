import React from 'react';

type DispatcherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dispatcher: {
    id: string;
    fullName: string;
    phoneNumber: string;
    onDuty: boolean;
  } | null;
  onToggleDuty?: (id: string) => void;
};

const DispatcherModal: React.FC<DispatcherModalProps> = ({ isOpen, onClose, dispatcher, onToggleDuty }) => {
  if (!isOpen || !dispatcher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dispatcher Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <div className="mt-1 text-gray-900 dark:text-white">{dispatcher.fullName}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <div className="mt-1 text-gray-900 dark:text-white">{dispatcher.phoneNumber}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <span className={`px-2 py-1 text-xs rounded-md ${dispatcher.onDuty ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                {dispatcher.onDuty ? 'On Duty' : 'Off Duty'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Close
          </button>
          {onToggleDuty && (
            <button onClick={() => onToggleDuty(dispatcher.id)} className="px-4 py-2 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700">
              {dispatcher.onDuty ? 'Set Off Duty' : 'Set On Duty'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatcherModal;
