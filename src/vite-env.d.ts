/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_WEBSOCKET_ENDPOINT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_LOGGING: string;
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string;
  readonly VITE_TOKEN_STORAGE_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  readonly VITE_ENCRYPTION_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly MODE: 'development' | 'production' | 'staging';
  readonly PROD: boolean;
  readonly DEV: boolean;
}

declare module "*.svg" {
  import React from "react";
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export { ReactComponent };
  const src: string;
  export default src;
}

declare module "*.svg?react" {
  import React from "react";
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export { ReactComponent };
  export default ReactComponent;
}