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