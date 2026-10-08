import { defineConfig } from "cypress";
import dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config();

function getActiveBranch(): string {
    if (process.env.GITHUB_REF_NAME) {
        return process.env.GITHUB_REF_NAME;
    }
    try {
        return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    } catch {
        return "develop";
    }
}

const currentBranch = getActiveBranch();
const isProdBranch = currentBranch === "main" || currentBranch === "production";

const defaultHost = isProdBranch
    ? "https://snippet26prod.duckdns.org"
    : "https://snippet26dev.duckdns.org";

const frontendUrl = process.env.CYPRESS_BASE_URL || (isProdBranch ? "https://snippet26prod.duckdns.org" : (process.env.VITE_FRONTEND_URL || defaultHost));
const backendUrl = isProdBranch ? "https://snippet26prod.duckdns.org" : (process.env.VITE_BACKEND_URL || defaultHost);
const runnerUrl = isProdBranch ? "https://snippet26prod.duckdns.org/runner" : (process.env.VITE_RUNNER_URL || `${defaultHost}/runner`);
const apiUrl = isProdBranch ? "https://snippet26prod.duckdns.org" : (process.env.VITE_API_URL || defaultHost);

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            config.env = {
                ...config.env,
                VITE_FRONTEND_URL: frontendUrl,
                VITE_BACKEND_URL: backendUrl,
                VITE_RUNNER_URL: runnerUrl,
                VITE_AUTH0_USERNAME: process.env.VITE_AUTH0_USERNAME,
                VITE_AUTH0_PASSWORD: process.env.VITE_AUTH0_PASSWORD,
                VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN,
                VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID,
                VITE_AUTH0_AUDIENCE: process.env.VITE_AUTH0_AUDIENCE,
                VITE_AUTH0_REALM: process.env.VITE_AUTH0_REALM,
                VITE_API_URL: apiUrl,
            };
            return config;
        },
        experimentalStudio: true,
        baseUrl: frontendUrl,
    },
});