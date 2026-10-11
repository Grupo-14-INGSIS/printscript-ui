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

Cypress.Commands.add('loginToAuth0', (username?: string, password?: string) => {
    const userEmail = username || Cypress.env('VITE_AUTH0_USERNAME') || "desireless1789@gmail.com";
    const userPassword = password || Cypress.env('VITE_AUTH0_PASSWORD') || "desireless1789@gmail.com";

    const log = Cypress.log({
        displayName: 'AUTH0 LOGIN',
        message: [`🔐 Authenticating | ${userEmail}`],
        autoEnd: false,
    });
    log.snapshot('before');

    cy.session(
        `auth0-${userEmail}`,
        () => {
            loginViaAuth0Ui(userEmail, userPassword);
        },
        {
            validate: () => {
                const clientId = Cypress.env('VITE_AUTH0_CLIENT_ID') || 'pDaLfxwVAerUnhjKfJNfxLfduUPJQi3x';
                const expectedKeyPrefix = `@@auth0spajs@@::${clientId}`;

                cy.window().should((win) => {
                    const keys = Object.keys(win.localStorage);
                    const auth0Key = keys.find(key => key.startsWith(expectedKeyPrefix));
                    expect(auth0Key, 'Auth0 token in localStorage').to.exist;
                    expect(win.localStorage.getItem(auth0Key!)).to.exist;
                });
            },
        }
    );

    log.snapshot('after');
    log.end();
});

/**
 * Access token real de la sesión de Auth0 (el mismo que usa la app), leído del cache
 * que auth0-spa-js guarda en localStorage. Sirve para hacer cy.request contra el
 * backend autenticado, igual que lo haría la UI.
 */
Cypress.Commands.add('getAccessToken', () => {
    return cy.window().then((win) => {
        const key = Object.keys(win.localStorage).find((k) => {
            if (!k.startsWith('@@auth0spajs@@::')) return false;
            try {
                const parsed = JSON.parse(win.localStorage.getItem(k) ?? '{}');
                return typeof parsed?.body?.access_token === 'string';
            } catch {
                return false;
            }
        });
        expect(key, 'Auth0 access token cache entry').to.exist;
        const token = JSON.parse(win.localStorage.getItem(key!)!).body.access_token as string;
        return token;
    });
});
