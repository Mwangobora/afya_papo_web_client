
export const APP_CONSTANTS = {
  APP_NAME: 'AfyaPapo',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  TIMEOUTS: {
    API_REQUEST: 30000,
    TOKEN_REFRESH: 5000,
    WEBSOCKET_RECONNECT: 3000,
  },
  LOCAL_STORAGE_KEYS: {
    USER_PREFERENCES: 'afyapapo_user_prefs',
    LAST_FACILITY: 'afyapapo_last_facility',
    DASHBOARD_LAYOUT: 'afyapapo_dashboard_layout',
  },
} as const;

export const BED_TYPES = {
  GENERAL: 'General Ward',
  ICU: 'Intensive Care',
  EMERGENCY: 'Emergency',
  PEDIATRIC: 'Pediatric',
  MATERNITY: 'Maternity',
} as const;

export const INCIDENT_TYPES = {
  CARDIAC_ARREST: 'Cardiac Arrest',
  TRAUMA: 'Trauma',
  STROKE: 'Stroke',
  RESPIRATORY: 'Respiratory Emergency',
  OVERDOSE: 'Drug Overdose',
  ACCIDENT: 'Accident',
  OTHER: 'Other Emergency',
} as const;

export const SEVERITY_LEVELS = {
  CRITICAL: { label: 'Critical', color: '#DC2626', priority: 1 },
  URGENT: { label: 'Urgent', color: '#F59E0B', priority: 2 },
  NON_URGENT: { label: 'Non-Urgent', color: '#10B981', priority: 3 },
} as const;

export const AMBULANCE_STATUS = {
  AVAILABLE: { label: 'Available', color: '#10B981' },
  DISPATCHED: { label: 'Dispatched', color: '#F59E0B' },
  EN_ROUTE: { label: 'En Route', color: '#3B82F6' },
  ON_SCENE: { label: 'On Scene', color: '#8B5CF6' },
  TRANSPORTING: { label: 'Transporting', color: '#EF4444' },
  OUT_OF_SERVICE: { label: 'Out of Service', color: '#6B7280' },
} as const;

