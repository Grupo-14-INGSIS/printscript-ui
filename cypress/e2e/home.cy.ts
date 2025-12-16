import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL, FRONTEND_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";
import {FakeSnippetStore} from "../../src/utils/mock/fakeSnippetStore"; // Import FakeSnippetStore

const fakeSnippetStore = new FakeSnippetStore(); // Create an instance of the fake store

describe('Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(
        AUTH0_USERNAME,
        AUTH0_PASSWORD
    )

    // Intercept GET request for snippets list
    cy.intercept('GET', BACKEND_URL + "/api/v1/snippets*", (req) => {
      req.reply({
        statusCode: 200,
        body: fakeSnippetStore.listSnippetDescriptors(), // Return mock data
      });
    }).as('getSnippetsList');

    // Intercept PUT request for creating a snippet (UI calls App, App calls Runner)
    cy.intercept('PUT', BACKEND_URL + "/api/v1/snippets/*", (req) => {
      const snippetDataFromRequest = { // Data as sent by the application
        id: req.body.id,
        name: req.body.name,
        language: req.body.language,
        content: '', // App receives only metadata
        extension: 'prs'
      };
      // Use the fake store's createSnippet method to add it to the mock data
      fakeSnippetStore.createSnippet(snippetDataFromRequest); // Store metadata
      req.reply({
        statusCode: 200,
        body: {}, // App expects empty body for PUT /snippets/{id}
      });
    }).as('createSnippet');
  })

  it('Renders home', () => {
    cy.visit(FRONTEND_URL)
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
    cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
    cy.get('.css-jie5ja').click();
    /* ==== End Cypress Studio ==== */
  })

  it('Renders the first snippets', () => {
    cy.visit(FRONTEND_URL)
    // Wait for the intercepted GET request
    cy.wait('@getSnippetsList');
    const first10Snippets = cy.get('[data-testid="snippet-row"]')

    first10Snippets.should('have.length.greaterThan', 0)
    // There are 3 initial snippets in fakeSnippetStore
    first10Snippets.should('have.length', fakeSnippetStore.listSnippetDescriptors().length);
  })

  it('Can creat snippet find snippets by name', () => {
    cy.visit(FRONTEND_URL)
    const snippetData: CreateSnippet = {
      name: "Test name",
      content: "print(1)",
      language: "printscript",
      extension: ".ps"
    }

    // Simulate UI actions to create a snippet
    cy.contains('button', 'Add Snippet').click(); // Click the 'Add Snippet' button
    cy.contains('li', 'Create snippet').click(); // Click the 'Create snippet' menu item
    cy.get('input#name').type(snippetData.name); // Type the snippet name
    cy.get('[data-testid="add-snippet-code-editor"]').type(snippetData.content); // Type the snippet content
    cy.contains('button', 'Save Snippet').click(); // Click the save button

    // Wait for the mocked POST request to complete
    cy.wait('@createSnippet').its('request.body').then((reqBody) => {
      expect(reqBody.name).to.eq(snippetData.name);
      expect(reqBody.snippet).to.eq(snippetData.content);
    });

    // The modal should close and the new snippet should appear in the list
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').clear();
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').type(snippetData.name + "{enter}");

    // Wait for the GET snippets request to be made after search
    cy.wait("@getSnippetsList");

    cy.contains(snippetData.name).should('exist');
  })
})
