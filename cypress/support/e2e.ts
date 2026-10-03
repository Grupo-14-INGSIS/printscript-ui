// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import {loginViaAuth0Ui} from "./auth-provider-commands/auth0";

// Global handler: inject Auth0 tokens into localStorage on EVERY page load.
// This ensures tokens are available regardless of cy.session restore quirks,
// page navigations, or SPA route changes.
Cypress.on('window:before:load', (win) => {
    const entries = Cypress.env('__AUTH0_ENTRIES__') as Record<string, string> | undefined;
    if (entries) {
        for (const [key, value] of Object.entries(entries)) {
            win.localStorage.setItem(key, value);
        }
    }
});

Cypress.Commands.add('loginToAuth0', (username?: string, password?: string) => {
    const userEmail = username || Cypress.env('VITE_AUTH0_USERNAME') || "desireless1789@gmail.com";
    const userPassword = password || Cypress.env('VITE_AUTH0_PASSWORD') || "desireless1789@gmail.com";

    const log = Cypress.log({
        displayName: 'AUTH0 LOGIN',
        message: [`🔐 Authenticating | ${userEmail}`],
        autoEnd: false,
    });
    log.snapshot('before');

    // No cy.session — the token request is fast (single HTTP call)
    // and the window:before:load handler above ensures tokens are
    // injected into localStorage on every page load automatically.
    loginViaAuth0Ui(userEmail, userPassword);

    log.snapshot('after');
    log.end();
});