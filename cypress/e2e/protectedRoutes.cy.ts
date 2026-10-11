import {AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";

// La app protege las rutas con Auth0: sin sesión, /login redirige al Universal Login de
// Auth0 (otro origen), así que las verificaciones de esa página van dentro de cy.origin.
const auth0Domain = Cypress.env('VITE_AUTH0_DOMAIN') || 'dev-65tlgyzfpbzeka8a.us.auth0.com';

describe('Protected routes test', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        // Visit the protected route
        cy.visit('/');

        // Check if the URL is redirected to the login page (Auth0: https://<domain>/u/login?...)
        cy.origin(`https://${auth0Domain}`, () => {
            cy.url().should('include', '/login');
        });
    });

    it('should display login content', () => {
        // Visit the login page
        cy.visit('/login');

        // Look for text that is likely to appear on a login page
        cy.origin(`https://${auth0Domain}`, () => {
            cy.contains('Log in').should('exist');
            cy.contains('Password').should('exist');
            cy.get('input#username').should('exist');
            cy.get('input#password').should('exist');
        });
    });

    it('should not redirect to login when the user is already authenticated', () => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit('/');

        // Check if the URL is redirected to the login page
        cy.url().should('not.include', '/login');
        cy.url().should('not.include', auth0Domain);
        cy.contains('button', 'Add Snippet').should('be.visible');
    });

})
