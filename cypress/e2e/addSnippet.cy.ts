import {AUTH0_PASSWORD, AUTH0_USERNAME, RUNNER_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })

    // Crear un snippet es un PUT al Runner (valida el código, guarda el contenido y lo
    // registra en App). La request va al backend real; acá solo se verifica la respuesta.
    const createSnippetUrl = RUNNER_URL + "/api/v1/snippets/*";

    it('Can add snippets manually', () => {
        const snippetName = `Some snippet name ${Date.now()}`;
        cy.visit("/")
        cy.intercept('PUT', createSnippetUrl, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(201);
                expect(res.body).to.include.keys("id", "name", "content", "language")
                expect(res.body.name).to.eq(snippetName);
                expect(res.body.language).to.eq("printscript");
            });
        }).as('putRequest');

        cy.contains('button', 'Add Snippet').click();
        cy.contains('li', 'Create snippet').click();
        cy.get('#name').type(snippetName);
        cy.get('#demo-simple-select').click()
        cy.get('[data-testid="menu-option-printscript"]').click()

        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type('let snippet: string = "some snippet";\nprintln(snippet);');
        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@putRequest').its('response.statusCode').should('eq', 201);
        cy.contains('Snippet created successfully').should('be.visible');

        // Quedó persistido: aparece al buscarlo por nombre
        cy.get('input[aria-label="search"]').clear().type(snippetName);
        cy.contains('[data-testid="snippet-row"]', snippetName).should('exist');
    })

    it('Can add snippets via file', () => {
        cy.visit("/")
        cy.intercept('PUT', createSnippetUrl, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(201);
                expect(res.body).to.include.keys("id", "name", "content", "language")
                expect(res.body.name).to.eq("example_ps");
                expect(res.body.content).to.include("println(num1 + num2);");
            });
        }).as('putRequest');

        cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", {force: true})

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@putRequest').its('response.statusCode').should('eq', 201);
        cy.contains('Snippet created successfully').should('be.visible');
    })
})
