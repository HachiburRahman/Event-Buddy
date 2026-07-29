import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Render closes the TCP connection after every response (Connection: close) and
// free instances spin down after inactivity. Both mean a browser request can die
// with ERR_CONNECTION_CLOSED or hang on a cold start through no fault of the user.
// Without retries a single blip leaves the page stuck on an error with no way out.
const MAX_RETRIES = 3;
const TIMEOUT_MS = 20_000;
const BACKOFF_MS = [500, 1_500, 3_500];

declare module 'axios' {
  export interface AxiosRequestConfig {
    // Opt a non-GET request into retries. Only safe for requests that do not
    // change server state, e.g. POST /events/public/find, which is a read.
    retryable?: boolean;
  }
}

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5007',
  timeout: TIMEOUT_MS,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// A request is only safe to replay if repeating it cannot create or change
// anything. GET always qualifies. Everything else must opt in explicitly, which
// keeps POST /bookings and POST /auth/login off this path.
const isSafeToReplay = (config: AxiosRequestConfig) => {
  const method = (config.method || 'get').toLowerCase();
  return method === 'get' || method === 'head' || config.retryable === true;
};

// Retry transport failures and server-side faults, never client mistakes.
// A 400 or 404 returns the same answer every time; replaying it just wastes time.
const isTransient = (error: AxiosError) => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
  if (!error.response) return true; // network error: ERR_CONNECTION_CLOSED, DNS, offline
  return error.response.status >= 500 || error.response.status === 429;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (!config || !isSafeToReplay(config) || !isTransient(error)) {
      return Promise.reject(error);
    }

    config.__retryCount = (config.__retryCount || 0) + 1;

    if (config.__retryCount > MAX_RETRIES) {
      return Promise.reject(error);
    }

    await delay(BACKOFF_MS[config.__retryCount - 1] ?? 3_500);

    return api(config);
  },
);

export default api;
