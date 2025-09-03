
export class ApiEndpoints {
  private static readonly BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  
  static readonly graphql = `${this.BASE_URL}/graphql/`;
  static readonly websocket = this.BASE_URL.replace('http', 'ws') + '/ws/graphql/';
  
  static readonly upload = `${this.BASE_URL}/api/upload/`;
  static readonly reports = `${this.BASE_URL}/api/reports/`;
  static readonly export = `${this.BASE_URL}/api/export/`;
}

export const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
} as const;