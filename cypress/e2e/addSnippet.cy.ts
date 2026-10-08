import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        const username = AUTH0_USERNAME || Cypress.env('VITE_AUTH0_USERNAME') || "desireless1789@gmail.com";
        const password = AUTH0_PASSWORD || Cypress.env('VITE_AUTH0_PASSWORD') || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);

        // Intercept user registration
        cy.intercept('PUT', '**/users*', {
            statusCode: 200,
            body: {},
        }).as("registerUser");

        // Intercept initial snippets list
        cy.intercept('GET', /\/snippets(\?.*)?$/, {
            statusCode: 200,
            body: {},
        }).as("getSnippets");
    });

    // Solo el PUT de creacion de snippet (Runner): el glob '**/snippet*/**' matcheaba tambien
    // el host snippet26dev.duckdns.org y capturaba el PUT /api/v1/users del login.
    const createSnippetUrl = /\/api\/v1\/snippets\/[^/?]+$/;

    it('Can add snippets manually', () => {
        cy.intercept('PUT', createSnippetUrl, (req) => {
            expect(req.body).to.have.property('name', 'Some snippet name');
            expect(req.body).to.have.property('language', 'printscript');
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('createSnippet');

        cy.visit("/");

        // Open Add Snippet modal
        cy.contains('button', 'Add Snippet').click();
        cy.contains('Create snippet').click();

        // Fill snippet form with valid PrintScript syntax
        cy.get('#name').type('Some snippet name');
        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type('println("some snippet");');

        // Save
        cy.contains('button', 'Save Snippet').click();

        // Assert API request and user feedback snackbar
        cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);
        cy.contains('Snippet created successfully').should('be.visible');
    });

    it('Can add snippets via file', () => {
        cy.intercept('PUT', createSnippetUrl, (req) => {
            expect(req.body).to.have.property('language', 'printscript');
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('createSnippet');

        cy.visit("/");

        // Select file from fixtures
        cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", { force: true });

        // Save uploaded snippet
        cy.contains('button', 'Save Snippet').click();

        // Assert API request and user feedback snackbar
        cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);
        cy.contains('Snippet created successfully').should('be.visible');
    });
});