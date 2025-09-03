# AfyaPapo Hospital Web Client Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [Real-time Dashboard](#real-time-dashboard)
5. [Bed Management System](#bed-management-system)
6. [Ambulance Fleet Management](#ambulance-fleet-management)
7. [Incoming Patient Management](#incoming-patient-management)
8. [Analytics & Reporting](#analytics--reporting)
9. [Resource Management](#resource-management)
10. [Integration Examples](#integration-examples)

## Overview

The AfyaPapo hospital web client provides comprehensive facility management capabilities for hospitals, health centers, and medical facilities across Tanzania. The system integrates with the GraphQL API to provide real-time updates on patient flow, bed availability, ambulance dispatch, and emergency coordination.

### Key Features
- **Real-time Dashboard**: Live facility status and emergency coordination
- **Bed Management**: Track bed availability and patient flow
- **Ambulance Fleet**: Manage and dispatch ambulance units
- **Patient Handovers**: Coordinate incoming emergency patients
- **Resource Management**: Track medical equipment and supplies
- **Analytics**: Performance metrics and reporting

### Supported Users
- **Hospital Administrators**: Full facility management access
- **Department Heads**: Department-specific management
- **Emergency Coordinators**: Emergency response coordination
- **Bed Managers**: Bed allocation and patient flow

## Setup & Configuration

### Web Application Setup

```javascript
// config/apollo.js
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql/',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_WS_ENDPOINT || 'ws://localhost:8000/ws/graphql/',
    connectionParams: () => ({
      Authorization: localStorage.getItem('accessToken') 
        ? `Bearer ${localStorage.getItem('accessToken')}`
        : '',
    }),
  })
);

// Authentication link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Split link based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client configuration
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      FacilityType: {
        fields: {
          bedManagement: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      },
      IncidentType: {
        fields: {
          timeline: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    }
  }
});
```

### Environment Configuration

```javascript
// .env.production
REACT_APP_GRAPHQL_ENDPOINT=https://api.afyapapo.org/graphql/
REACT_APP_WS_ENDPOINT=wss://api.afyapapo.org/ws/graphql/
REACT_APP_MAP_API_KEY=your_mapbox_api_key
REACT_APP_SENTRY_DSN=your_sentry_dsn_for_error_tracking

// .env.development
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:8000/graphql/
REACT_APP_WS_ENDPOINT=ws://localhost:8000/ws/graphql/
REACT_APP_MAP_API_KEY=your_mapbox_api_key
```

## Authentication & Authorization

### Hospital Admin Authentication

```javascript
// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADMIN_LOGIN, REFRESH_TOKEN, GET_CURRENT_USER } from '../graphql/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  const [loginMutation] = useMutation(ADMIN_LOGIN);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);

  // Get current user data
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER, {
    skip: !accessToken,
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
    setLoading(userLoading);
  }, [userData, userLoading]);

  const login = async (credentials) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: {
            username: credentials.username,
            password: credentials.password,
            userType: 'HOSPITAL_ADMIN'
          }
        }
      });

      if (data.adminLogin.success) {
        const { accessToken, refreshToken, user } = data.adminLogin;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        setAccessToken(accessToken);
        setUser(user);
        
        return { success: true, user };
      } else {
        return { success: false, errors: data.adminLogin.errors };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, errors: [error.message] };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) return false;

    try {
      const { data } = await refreshTokenMutation({
        variables: { refreshToken: storedRefreshToken }
      });

      if (data.refreshToken.success) {
        const { accessToken, refreshToken: newRefreshToken } = data.refreshToken;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        setAccessToken(accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    logout();
    return false;
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (accessToken) {
      // Refresh token every 14 minutes (1 minute before expiry)
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    hasPermission: (permission) => {
      return user?.hospitalAdminProfile?.permissions?.[permission] || false;
    },
    facilityId: user?.hospitalAdminProfile?.primaryFacility?.id,
    facility: user?.hospitalAdminProfile?.primaryFacility
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Permission-based Access Control

```javascript
// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div className="access-denied">Access Denied</div>;
  }

  return children;
};

// Usage in routing
// <ProtectedRoute requiredPermission="canManageBeds">
//   <BedManagement />
// </ProtectedRoute>
```

## Real-time Dashboard

### Main Dashboard Component

```javascript
// components/Dashboard/HospitalDashboard.js
import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { HOSPITAL_DASHBOARD, FACILITY_UPDATES } from '../graphql/hospital';
import { useAuth } from '../hooks/useAuth';

export const HospitalDashboard = () => {
  const { facilityId, facility } = useAuth();
  const [realTimeStats, setRealTimeStats] = useState(null);

  // Initial dashboard data
  const { data, loading, error, refetch } = useQuery(HOSPITAL_DASHBOARD, {
    variables: { facilityId },
    pollInterval: 30000 // Poll every 30 seconds as fallback
  });

  // Real-time updates subscription
  const { data: realtimeData } = useSubscription(FACILITY_UPDATES, {
    variables: { facilityId },
    onData: ({ data }) => {
      const update = data.data?.facilityUpdates;
      if (update) {
        setRealTimeStats(update.facility);
        // Update cache with new data
        // apolloClient.cache.modify({ ... });
      }
    }
  });

  useEffect(() => {
    if (realtimeData?.facilityUpdates) {
      setRealTimeStats(realtimeData.facilityUpdates.facility);
    }
  }, [realtimeData]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={() => refetch()} />;

  const facilityData = data?.facility;
  const currentStats = realTimeStats || facilityData;

  return (
    <div className="hospital-dashboard">
      <DashboardHeader facility={facility} />
      
      <div className="dashboard-grid">
        {/* Key Metrics Cards */}
        <div className="metrics-row">
          <MetricCard
            title="Available Beds"
            value={currentStats?.availableBeds || 0}
            total={facilityData?.bedCapacity}
            type="beds"
            trend={calculateBedTrend(currentStats)}
          />
          <MetricCard
            title="Active Emergencies"
            value={currentStats?.activeIncidents?.length || 0}
            type="emergencies"
            urgent={currentStats?.criticalIncidents || 0}
          />
          <MetricCard
            title="Ambulance Fleet"
            value={currentStats?.availableAmbulances || 0}
            total={currentStats?.totalAmbulances}
            type="ambulances"
          />
          <MetricCard
            title="Occupancy Rate"
            value={currentStats?.occupancyRate || 0}
            type="percentage"
            status={getOccupancyStatus(currentStats?.occupancyRate)}
          />
        </div>

        {/* Real-time Sections */}
        <div className="dashboard-sections">
          <IncomingPatients 
            incidents={currentStats?.activeIncidents || []}
            facilityId={facilityId}
          />
          <BedStatusOverview 
            bedManagement={currentStats?.bedManagement || []}
            facilityId={facilityId}
          />
          <AmbulanceFleetStatus 
            ambulanceFleet={currentStats?.ambulanceFleet || []}
            facilityId={facilityId}
          />
          <DepartmentStatus 
            departments={currentStats?.departments || []}
            facilityId={facilityId}
          />
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, total, type, trend, urgent, status }) => {
  return (
    <div className={`metric-card ${type} ${status || ''}`}>
      <div className="metric-header">
        <h3>{title}</h3>
        {trend && <TrendIndicator trend={trend} />}
      </div>
      
      <div className="metric-value">
        {type === 'percentage' ? (
          <span className="percentage">{value}%</span>
        ) : (
          <>
            <span className="primary-value">{value}</span>
            {total && <span className="total-value">/{total}</span>}
          </>
        )}
      </div>
      
      {urgent > 0 && (
        <div className="urgent-indicator">
          {urgent} Critical
        </div>
      )}
      
      {type === 'beds' && (
        <div className="bed-breakdown">
          <BedTypeBreakdown beds={value} />
        </div>
      )}
    </div>
  );
};
```

### GraphQL Queries for Dashboard

```javascript
// graphql/hospital.js
import { gql } from '@apollo/client';

export const HOSPITAL_DASHBOARD = gql`
  query HospitalDashboard($facilityId: ID!) {
    facility(id: $facilityId) {
      id
      name
      bedCapacity
      emergencyBeds
      icuBeds
      currentOccupancy
      occupancyRate
      
      # Real-time bed status
      bedManagement {
        id
        bedNumber
        bedType
        status
        hasOxygen
        hasVentilator
        hasMonitoring
        patientAge
        admissionType
        estimatedDischarge
      }
      
      # Active emergency incidents
      activeIncidents {
        id
        incidentNumber
        severity
        status
        estimatedArrival
        patientCount
        assignments {
          responder {
            fullName
            responderType
          }
          status
        }
      }
      
      # Ambulance fleet status
      ambulanceFleet {
        id
        unitNumber
        status
        equipmentLevel
        currentLocation {
          latitude
          longitude
        }
        currentDispatch {
          incident {
            incidentNumber
          }
          eta
          status
        }
      }
      
      # Department status
      departments {
        id
        name
        acceptsEmergencies
        currentCaseload
        availableStaff
      }
      
      # Resource inventory
      criticalResources: inventory(critical: true) {
        id
        name
        currentQuantity
        minimumQuantity
        status
      }
    }
  }
`;

export const FACILITY_UPDATES = gql`
  subscription FacilityUpdates($facilityId: ID!) {
    facilityUpdates(facilityId: $facilityId) {
      facility {
        id
        currentOccupancy
        occupancyRate
        availableBeds: bedManagement(status: AVAILABLE) {
          count
        }
        
        bedManagement {
          id
          bedNumber
          status
          updatedAt
        }
        
        activeIncidents {
          id
          incidentNumber
          severity
          status
          estimatedArrival
        }
        
        ambulanceFleet {
          id
          unitNumber
          status
          currentLocation {
            latitude
            longitude
          }
        }
      }
      updateType
      timestamp
    }
  }
`;
```

## Bed Management System

### Bed Management Component

```javascript
// components/BedManagement/BedManager.js
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BED_MANAGEMENT, UPDATE_BED_STATUS } from '../graphql/beds';

export const BedManager = ({ facilityId }) => {
  const [selectedBed, setSelectedBed] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data, loading, refetch } = useQuery(GET_BED_MANAGEMENT, {
    variables: { facilityId },
    pollInterval: 10000 // Update every 10 seconds
  });

  const [updateBedStatus] = useMutation(UPDATE_BED_STATUS, {
    onCompleted: () => {
      refetch();
      setSelectedBed(null);
    }
  });

  const beds = data?.facility?.bedManagement || [];
  const filteredBeds = beds.filter(bed => {
    if (filter === 'all') return true;
    return bed.status.toLowerCase() === filter.toLowerCase();
  });

  const handleBedUpdate = async (bedId, updates) => {
    try {
      await updateBedStatus({
        variables: {
          input: {
            bedId,
            ...updates
          }
        }
      });
    } catch (error) {
      console.error('Failed to update bed:', error);
      // Show error notification
    }
  };

  if (loading) return <BedManagementSkeleton />;

  return (
    <div className="bed-management">
      <div className="bed-management-header">
        <h2>Bed Management</h2>
        
        {/* Filter and Summary */}
        <div className="bed-summary">
          <BedSummaryStats beds={beds} />
          <BedFilters 
            current={filter} 
            onChange={setFilter}
            counts={getBedCounts(beds)}
          />
        </div>
      </div>

      {/* Bed Grid */}
      <div className="bed-grid">
        {filteredBeds.map(bed => (
          <BedCard
            key={bed.id}
            bed={bed}
            onUpdate={handleBedUpdate}
            onSelect={setSelectedBed}
            isSelected={selectedBed?.id === bed.id}
          />
        ))}
      </div>

      {/* Bed Details Modal */}
      {selectedBed && (
        <BedDetailsModal
          bed={selectedBed}
          onClose={() => setSelectedBed(null)}
          onUpdate={handleBedUpdate}
        />
      )}
    </div>
  );
};

// Individual Bed Card Component
const BedCard = ({ bed, onUpdate, onSelect, isSelected }) => {
  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: 'green',
      OCCUPIED: 'orange',
      MAINTENANCE: 'red',
      RESERVED: 'blue'
    };
    return colors[status] || 'gray';
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'occupy':
        onUpdate(bed.id, { status: 'OCCUPIED' });
        break;
      case 'discharge':
        onUpdate(bed.id, { status: 'AVAILABLE' });
        break;
      case 'maintenance':
        onUpdate(bed.id, { status: 'MAINTENANCE' });
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className={`bed-card ${bed.status.toLowerCase()} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(bed)}
    >
      <div className="bed-header">
        <span className="bed-number">{bed.bedNumber}</span>
        <span 
          className="bed-status"
          style={{ color: getStatusColor(bed.status) }}
        >
          {bed.status}
        </span>
      </div>

      <div className="bed-type">
        {bed.bedType.replace('_', ' ')}
      </div>

      {/* Equipment Icons */}
      <div className="bed-equipment">
        {bed.hasOxygen && <EquipmentIcon type="oxygen" />}
        {bed.hasVentilator && <EquipmentIcon type="ventilator" />}
        {bed.hasMonitoring && <EquipmentIcon type="monitoring" />}
      </div>

      {/* Patient Info (if occupied) */}
      {bed.status === 'OCCUPIED' && bed.patientAge && (
        <div className="patient-info">
          <span>Age: {bed.patientAge}</span>
          {bed.estimatedDischarge && (
            <span>Est. Discharge: {formatDate(bed.estimatedDischarge)}</span>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bed-actions">
        {bed.status === 'AVAILABLE' && (
          <button onClick={(e) => {
            e.stopPropagation();
            handleQuickAction('occupy');
          }}>
            Admit Patient
          </button>
        )}
        {bed.status === 'OCCUPIED' && (
          <button onClick={(e) => {
            e.stopPropagation();
            handleQuickAction('discharge');
          }}>
            Discharge
          </button>
        )}
      </div>
    </div>
  );
};
```

### Bed Status Updates

```javascript
// graphql/beds.js
import { gql } from '@apollo/client';

export const GET_BED_MANAGEMENT = gql`
  query GetBedManagement($facilityId: ID!) {
    facility(id: $facilityId) {
      id
      bedManagement {
        id
        bedNumber
        bedType
        status
        hasOxygen
        hasVentilator
        hasMonitoring
        patientAge
        admissionType
        estimatedDischarge
        updatedAt
      }
    }
  }
`;

export const UPDATE_BED_STATUS = gql`
  mutation UpdateBedStatus($input: UpdateBedStatusInput!) {
    updateBedStatus(input: $input) {
      id
      status
      patientAge
      admissionType
      estimatedDischarge
      updatedAt
    }
  }
`;

export const BED_UPDATES = gql`
  subscription BedUpdates($facilityId: ID!) {
    bedUpdates(facilityId: $facilityId) {
      bed {
        id
        bedNumber
        status
        patientAge
        estimatedDischarge
      }
      updateType
      timestamp
    }
  }
`;
```

## Ambulance Fleet Management

### Fleet Management Component

```javascript
// components/Fleet/AmbulanceFleetManager.js
import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { GET_AMBULANCE_FLEET, DISPATCH_AMBULANCE, AMBULANCE_UPDATES } from '../graphql/ambulances';

export const AmbulanceFleetManager = ({ facilityId }) => {
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [mapCenter, setMapCenter] = useState([-6.7924, 39.2083]); // Dar es Salaam

  const { data, loading, refetch } = useQuery(GET_AMBULANCE_FLEET, {
    variables: { facilityId }
  });

  const [dispatchAmbulance] = useMutation(DISPATCH_AMBULANCE, {
    onCompleted: (data) => {
      console.log('Ambulance dispatched:', data.dispatchAmbulance);
      refetch();
    }
  });

  // Real-time ambulance updates
  useSubscription(AMBULANCE_UPDATES, {
    variables: { facilityId },
    onData: ({ data }) => {
      const update = data.data?.ambulanceUpdates;
      if (update) {
        // Update specific ambulance in cache
        refetch();
      }
    }
  });

  const ambulances = data?.facility?.ambulanceFleet || [];
  const availableAmbulances = ambulances.filter(amb => amb.status === 'AVAILABLE');

  const handleDispatch = async (ambulanceId, incidentId) => {
    try {
      await dispatchAmbulance({
        variables: {
          input: {
            ambulanceId,
            incidentId,
            priority: 'EMERGENCY'
          }
        }
      });
    } catch (error) {
      console.error('Dispatch failed:', error);
    }
  };

  if (loading) return <FleetSkeleton />;

  return (
    <div className="fleet-manager">
      <div className="fleet-header">
        <h2>Ambulance Fleet Management</h2>
        <FleetSummary ambulances={ambulances} />
      </div>

      <div className="fleet-content">
        {/* Fleet Map */}
        <div className="fleet-map">
          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {ambulances.map(ambulance => (
              ambulance.currentLocation && (
                <Marker
                  key={ambulance.id}
                  position={[
                    ambulance.currentLocation.latitude,
                    ambulance.currentLocation.longitude
                  ]}
                >
                  <Popup>
                    <AmbulancePopup 
                      ambulance={ambulance}
                      onSelect={() => setSelectedAmbulance(ambulance)}
                    />
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* Fleet List */}
        <div className="fleet-list">
          {ambulances.map(ambulance => (
            <AmbulanceCard
              key={ambulance.id}
              ambulance={ambulance}
              onSelect={() => setSelectedAmbulance(ambulance)}
              onDispatch={handleDispatch}
              isSelected={selectedAmbulance?.id === ambulance.id}
            />
          ))}
        </div>
      </div>

      {/* Ambulance Details Modal */}
      {selectedAmbulance && (
        <AmbulanceDetailsModal
          ambulance={selectedAmbulance}
          onClose={() => setSelectedAmbulance(null)}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  );
};

// Ambulance Card Component
const AmbulanceCard = ({ ambulance, onSelect, onDispatch, isSelected }) => {
  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: '#10B981',
      DISPATCHED: '#F59E0B',
      EN_ROUTE: '#3B82F6',
      ON_SCENE: '#8B5CF6',
      TRANSPORTING: '#EF4444',
      OUT_OF_SERVICE: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  return (
    <div 
      className={`ambulance-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="ambulance-header">
        <div className="unit-info">
          <span className="unit-number">{ambulance.unitNumber}</span>
          <span className="equipment-level">{ambulance.equipmentLevel}</span>
        </div>
        <div 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor(ambulance.status) }}
        >
          {ambulance.status}
        </div>
      </div>

      <div className="ambulance-details">
        <div className="vehicle-info">
          <span>{ambulance.make} {ambulance.model}</span>
        </div>
        
        {ambulance.currentDispatch && (
          <div className="current-dispatch">
            <strong>Current Assignment:</strong>
            <span>Incident {ambulance.currentDispatch.incident.incidentNumber}</span>
            <span>ETA: {ambulance.currentDispatch.eta} mins</span>
          </div>
        )}
        
        <div className="crew-info">
          <strong>Crew:</strong>
          {ambulance.currentCrew?.map(member => (
            <span key={member.id}>
              {member.responder.fullName} ({member.role})
            </span>
          ))}
        </div>
      </div>

      <div className="ambulance-actions">
        {ambulance.status === 'AVAILABLE' && (
          <button className="dispatch-btn">
            Available for Dispatch
          </button>
        )}
        {ambulance.status === 'TRANSPORTING' && (
          <button className="track-btn">
            Track Transport
          </button>
        )}
      </div>
    </div>
  );
};
```

## Incoming Patient Management

### Patient Alert System

```javascript
// components/Patients/IncomingPatients.js
import React, { useState, useEffect } from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import { INCOMING_PATIENTS, PREPARE_RESOURCES } from '../graphql/patients';

