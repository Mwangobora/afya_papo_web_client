import React, { useState } from 'react';

type Ambulance = {
  id: string;
  unitNumber: string;
  status: string;
  equipmentLevel: string;
};

type Incident = {
  id: string;
  incidentNumber: string;
  location: string;
  priority: string;
};

const DispatchControl: React.FC = () => {
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Mock data - replace with real API calls
  const ambulances: Ambulance[] = [
    { id: 'a1', unitNumber: 'AMB-01', status: 'AVAILABLE', equipmentLevel: 'ADVANCED' },
    { id: 'a2', unitNumber: 'AMB-02', status: 'DISPATCHED', equipmentLevel: 'BASIC' },
  ];

  const incidents: Incident[] = [
    { id: 'i1', incidentNumber: 'INC-001', location: 'Downtown', priority: 'HIGH' },
    { id: 'i2', incidentNumber: 'INC-002', location: 'Suburbs', priority: 'MEDIUM' },
  ];

  const handleDispatch = async () => {
    if (!selectedAmbulance || !selectedIncident) return;
    
    setIsDispatching(true);
    try {
      // TODO: Replace with real API call
      console.log('Dispatching ambulance:', selectedAmbulance, 'to incident:', selectedIncident);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Ambulance dispatched successfully!');
      setSelectedAmbulance('');
      setSelectedIncident('');
    } catch (error) {
      alert('Failed to dispatch ambulance');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dispatch Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-medium mb-4">Available Ambulances</h3>
          <div className="space-y-2">
            {ambulances.filter(a => a.status === 'AVAILABLE').map(ambulance => (
              <label key={ambulance.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ambulance"
                  value={ambulance.id}
                  checked={selectedAmbulance === ambulance.id}
                  onChange={(e) => setSelectedAmbulance(e.target.value)}
                />
                <span>{ambulance.unitNumber} ({ambulance.equipmentLevel})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-medium mb-4">Active Incidents</h3>
          <div className="space-y-2">
            {incidents.map(incident => (
              <label key={incident.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="incident"
                  value={incident.id}
                  checked={selectedIncident === incident.id}
                  onChange={(e) => setSelectedIncident(e.target.value)}
                />
                <span>{incident.incidentNumber} - {incident.location} ({incident.priority})</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDispatch}
          disabled={!selectedAmbulance || !selectedIncident || isDispatching}
          className="px-6 py-3 text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDispatching ? 'Dispatching...' : 'Dispatch Ambulance'}
        </button>
      </div>
    </div>
  );
};

export default DispatchControl;
