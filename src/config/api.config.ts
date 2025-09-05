import { Env } from './env';

export class ApiEndpoints {
  // Access Vite environment variables at runtime
  private static get BASE_URL(): string {
    const url = Env.VITE_API_BASE_URL;
    if (!url) {
      console.warn('VITE_API_BASE_URL is not defined, using default localhost:8000');
      return 'http://localhost:8000';
    }
    return url;
  }

  static get graphql() {
    const endpoint = Env.VITE_GRAPHQL_ENDPOINT;
    if (endpoint) return endpoint;
    return `${this.BASE_URL}/graphql/`;
  }

  static get websocket() {
    const endpoint = Env.VITE_WEBSOCKET_ENDPOINT;
    if (endpoint) return endpoint;
    return this.BASE_URL.replace(/^http/, 'ws') + '/ws/graphql/';
  }

  static get upload() {
    return `${this.BASE_URL}/api/upload/`;
  }

  static get reports() {
    return `${this.BASE_URL}/api/reports/`;
  }

  static get export() {
    return `${this.BASE_URL}/api/export/`;
  }
}