export const IncomingPatients = ({ facilityId }) => {
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [prepareResources] = useMutation(PREPARE_RESOURCES);

  // Subscribe to incoming patient alerts
  useSubscription(INCOMING_PATIENTS, {
    variables: { facilityId },
    onData: ({ data }) => {
      const alert = data.data?.incomingPatients;
      if (alert) {
        handleIncomingPatient(alert);
      }
    }
  });

  const handleIncomingPatient = (alert) => {
    const patient = alert.incident;
    
    // Add to incoming patients list
    setIncomingPatients(prev => {
      const existing = prev.find(p => p.id === patient.id);
      if (existing) {
        return prev.map(p => p.id === patient.id ? { ...patient, alert } : p);
      }
      return [...prev, { ...patient, alert }];
    });

    // Show alert notification
    setAlerts(prev => [...prev, {
      id: patient.id,
      type: alert.urgency,
      message: alert.message || `Incoming ${patient.severity} emergency`,
      patient: patient,
      timestamp: new Date()
    }]);

    // Auto-prepare resources for critical cases
    if (alert.urgency === 'CRITICAL') {
      prepareForCriticalPatient(patient);
    }

    // Play alert sound
    playAlertSound(alert.urgency);
  };

  const prepareForCriticalPatient = async (patient) => {
    try {
      await prepareResources({
        variables: {
          input: {
            facilityId,
            incidentId: patient.id,
            resourceRequirements: determineResourceNeeds(patient)
          }
        }
      });
    } catch (error) {
      console.error('Failed to prepare resources:', error);
    }
  };

  const determineResourceNeeds = (patient) => {
    const needs = [];
    
    if (patient.severity === 'CRITICAL') {
      needs.push('ICU_BED', 'VENTILATOR', 'CARDIAC_MONITOR');
    }
    
    if (patient.incidentType === 'CARDIAC_ARREST') {
      needs.push('DEFIBRILLATOR', 'CARDIAC_MEDICATIONS');
    }
    
    if (patient.incidentType === 'TRAUMA') {
      needs.push('OR_PREPARATION', 'BLOOD_BANK_ALERT');
    }
    
    return needs;
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="incoming-patients">
      <div className="section-header">
        <h3>Incoming Patients</h3>
        <span className="patient-count">{incomingPatients.length} incoming</span>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="alert-banner">
          {alerts.map(alert => (
            <PatientAlert
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
              onPrepare={() => prepareForCriticalPatient(alert.patient)}
            />
          ))}
        </div>
      )}

      {/* Incoming Patients List */}
      <div className="patients-list">
        {incomingPatients.map(patient => (
          <IncomingPatientCard
            key={patient.id}
            patient={patient}
            onPrepare={() => prepareForCriticalPatient(patient)}
          />
        ))}
      </div>

      {incomingPatients.length === 0 && (
        <div className="no-incoming-patients">
          <p>No incoming patients at this time</p>
        </div>
      )}
    </div>
  );
};

