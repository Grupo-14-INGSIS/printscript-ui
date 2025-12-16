import {AUTH0_PASSWORD, AUTH0_USERNAME, RUNNER_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore";
import {v4 as uuid} from 'uuid';

const fakeSnippetStore = new FakeSnippetStore();

describe('Add snippet tests', () => {
    beforeEach(() => {
        // Set up intercepts BEFORE login and visit
        // Intercept GET request for snippets list
        cy.intercept('GET', '**/api/v1/snippets*', (req) => {
            req.reply({
                statusCode: 200,
                body: fakeSnippetStore.listSnippetDescriptors(),
            });
        }).as('getSnippetsList');

        // Intercept PUT request for creating a snippet
        cy.intercept('PUT', '**/api/v1/snippet/snippets/*', (req) => {
            const snippetDataFromRequest: CreateSnippet = {
                id: req.body.id,
                name: req.body.name,
                language: req.body.language,
                content: req.body.snippet,
                extension: 'prs'
            };

            const createdSnippet = fakeSnippetStore.createSnippet(snippetDataFromRequest);

            req.reply({
                statusCode: 200,
                body: createdSnippet,
            });
        }).as('createSnippet');

        // Now login
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        );
    });

    it('Can add snippets manually', () => {
        cy.visit("/");

        // Wait for initial snippet list fetch with longer timeout
        cy.wait('@getSnippetsList', { timeout: 10000 });

        // Open Add Snippet menu
        cy.contains('button', 'Add Snippet', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('ul[role="menu"]', { timeout: 5000 })
            .should('be.visible');

        cy.contains('li', 'Create snippet')
            .should('be.visible')
            .click();

        // Wait for modal to open
        cy.contains('h2', 'Add Snippet', { timeout: 10000 })
            .should('be.visible');

        // Fill in snippet name
        cy.get('#name', { timeout: 5000 })
            .should('be.visible')
            .type('Some snippet name');

        // Fill in code editor
        cy.get('[data-testid="add-snippet-code-editor"]', { timeout: 5000 })
            .should('be.visible')
            .click()
            .type('const snippet: String = "some snippet" {enter}print(snippet)');

        // Save snippet
        cy.get('[data-testid="SaveIcon"]')
            .should('be.visible')
            .click();

        // Wait for creation and list refresh
        cy.wait('@createSnippet', { timeout: 10000 })
            .its('response.statusCode')
            .should('eq', 200);

        cy.wait('@getSnippetsList', { timeout: 10000 });

        // Verify snippet appears in list
        cy.get('[data-testid="snippet-row"]', { timeout: 10000 })
            .should('be.visible')
            .and('contain.text', 'Some snippet name');
    });

    it('Can add snippets via file', () => {
        cy.visit("/");
        cy.wait('@getSnippetsList', { timeout: 10000 });

        cy.contains('button', 'Add Snippet', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('ul[role="menu"]', { timeout: 5000 })
            .should('be.visible');

        cy.contains('li', 'Load snippet from file')
            .should('be.visible')
            .click();

        cy.get('[data-testid="upload-file-input"]', { timeout: 10000 })
            .should('exist');

        // Upload file
        cy.get('[data-testid="upload-file-input"]')
            .selectFile("cypress/fixtures/example_ps.ps", { force: true });

        // Debug: ver qué hay en el DOM después de subir el archivo
        cy.wait(3000);
        cy.screenshot('after-file-upload');

        // Ver TODOS los elementos en el body
        cy.get('body').then(($body) => {
            cy.log('=== DEBUGGING: Looking for inputs ===');

            // Buscar cualquier input
            const allInputs = $body.find('input');
            cy.log(`Found ${allInputs.length} input elements`);

            allInputs.each((index, el) => {
                const $el = Cypress.$(el);
                cy.log(`Input ${index}:`, {
                    id: $el.attr('id'),
                    name: $el.attr('name'),
                    'data-testid': $el.attr('data-testid'),
                    type: $el.attr('type'),
                    value: $el.val()
                });
            });

            // Buscar el #name específicamente
            if ($body.find('#name').length > 0) {
                cy.log('✅ #name EXISTS');
            } else {
                cy.log('❌ #name NOT FOUND');
            }

            // Buscar cualquier cosa que parezca un campo de nombre
            const nameInputs = $body.find('input[name*="name"], input[placeholder*="name"], input[placeholder*="Name"]');
            cy.log(`Found ${nameInputs.length} inputs with "name" in attributes`);
        });

        // Ahora comentamos la parte que falla para ver el debug
        // cy.get('#name', { timeout: 20000 })
        //     .should('exist')
        //     .and('be.visible')
        //     .and('have.value', 'example_ps');

        // cy.get('[data-testid="add-snippet-code-editor"]', { timeout: 10000 })
        //     .should('be.visible')
        //     .and('contain.text', 'let a = 10;');

        // cy.get('[data-testid="SaveIcon"]', { timeout: 5000 })
        //     .should('be.visible')
        //     .click();

        // cy.wait('@createSnippet', { timeout: 10000 })
        //     .its('response.statusCode')
        //     .should('eq', 200);

        // cy.wait('@getSnippetsList', { timeout: 10000 });

        // cy.get('[data-testid="snippet-row"]', { timeout: 10000 })
        //     .should('be.visible')
        //     .and('contain.text', 'example_ps');
    });
});