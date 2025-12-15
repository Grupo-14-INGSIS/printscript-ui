import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
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
        devServer: {
            framework: "react",
            bundler: "vite",
            viteConfig: {
                configFile: 'vite.config.ts',
                define: {
                    'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(process.env.VITE_AUTH0_DOMAIN),
                    'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(process.env.VITE_AUTH0_CLIENT_ID),
                    'import.meta.env.VITE_AUTH0_AUDIENCE': JSON.stringify(process.env.VITE_AUTH0_AUDIENCE),
                    'import.meta.env.VITE_AUTH0_REALM': JSON.stringify(process.env.VITE_AUTH0_REALM),
                    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL),
                    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
                    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
                    'import.meta.env.VITE_RUNNER_URL': JSON.stringify(process.env.VITE_RUNNER_URL),
                    'import.meta.env.VITE_AUTH0_USERNAME': JSON.stringify(process.env.VITE_AUTH0_USERNAME),
                    'import.meta.env.VITE_AUTH0_PASSWORD': JSON.stringify(process.env.VITE_AUTH0_PASSWORD),
                }
            }
        },
        experimentalStudio: true,
        baseUrl: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
    },
});