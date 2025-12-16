export function loginViaAuth0Ui(username: string, password:string) {
    cy.log('Visiting base URL...');
    cy.visit('/');
    cy.url().should('not.be.empty'); // Make sure the initial visit works

    cy.log(`Entering cy.origin for Auth0 domain: ${Cypress.env('VITE_AUTH0_DOMAIN')}`);
    cy.origin(
        `https://${Cypress.env('VITE_AUTH0_DOMAIN')}`,
        { args: { username, password } },
        ({ username, password }) => {
            cy.log('Inside cy.origin: Waiting for form and typing credentials.');
            cy.get('input#username').should('be.visible').type(username);
            cy.get('input#password').should('be.visible').type(password, { log: false });
            cy.log('Inside cy.origin: Clicking continue.');
            cy.get('button[type="submit"]').contains('Continue').click({ force: true });
        }
    );

    cy.log('Exited cy.origin. Checking final URL.');
    // Add logging to see what the URL is before the assertion
    cy.url().then(url => {
        cy.log(`URL after redirect is: "${url}"`);
    });

    // Ensure Auth0 has redirected us back to the app
    cy.url().should('equal', Cypress.env('VITE_FRONTEND_URL') + '/');
}