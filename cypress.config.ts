import { defineConfig } from "cypress";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    e2e: {
        setupNodeEvents(_, config) {
            config.env = {
                ...config.env,
                VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL,
                VITE_BACKEND_URL: process.env.VITE_BACKEND_URL,
                VITE_RUNNER_URL: process.env.VITE_RUNNER_URL,
                VITE_AUTH0_USERNAME: process.env.VITE_AUTH0_USERNAME,
                VITE_AUTH0_PASSWORD: process.env.VITE_AUTH0_PASSWORD,
                VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN,
                VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID,
                VITE_AUTH0_AUDIENCE: process.env.VITE_AUTH0_AUDIENCE,
                VITE_AUTH0_REALM: process.env.VITE_AUTH0_REALM,
                VITE_API_URL: process.env.VITE_API_URL,
            };
            return config;
        },
        experimentalStudio: true,
        baseUrl: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
    },
});