// Patient Alert Component
const PatientAlert = ({ alert, onDismiss, onPrepare }) => {
  const getAlertClass = (urgency) => {
    return `patient-alert ${urgency.toLowerCase()}`;
  };

  return (
    <div className={getAlertClass(alert.type)}>
      <div className="alert-content">
        <div className="alert-icon">
          {alert.type === 'CRITICAL' && <CriticalIcon />}
          {alert.type === 'URGENT' && <UrgentIcon />}
        </div>
        
        <div className="alert-message">
          <strong>{alert.message}</strong>
          <div className="alert-details">
            <span>ETA: {alert.patient.eta} minutes</span>
            <span>Patient Count: {alert.patient.patientCount}</span>
            <span>Type: {alert.patient.incidentType}</span>
          </div>
        </div>
        
        <div className="alert-actions">
          {alert.type === 'CRITICAL' && (
            <button onClick={onPrepare} className="prepare-btn">
              Prepare Resources
            </button>
          )}
          <button onClick={onDismiss} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Incoming Patient Card
const IncomingPatientCard = ({ patient, onPrepare }) => {
  return (
    <div className={`patient-card severity-${patient.severity.toLowerCase()}`}>
      <div className="patient-header">
        <div className="incident-info">
          <span className="incident-number">{patient.incidentNumber}</span>
          <span className={`severity ${patient.severity.toLowerCase()}`}>
            {patient.severity}
          </span>
        </div>
        <div className="eta">
          ETA: {patient.eta} mins
        </div>
      </div>

      <div className="patient-details">
        <div className="incident-type">
          <strong>{patient.incidentType.replace('_', ' ')}</strong>
        </div>
        
        <div className="patient-info">
          <span>Patients: {patient.patientCount}</span>
          {patient.patientAge && <span>Age: {patient.patientAge}</span>}
          {patient.symptoms && <span>Symptoms: {patient.symptoms}</span>}
        </div>

        <div className="responder-info">
          <strong>Responding Team:</strong>
          {patient.assignments?.map(assignment => (
            <span key={assignment.id}>
              {assignment.responder.fullName} ({assignment.responder.responderType})
            </span>
          ))}
        </div>

        {patient.ambulance && (
          <div className="ambulance-info">
            <strong>Transport:</strong>
            <span>Unit {patient.ambulance.unitNumber}</span>
            <span>Equipment: {patient.ambulance.equipmentLevel}</span>
          </div>
        )}
      </div>

      <div className="patient-actions">
        <button onClick={() => onPrepare()} className="prepare-btn">
          Prepare Reception
        </button>
        <button className="contact-btn">
          Contact Team
        </button>
      </div>
    </div>
  );
};
```

## Analytics & Reporting

### Analytics Dashboard

```javascript
// components/Analytics/HospitalAnalytics.js
import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HOSPITAL_ANALYTICS } from '../graphql/analytics';

export const HospitalAnalytics = ({ facilityId }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });

  const { data, loading } = useQuery(HOSPITAL_ANALYTICS, {
    variables: {
      facilityId,
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      }
    }
  });

  const analytics = data?.hospitalAnalytics;

  const chartData = useMemo(() => {
    if (!analytics) return {};

    return {
      responseTimeData: analytics.dailyStats?.map(stat => ({
        date: stat.date,
        avgResponseTime: stat.averageResponseTime,
        totalEmergencies: stat.totalEmergencies
      })) || [],

      bedOccupancyData: analytics.dailyStats?.map(stat => ({
        date: stat.date,
        occupancyRate: stat.occupancyRate,
        availableBeds: stat.availableBeds
      })) || [],

      departmentData: analytics.departmentStats?.map(dept => ({
        name: dept.name,
        caseload: dept.averageCaseload,
        efficiency: dept.efficiencyScore
      })) || [],

      outcomeData: [
        { name: 'Successful', value: analytics.successfulCases || 0 },
        { name: 'Transferred', value: analytics.transferredCases || 0 },
        { name: 'Complications', value: analytics.complications || 0 }
      ]
    };
  }, [analytics]);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="hospital-analytics">
      <div className="analytics-header">
        <h2>Hospital Analytics & Performance</h2>
        <DateRangePicker 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      <div className="analytics-summary">
        <SummaryCard 
          title="Average Response Time"
          value={`${analytics?.averageResponseTime || 0} mins`}
          trend={analytics?.responseTimeTrend}
          description="Time from dispatch to arrival"
        />
        <SummaryCard 
          title="Bed Utilization"
          value={`${analytics?.averageOccupancyRate || 0}%`}
          trend={analytics?.occupancyTrend}
          description="Average bed occupancy rate"
        />
        <SummaryCard 
          title="Patient Satisfaction"
          value={`${analytics?.patientSatisfactionScore || 0}/10`}
          trend={analytics?.satisfactionTrend}
          description="Average patient satisfaction"
        />
        <SummaryCard 
          title="Success Rate"
          value={`${analytics?.successRate || 0}%`}
          trend={analytics?.successRateTrend}
          description="Successful emergency outcomes"
        />
      </div>

      <div className="analytics-charts">
        {/* Response Time Chart */}
        <div className="chart-container">
          <h3>Emergency Response Times</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgResponseTime" stroke="#3B82F6" name="Avg Response Time (mins)" />
              <Line type="monotone" dataKey="totalEmergencies" stroke="#EF4444" name="Total Emergencies" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bed Occupancy Chart */}
        <div className="chart-container">
          <h3>Bed Occupancy Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.bedOccupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupancyRate" fill="#10B981" name="Occupancy Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="chart-container">
          <h3>Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="caseload" fill="#8B5CF6" name="Average Caseload" />
              <Bar dataKey="efficiency" fill="#F59E0B" name="Efficiency Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Outcomes */}
        <div className="chart-container">
          <h3>Patient Outcomes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.outcomeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="detailed-reports">
        <h3>Detailed Reports</h3>
        <div className="report-buttons">
          <button onClick={() => generateReport('emergency_response')}>
            Emergency Response Report
          </button>
          <button onClick={() => generateReport('bed_utilization')}>
            Bed Utilization Report
          </button>
          <button onClick={() => generateReport('staff_performance')}>
            Staff Performance Report
          </button>
          <button onClick={() => generateReport('financial_summary')}>
            Financial Summary
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Resource Management

