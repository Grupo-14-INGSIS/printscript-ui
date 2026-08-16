const isCypress = typeof Cypress !== 'undefined';
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const FRONTEND_URL = isCypress
    ? Cypress.env('VITE_FRONTEND_URL') as string
    : (import.meta.env.VITE_FRONTEND_URL as string || (isLocalhost ? "http://localhost:5173" : (isBrowser ? window.location.origin : "http://localhost:5173")));

export const BACKEND_URL = isCypress
    ? Cypress.env('VITE_BACKEND_URL') as string
    : (import.meta.env.VITE_BACKEND_URL as string || (isLocalhost ? "http://localhost:19081" : (isBrowser ? window.location.origin : "http://localhost:19081")));

export const RUNNER_URL = isCypress
    ? Cypress.env('VITE_RUNNER_URL') as string
    : (import.meta.env.VITE_RUNNER_URL as string || (isLocalhost ? "http://localhost:19082" : (isBrowser ? `${window.location.origin}/runner` : "http://localhost:19082")));

export const AUTH0_USERNAME = isCypress
    ? Cypress.env('VITE_AUTH0_USERNAME') as string
    : (import.meta.env.VITE_AUTH0_USERNAME as string ?? "") as string;

export const AUTH0_PASSWORD = isCypress
    ? Cypress.env('VITE_AUTH0_PASSWORD') as string
    : (import.meta.env.VITE_AUTH0_PASSWORD as string ?? "") as string;