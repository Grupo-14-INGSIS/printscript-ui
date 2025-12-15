const isCypress = typeof window !== 'undefined' && (window as any).Cypress;

export const FRONTEND_URL = isCypress
    ? (window as any).Cypress.env('VITE_FRONTEND_URL')
    : import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5173";

export const BACKEND_URL = isCypress
    ? (window as any).Cypress.env('VITE_BACKEND_URL')
    : import.meta.env.VITE_BACKEND_URL ?? "";

export const RUNNER_URL = isCypress
    ? (window as any).Cypress.env('VITE_RUNNER_URL')
    : import.meta.env.VITE_RUNNER_URL ?? "/runner";

export const AUTH0_USERNAME = isCypress
    ? (window as any).Cypress.env('VITE_AUTH0_USERNAME')
    : import.meta.env.VITE_AUTH0_USERNAME ?? "";

export const AUTH0_PASSWORD = isCypress
    ? (window as any).Cypress.env('VITE_AUTH0_PASSWORD')
    : import.meta.env.VITE_AUTH0_PASSWORD ?? "";