### Inventory Management

```javascript
// components/Resources/ResourceManager.js
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESOURCE_INVENTORY, UPDATE_RESOURCE_QUANTITY, RESOURCE_ALERTS } from '../graphql/resources';

export const ResourceManager = ({ facilityId }) => {
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, loading, refetch } = useQuery(GET_RESOURCE_INVENTORY, {
    variables: { facilityId }
  });

  const [updateQuantity] = useMutation(UPDATE_RESOURCE_QUANTITY, {
    onCompleted: () => refetch()
  });

  const resources = data?.facility?.inventory || [];
  const filteredResources = resources.filter(resource => {
    if (filter === 'critical' && resource.currentQuantity > resource.minimumQuantity) return false;
    if (filter === 'expired' && new Date(resource.expirationDate) > new Date()) return false;
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
    return true;
  });

  const categories = [...new Set(resources.map(r => r.category))];

  const handleQuantityUpdate = async (resourceId, newQuantity) => {
    try {
      await updateQuantity({
        variables: {
          input: {
            resourceId,
            quantity: newQuantity,
            updatedBy: 'current_user_id'
          }
        }
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  if (loading) return <ResourceSkeleton />;

  return (
    <div className="resource-manager">
      <div className="resource-header">
        <h2>Resource & Inventory Management</h2>
        
        <div className="resource-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="critical">Critical Stock</option>
            <option value="expired">Expired</option>
          </select>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <ResourceSummary resources={resources} />

      <div className="resource-grid">
        {filteredResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onQuantityUpdate={handleQuantityUpdate}
          />
        ))}
      </div>
    </div>
  );
};

const ResourceCard = ({ resource, onQuantityUpdate }) => {
  const [newQuantity, setNewQuantity] = useState(resource.currentQuantity);
  const [isEditing, setIsEditing] = useState(false);

  const isLowStock = resource.currentQuantity <= resource.minimumQuantity;
  const isExpired = resource.expirationDate && new Date(resource.expirationDate) < new Date();
  const isNearExpiry = resource.expirationDate && 
    new Date(resource.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const handleSave = () => {
    onQuantityUpdate(resource.id, newQuantity);
    setIsEditing(false);
  };

  return (
    <div className={`resource-card ${isLowStock ? 'low-stock' : ''} ${isExpired ? 'expired' : ''}`}>
      <div className="resource-header">
        <h4>{resource.name}</h4>
        <span className="category-badge">{resource.category}</span>
      </div>

      <div className="resource-status">
        {isExpired && <span className="status-badge expired">Expired</span>}
        {!isExpired && isNearExpiry && <span className="status-badge near-expiry">Near Expiry</span>}
        {isLowStock && <span className="status-badge low-stock">Low Stock</span>}
      </div>

      <div className="quantity-section">
        <div className="current-quantity">
          <strong>Current: </strong>
          {isEditing ? (
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value))}
              min="0"
            />
          ) : (
            <span>{resource.currentQuantity}</span>
          )}
        </div>
        
        <div className="minimum-quantity">
          <strong>Minimum: </strong>{resource.minimumQuantity}
        </div>
      </div>

      {resource.expirationDate && (
        <div className="expiration-info">
          <strong>Expires: </strong>
          {formatDate(resource.expirationDate)}
        </div>
      )}

      <div className="resource-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Update Quantity
          </button>
        )}
      </div>
    </div>
  );
};
```

This comprehensive hospital web client integration guide provides healthcare IT teams with all the necessary components to build robust facility management dashboards for the AfyaPapo emergency response system, with full real-time capabilities, proper authentication, and comprehensive resource management features.