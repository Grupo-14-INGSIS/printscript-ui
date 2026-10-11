declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to log in using Auth0.
         * @example cy.loginToAuth0('username', 'password')
         */
        loginToAuth0(username: string, password: string): Chainable<void>

        /**
         * Access token de la sesión de Auth0 actual (leído del cache de auth0-spa-js).
         * @example cy.getAccessToken().then(token => cy.request({headers: {Authorization: `Bearer ${token}`}}))
         */
        getAccessToken(): Chainable<string>
    }
}
