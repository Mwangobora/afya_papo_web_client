export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: {
      code?: string;
      field?: string;
      [key: string]: any;
    };
  }>;
}

export interface MutationResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

// Input types for mutations
export interface AdminLoginInput {
  username: string;
  password: string;
  userType?: string;
}

export interface UpdateBedStatusInput {
  bedId: string;
  status?: string;
  patientAge?: number;
  admissionType?: string;
  estimatedDischarge?: string;
}

export interface DispatchAmbulanceInput {
  ambulanceId: string;
  incidentId: string;
  priority?: string;
}

export interface CreateIncidentInput {
  incidentType: string;
  severity: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  patientCount: number;
  patientAge?: number;
  symptoms?: string;
  description?: string;
}

export interface UpdateIncidentStatusInput {
  incidentId: string;
  status: string;
  notes?: string;
}

export interface UpdateResourceQuantityInput {
  resourceId: string;
  quantity: number;
}