const isCypress = typeof Cypress !== 'undefined';

export const FRONTEND_URL = isCypress
    ? Cypress.env('VITE_FRONTEND_URL') as string
    : (import.meta.env.VITE_FRONTEND_URL as string ?? "http://localhost:5173");

export const BACKEND_URL = isCypress
    ? Cypress.env('VITE_BACKEND_URL') as string
    : (import.meta.env.VITE_BACKEND_URL as string ?? "") as string;

export const RUNNER_URL = isCypress
    ? Cypress.env('VITE_RUNNER_URL') as string
    : (import.meta.env.VITE_RUNNER_URL as string ?? "/runner") as string;

export const AUTH0_USERNAME = isCypress
    ? Cypress.env('VITE_AUTH0_USERNAME') as string
    : (import.meta.env.VITE_AUTH0_USERNAME as string ?? "") as string;

export const AUTH0_PASSWORD = isCypress
    ? Cypress.env('VITE_AUTH0_PASSWORD') as string
    : (import.meta.env.VITE_AUTH0_PASSWORD as string ?? "") as string;