import {AUTH0_PASSWORD, AUTH0_USERNAME, RUNNER_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore"; // Import FakeSnippetStore
import {v4 as uuid} from 'uuid'; // Import uuid

const fakeSnippetStore = new FakeSnippetStore(); // Create an instance of the fake store

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        );

        // Intercept GET request for snippets list
        cy.intercept('GET', RUNNER_URL + "/api/v1/snippets*", (req) => {
            req.reply({
                statusCode: 200,
                body: fakeSnippetStore.listSnippetDescriptors(), // Return mock data
            });
        }).as('getSnippetsList');

        // Intercept PUT request for creating a snippet
        cy.intercept('PUT', RUNNER_URL + "/api/v1/snippet/snippets/*", (req) => {
            const snippetDataFromRequest: CreateSnippet = { // Data as sent by the application
                id: req.body.id,
                name: req.body.name,
                language: req.body.language,
                content: req.body.snippet,
                extension: 'prs' // Assuming default extension, can be derived from req.body.language
            };
            // Use the fake store's createSnippet method to add it to the mock data
            const createdSnippet = fakeSnippetStore.createSnippet(snippetDataFromRequest);
            req.reply({
                statusCode: 200,
                body: createdSnippet,
            });
        }).as('createSnippet');
    });

    it('Can add snippets manually', () => {
        cy.visit("/");

        // Simulate UI actions to create a snippet
        cy.contains('button', 'Add Snippet').click(); // Click the 'Add Snippet' button
        cy.get('ul[role="menu"]').should('be.visible'); // Wait for the popover menu to appear
        cy.wait(50); // Give React time to render the menu items properly
        cy.contains('li', 'Create snippet').click({ force: true }); // Force click the 'Create snippet' menu item
        cy.wait(500); // Wait for the modal to render
        cy.contains('h2', 'Add Snippet').should('be.visible'); // Wait for modal title to be visible (corrected tag)
        cy.get('#name').type('Some snippet name');

        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: String = "some snippet" \n print(snippet)`);
        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);

        // Optional: Verify the snippet appears in the list after creation
        cy.contains('Some snippet name').should('exist');
    });

    it('Can add snippets via file', () => {
        cy.visit("/");

        // Simulate UI actions to load snippet from file
        cy.contains('button', 'Add Snippet').click(); // Click the 'Add Snippet' button
        cy.get('ul[role="menu"]').should('be.visible'); // Wait for the popover menu to appear
        cy.wait(50); // Give React time to render the menu items properly
        cy.contains('li', 'Load snippet from file').click({ force: true }); // Force click the 'Load snippet from file' menu item
        cy.wait(500); // Wait for the modal to render
        cy.contains('h2', 'Add Snippet').should('be.visible'); // Wait for modal title to be visible (corrected tag)
        cy.get('[data-testid="upload-file-input"').selectFile("cypress/fixtures/example_ps.ps", {force: true});

        // Assert that name and content are pre-filled from the file
        cy.get('#name').should('have.value', 'example_ps'); // Assuming file name is pre-filled without extension
        cy.get('[data-testid="add-snippet-code-editor"]').should('contain.text', 'let a = 10;'); // Assuming content is pre-filled

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@createSnippet').its('response.statusCode').should('eq', 200);

        // Optional: Verify the snippet appears in the list after creation
        cy.contains('example_ps').should('exist');
    });
});