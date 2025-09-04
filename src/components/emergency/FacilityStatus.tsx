import React from 'react';
import { useFacility } from '../../hooks/useFacility';

const FacilityStatus: React.FC = () => {
  const { facility, loading } = useFacility();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🏥</div>
          <p className="text-gray-500">No facility data available</p>
        </div>
      </div>
    );
  }

  const bedStatus = {
    total: facility.bedCapacity,
    occupied: facility.currentOccupancy,
    available: facility.bedCapacity - facility.currentOccupancy,
    emergency: facility.emergencyBeds,
    icu: facility.icuBeds,
  };

  const ambulanceStatus = {
    total: facility.ambulanceFleet.length,
    available: facility.ambulanceFleet.filter(amb => amb.status === 'AVAILABLE').length,
    dispatched: facility.ambulanceFleet.filter(amb => amb.status === 'DISPATCHED').length,
    enRoute: facility.ambulanceFleet.filter(amb => amb.status === 'EN_ROUTE').length,
  };

  const occupancyRate = Math.round(facility.occupancyRate);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Facility Status</h3>
        <p className="text-sm text-gray-500">{facility.name}</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Bed Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Bed Capacity</h4>
            <span className={`text-sm font-medium ${
              occupancyRate > 90 ? 'text-red-600' : 
              occupancyRate > 75 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {occupancyRate}% occupied
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full ${
                occupancyRate > 90 ? 'bg-red-500' : 
                occupancyRate > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Available:</span>
              <span className="font-medium text-green-600">{bedStatus.available}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Occupied:</span>
              <span className="font-medium text-red-600">{bedStatus.occupied}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency:</span>
              <span className="font-medium">{bedStatus.emergency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ICU:</span>
              <span className="font-medium">{bedStatus.icu}</span>
            </div>
          </div>
        </div>

        {/* Ambulance Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Ambulance Fleet</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Available:</span>
              <span className="font-medium text-green-600">{ambulanceStatus.available}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dispatched:</span>
              <span className="font-medium text-red-600">{ambulanceStatus.dispatched}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En Route:</span>
              <span className="font-medium text-yellow-600">{ambulanceStatus.enRoute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{ambulanceStatus.total}</span>
            </div>
          </div>
        </div>

        {/* Facility Capabilities */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Capabilities</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className={facility.acceptsEmergencies ? 'text-green-500' : 'text-red-500'}>
                {facility.acceptsEmergencies ? '✅' : '❌'}
              </span>
              <span className="text-gray-600">Emergency Room</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={facility.hasSurgery ? 'text-green-500' : 'text-red-500'}>
                {facility.hasSurgery ? '✅' : '❌'}
              </span>
              <span className="text-gray-600">Surgery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={facility.hasICU ? 'text-green-500' : 'text-red-500'}>
                {facility.hasICU ? '✅' : '❌'}
              </span>
              <span className="text-gray-600">ICU</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={facility.hasMaternity ? 'text-green-500' : 'text-red-500'}>
                {facility.hasMaternity ? '✅' : '❌'}
              </span>
              <span className="text-gray-600">Maternity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityStatus;
