export function loginViaAuth0Ui(username: string, password: string) {
    const auth0Domain = Cypress.env('VITE_AUTH0_DOMAIN') || 'dev-65tlgyzfpbzeka8a.us.auth0.com';
    const frontendUrl = Cypress.env('VITE_FRONTEND_URL') || 'http://localhost:5173';

    cy.log('Visiting base URL...');
    cy.visit('/');
    cy.url().should('not.be.empty'); // Make sure the initial visit works

    cy.log(`Entering cy.origin for Auth0 domain: ${auth0Domain}`);
    cy.origin(
        `https://${auth0Domain}`,
        { args: { username, password } },
        ({ username, password }) => {
            cy.log('Inside cy.origin: Waiting for form and typing credentials.');
            cy.get('input#username', { timeout: 10000 }).should('be.visible').type(username);
            cy.get('input#password', { timeout: 10000 }).should('be.visible').type(password, { log: false });
            cy.log('Inside cy.origin: Clicking continue.');
            cy.get('button[type="submit"]').contains('Continue').click({ force: true });
        }
    );

    cy.log('Exited cy.origin. Checking final URL and authentication completion.');
    // Ensure Auth0 has redirected us back to the app
    cy.url({ timeout: 15000 }).should('include', frontendUrl);
    // Wait until the Auth0 SDK completes code exchange and loading finishes
    cy.contains('Loading authentication...', { timeout: 15000 }).should('not.exist');
    cy.url({ timeout: 15000 }).should('not.include', 'code=');
}
