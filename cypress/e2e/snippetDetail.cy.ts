import {AUTH0_PASSWORD, AUTH0_USERNAME, RUNNER_URL} from "../../src/utils/constants";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore";
import {CreateSnippet} from "../../src/utils/snippet";

const fakeSnippetStore = new FakeSnippetStore();

describe('Snippet Detail tests', () => {
    let testSnippetId: string;

    beforeEach(() => {
        // Create a dummy snippet first
        const dummySnippet: CreateSnippet = {
            id: 'test-snippet-id',
            name: 'Test Snippet',
            language: 'printscript',
            content: 'console.log("hello world");',
            extension: 'prs'
        };
        fakeSnippetStore.createSnippet(dummySnippet);
        testSnippetId = dummySnippet.id;

        // IMPORTANTE: Setup intercepts ANTES del login
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

        // Intercept GET request for a specific snippet by ID
        cy.intercept('GET', `**/api/v1/snippets/${testSnippetId}`, (req) => {
            const snippet = fakeSnippetStore.getSnippetById(testSnippetId);
            if (snippet) {
                req.reply({
                    statusCode: 200,
                    body: snippet,
                });
            } else {
                req.reply({
                    statusCode: 404,
                    body: 'Snippet not found',
                });
            }
        }).as('getSnippetById');

        // Now login (DESPUÉS de los intercepts)
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        );

        // Navigate to the specific snippet detail page
        cy.visit(`/snippets/${testSnippetId}`);

        // Wait for the snippet to load
        cy.wait('@getSnippetById', { timeout: 10000 });

        // Extra wait for rendering
        cy.wait(2000);
    });

    it('Can share a snippet', () => {
        cy.get('[aria-label="Share"]', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('#\\:rl\\:', { timeout: 5000 })
            .should('be.visible')
            .click();

        cy.get('#\\:rl\\:-option-0').click();

        cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();

        cy.wait(2000);
    });

    it('Can run snippets', function() {
        cy.get('[data-testid="PlayArrowIcon"]', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea')
            .should("have.length.greaterThan", 0);
    });

    it('Can format snippets', function() {
        cy.get('[data-testid="ReadMoreIcon"] > path', { timeout: 10000 })
            .should('be.visible')
            .click();
    });

    it('Can save snippets', function() {
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea')
            .type("Some new line");

        cy.get('[data-testid="SaveIcon"] > path')
            .should('be.visible')
            .click();
    });

    it('Can delete snippets', function() {
        cy.get('[data-testid="DeleteIcon"] > path', { timeout: 10000 })
            .should('be.visible')
            .click();
    });
});