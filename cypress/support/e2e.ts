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

Cypress.Commands.add('loginToAuth0', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')

  cy.session(
      `auth0-${username}`,
      () => {
        loginViaAuth0Ui(username, password)
      },
      {
        validate: () => {
          const clientId = Cypress.env('VITE_AUTH0_CLIENT_ID');
          const audience = Cypress.env('VITE_AUTH0_AUDIENCE');
          const expectedKeyPrefix = `@@auth0spajs@@::${clientId}::${audience}`;

          cy.window().its('localStorage').then((ls) => {
              const keys = Object.keys(ls);
              const auth0Key = keys.find(key => key.startsWith(expectedKeyPrefix));
              expect(auth0Key).to.exist;
              expect(ls.getItem(auth0Key)).to.exist;
          });
        },
      }
  )
  log.snapshot('after')
  log.end()
})
