import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
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
const baseUrl = process.env.CYPRESS_BASE_URL || defaultHost;
const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

const frontendUrl = baseUrl;
const backendUrl = isLocal
    ? "http://localhost:19081"
    : (isProdBranch ? "https://snippet26prod.duckdns.org" : "https://snippet26dev.duckdns.org");
const runnerUrl = isLocal
    ? "http://localhost:19082"
    : (isProdBranch ? "https://snippet26prod.duckdns.org/runner" : "https://snippet26dev.duckdns.org/runner");
const apiUrl = backendUrl;

export default defineConfig({
    e2e: {
        setupNodeEvents(_on, config) {
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
        baseUrl: baseUrl,
        viewportWidth: 1280,
        viewportHeight: 800,
    },
});