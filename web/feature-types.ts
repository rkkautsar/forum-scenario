export type Api = (path: string, options?: RequestInit) => Promise<any>;
export type FeatureContext = {
  api: Api;
  refresh: () => void;
  user: string;
  query?: string;
  setQuery?: (query: string) => void;
  post?: any;
};
