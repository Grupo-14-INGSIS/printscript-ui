import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";

describe('Home', () => {
    beforeEach(() => {
        const username = AUTH0_USERNAME || Cypress.env('VITE_AUTH0_USERNAME') || "desireless1789@gmail.com";
        const password = AUTH0_PASSWORD || Cypress.env('VITE_AUTH0_PASSWORD') || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);

        // Intercept user registration
        cy.intercept('PUT', '**/users*', {
            statusCode: 200,
            body: {},
        }).as("registerUser");
    });

    it('Renders home', () => {
        cy.intercept('GET', /\/snippets(\?.*)?$/, {
            statusCode: 200,
            body: {},
        }).as("getSnippets");

        cy.visit("/");

        // Assert header brand name
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');

        // Assert search bar is visible
        cy.get('input[aria-label="search"]').should('be.visible');

        // Assert Add Snippet button is visible
        cy.contains('button', 'Add Snippet').should('be.visible');
    });

    it('Renders the first snippets', () => {
        const fakeSnippets: Record<string, { name: string; language: string; author: string; compliance: string }> = {
            "1": { name: "Snippet Alpha", language: "printscript", author: "alice", compliance: "compliant" },
            "2": { name: "Snippet Beta", language: "printscript", author: "bob", compliance: "compliant" },
            "3": { name: "Snippet Gamma", language: "printscript", author: "charlie", compliance: "compliant" },
        };

        cy.intercept('GET', /\/snippets(\?.*)?$/, {
            statusCode: 200,
            body: fakeSnippets,
        }).as("getSnippets");

        cy.visit("/");

        const first10Snippets = cy.get('[data-testid="snippet-row"]');

        first10Snippets.should('have.length.greaterThan', 0);
        first10Snippets.should('have.length.lessThan', 10);
    });

    it('Can creat snippet find snippets by name', () => {
        const snippetData: CreateSnippet = {
            id: "test-id",
            name: "Test name",
            content: 'println("Hello");',
            language: "printscript",
            extension: ".ps"
        };

        let searchActive = false;

        cy.intercept('GET', /\/snippets(\?.*)?$/, (req) => {
            if (searchActive || req.url.includes('name=Test') || req.url.includes('name=test')) {
                req.reply({
                    statusCode: 200,
                    body: {
                        "test-id": {
                            name: snippetData.name,
                            language: snippetData.language,
                            author: "alice",
                            compliance: "compliant",
                        }
                    },
                });
            } else {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        }).as('getSnippets');

        cy.intercept('PUT', '**/snippet*/**', (req) => {
            req.reply({
                statusCode: 200,
                body: { ...snippetData, id: "test-id" },
            });
        }).as('createSnippet');

        cy.visit("/");

        // 1. Create snippet
        cy.contains('button', 'Add Snippet').click();
        cy.contains('Create snippet').click();
        cy.get('#name').type(snippetData.name);
        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(snippetData.content);
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully').should('be.visible');

        // 2. Search for the snippet by name
        searchActive = true;
        cy.get('input[aria-label="search"]').clear().type(snippetData.name);

        cy.wait('@getSnippets');
        cy.contains(snippetData.name).should('exist');
    });
});