import {AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test (Real Auth)', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        cy.visit('/', { failOnStatusCode: false });
        const auth0Domain = Cypress.env('VITE_AUTH0_DOMAIN') || 'dev-65tlgyzfpbzeka8a.us.auth0.com';
        // Auth0 SPA SDK redirige cross-origin a Universal Login → verificamos que aparezca el form
        cy.origin(`https://${auth0Domain}`, () => {
            cy.get('input#username', { timeout: 20000 }).should('be.visible');
        });
    });

    it('should display login content or redirect to Auth0 login', () => {
        cy.visit('/login');
        cy.url({ timeout: 15000 }).should('satisfy', (url: string) => url.includes('/login') || url.includes('auth0.com'));
    });

    it('should not redirect to login when the user is already authenticated', () => {
        const username = Cypress.env('VITE_AUTH0_USERNAME') || AUTH0_USERNAME || "desireless1789@gmail.com";
        const password = Cypress.env('VITE_AUTH0_PASSWORD') || AUTH0_PASSWORD || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);

        cy.visit('/');
        cy.url({ timeout: 15000 }).should('not.include', '/login');
    });
});