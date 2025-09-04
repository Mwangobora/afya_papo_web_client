export class ApiEndpoints {
  // Access env variable at runtime
  private static get BASE_URL(): string {
    const url = process.env.REACT_APP_API_BASE_URL;
    if (!url) throw new Error('REACT_APP_API_BASE_URL is not defined');
    return url;
  }

  static get graphql() {
    return `${this.BASE_URL}/graphql/`;
  }

  static get websocket() {
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
