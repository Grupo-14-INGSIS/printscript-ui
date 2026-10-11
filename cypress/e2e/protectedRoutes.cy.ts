import {AUTH0_USERNAME, AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test (Real Auth)', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        cy.visit('/');
        cy.url({ timeout: 15000 }).should('include', '/login');
    });

    it('should display login content', () => {
        cy.visit('/login');
        cy.contains('Log in').should('exist');
    });

    it('should not redirect to login when the user is already authenticated', () => {
        const username = Cypress.env('VITE_AUTH0_USERNAME') || AUTH0_USERNAME || "desireless1789@gmail.com";
        const password = Cypress.env('VITE_AUTH0_PASSWORD') || AUTH0_PASSWORD || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);

        cy.visit('/');
        cy.url({ timeout: 15000 }).should('not.include', '/login');
    });
});