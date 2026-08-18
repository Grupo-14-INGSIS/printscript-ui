import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            Cypress.env('VITE_AUTH0_USERNAME'),
            Cypress.env('VITE_AUTH0_PASSWORD')
        )
    })

    it('Can add snippets manually', () => {
        cy.visit("/")
        cy.intercept('PUT', BACKEND_URL + "/api/v1/snippets/*", (req) => {
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('putRequest');

        /* ==== Generated with Cypress Studio ==== */
        cy.get('.css-9jay18 > .MuiButton-root').click();
        cy.get('.MuiList-root > [tabindex="0"]').click();
        cy.get('#name').type('Some snippet name');
        cy.get('#demo-simple-select').click()
        cy.get('[data-testid="menu-option-printscript"]').click()

        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: String = "some snippet" \n print(snippet)`);
        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@putRequest').its('response.statusCode').should('eq', 200);
    })

    it('Can add snippets via file', () => {
        cy.visit("/")
        cy.intercept('PUT', BACKEND_URL + "/api/v1/snippets/*", (req) => {
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('putRequest');

        /* ==== Generated with Cypress Studio ==== */
        cy.get('[data-testid="upload-file-input"').selectFile("cypress/fixtures/example_ps.ps", {force: true})

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
    })
})