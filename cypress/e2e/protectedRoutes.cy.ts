import {AUTH0_USERNAME,AUTH0_PASSWORD} from "../../src/utils/constants";

describe('Protected routes test', () => {
  it('should redirect to the Auth0 login page when accessing a protected route unauthenticated', () => {
    cy.visit('/');

    cy.origin(`https://${Cypress.env('VITE_AUTH0_DOMAIN')}`, () => {
      // Assert the URL while inside the Auth0 domain context
      cy.url().should('include', Cypress.env('VITE_AUTH0_DOMAIN'));
    });
  });

  it('should display login content on the Auth0 page', () => {
    // Visit the root path, which will redirect to /login and then to Auth0
    cy.visit('/');

    // Interact with the Auth0 login page within cy.origin
    cy.origin(`https://${Cypress.env('VITE_AUTH0_DOMAIN')}`, () => {
      // Look for text that is likely to appear on a login page
      cy.contains('Continue').should('exist');
      cy.get('input#password').should('exist');
    });
  });

  it('should not redirect to login when the user is already authenticated', () => {
    cy.loginToAuth0(
        AUTH0_USERNAME,
        AUTH0_PASSWORD
    )

    cy.visit('/');

    cy.wait(1000)

    // Check if the URL is not the Auth0 domain, implying we are on our app
    cy.url().should('not.include', Cypress.env('VITE_AUTH0_DOMAIN'));
  });

})

