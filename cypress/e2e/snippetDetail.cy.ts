import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore";

describe('Snippet Detail tests', () => {
    const fakeStore = new FakeSnippetStore();

    beforeEach(() => {
        const username = AUTH0_USERNAME || Cypress.env('VITE_AUTH0_USERNAME') || "desireless1789@gmail.com";
        const password = AUTH0_PASSWORD || Cypress.env('VITE_AUTH0_PASSWORD') || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);

        // Intercept user registration (called on auth)
        cy.intercept('PUT', '**/users*', {
            statusCode: 200,
            body: {},
        }).as("registerUser");

        // Intercept initial snippets list — the real API returns a Record<id, details> map.
        // We use RegExp so query parameters like ?page=0&pageSize=10 are properly matched.
        const snippetsMap: Record<string, { name: string; language: string; author: string; compliance: string }> = {};
        fakeStore.snippets.forEach(s => {
            snippetsMap[s.id] = { name: s.name, language: s.language, author: s.author, compliance: s.compliance };
        });

        // Intercept individual snippet detail & content for any snippet ID
        cy.intercept('GET', /\/(snippet\/)?snippets\/[0-9]+$/, (req) => {
            if (req.url.includes('19082') || req.url.includes('runner') || req.url.includes('/snippet/snippets/')) {
                req.reply({
                    statusCode: 200,
                    body: {
                        content: 'println("Hello, World!");',
                    },
                });
            } else {
                req.reply({
                    statusCode: 200,
                    body: {
                        snippetId: "1",
                        id: "1",
                        name: "Hello World",
                        language: "printscript",
                        compliance: "compliant",
                        author: "alice",
                    },
                });
            }
        }).as("getSnippetData");

        cy.intercept('GET', /\/tests/, {
            statusCode: 200,
            body: [],
        }).as("getTests");

        cy.intercept('GET', /\/snippets(\?.*)?$/, {
            statusCode: 200,
            body: snippetsMap,
        }).as("getSnippets");

        cy.visit("/");

        // Select the 'Hello World' snippet row specifically to open snippet detail
        cy.contains('[data-testid="snippet-row"]', 'Hello World').click();

        // Ensure snippet detail has rendered and finished loading
        cy.contains('Loading...').should('not.exist');
        cy.get('[aria-label="Share"]', { timeout: 10000 }).should('be.visible');
    });

    it('Can share a snippet', () => {
        cy.intercept('GET', '**/permission*', {
            statusCode: 200,
            body: [],
        }).as('getSharedUsers');

        cy.intercept({ method: /(PUT|POST)/, url: '**/permission*' }, {
            statusCode: 200,
            body: { success: true },
        }).as('shareSnippet');

        // Open share modal
        cy.get('[aria-label="Share"]').click();
        cy.contains('Share your snippet').should('be.visible');

        // Type user email to share with
        cy.get('input[type="text"]').last().type('testuser@mail.com');

        // Click Share button
        cy.contains('button', 'Share').click();

        // Assert request was triggered with correct body and succeeded
        cy.wait('@shareSnippet').then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
            expect(interception.request.body).to.have.property('userId', 'testuser@mail.com');
        });

        // Assert input was cleared after sharing
        cy.get('input[type="text"]').last().should('have.value', '');

        // Assert modal can be closed cleanly
        cy.contains('button', 'Close').click();
        cy.contains('Share your snippet').should('not.exist');
    });

    it('Can run snippets', function() {
        cy.intercept('POST', '**/execution*', {
            statusCode: 200,
            body: {
                status: "SUCCESS",
                message: ["Program executed successfully"],
            },
        }).as('startExecution');

        cy.get('[data-testid="PlayArrowIcon"]').click();

        // Assert execution request was sent and returned 200
        cy.wait('@startExecution').its('response.statusCode').should('eq', 200);

        // Assert output section displays the output from the execution
        cy.contains(/OUTPUT/i).should('be.visible');
        cy.contains('Program executed successfully').should('exist');
    });

    it('Can format snippets', function() {
        cy.intercept('GET', '**/rules*', {
            statusCode: 200,
            body: {},
        }).as('getFormatRules');

        cy.get('[data-testid="ReadMoreIcon"]').click();

        // Assert user feedback snackbar is displayed
        cy.contains('Snippet formatted successfully').should('be.visible');

        // Assert code editor continues to have content
        cy.get('.npm__react-simple-code-editor__textarea')
            .first()
            .should('not.have.value', '');
    });

    it('Can save snippets', function() {
        let currentSnippetContent = 'println("Hello, World!");';
        cy.intercept('GET', /\/(snippet\/)?snippets\/[0-9]+/, (req) => {
            if (req.url.includes('19082') || req.url.includes('/runner') || req.url.includes('/snippet/snippets/')) {
                req.reply({
                    statusCode: 200,
                    body: { content: currentSnippetContent },
                });
            }
        }).as('getRefetchedSnippetContent');

        // Assert initial precondition: save button is disabled when content has not changed
        cy.get('[data-testid="SaveIcon"]').parents('button').should('be.disabled');

        cy.intercept('PATCH', '**/snippets/*', (req) => {
            currentSnippetContent = 'println("Hello, World!");\n// new line added for save test';
            req.reply({ statusCode: 200, body: {} });
        }).as('patchSnippet');

        cy.intercept('PATCH', '**/snippet/snippets/*', (req) => {
            currentSnippetContent = 'println("Hello, World!");\n// new line added for save test';
            req.reply({ statusCode: 200, body: {} });
        }).as('patchSnippetLegacy');

        cy.intercept('PUT', '**/snippets/*', (req) => {
            currentSnippetContent = 'println("Hello, World!");\n// new line added for save test';
            req.reply({ statusCode: 200, body: {} });
        }).as('putSnippet');

        // Modify editor content
        cy.get('.npm__react-simple-code-editor__textarea')
            .first()
            .type('\n// new line added for save test');

        // Assert save button is now enabled
        cy.get('[data-testid="SaveIcon"]').parents('button').should('not.be.disabled');

        // Click save button
        cy.get('[data-testid="SaveIcon"]').click();

        // Assert feedback snackbar is shown
        cy.contains('Snippet updated successfully').should('be.visible');

        // Assert save button becomes disabled again (no pending changes)
        cy.get('[data-testid="SaveIcon"]').parents('button').should('be.disabled');
    });

    it('Can delete snippets', function() {
        cy.intercept('DELETE', '**/snippets/*', {
            statusCode: 200,
            body: "Deleted",
        }).as('deleteSnippet');

        cy.get('[data-testid="DeleteIcon"]').click();

        // Assert confirmation modal is displayed
        cy.contains('Are you sure you want to delete this snippet?').should('be.visible');

        // Confirm delete action
        cy.contains('button', 'Delete').click();

        // Assert DELETE request was dispatched
        cy.wait('@deleteSnippet').its('response.statusCode').should('be.oneOf', [200, 204]);

        // Assert modal is closed
        cy.contains('Are you sure you want to delete this snippet?').should('not.exist');
    });

    it('Can open test snippet modal and view test interface', function() {
        cy.get('[data-testid="BugReportIcon"]').first().click();
        cy.contains('Tests for').should('exist');
        cy.contains('Create New Test').should('exist').click({ force: true });
        cy.contains('Save Test').should('exist');
    });
});