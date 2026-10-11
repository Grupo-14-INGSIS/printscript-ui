import {AUTH0_PASSWORD, AUTH0_USERNAME, FRONTEND_URL, RUNNER_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";
import {v4 as uuidv4} from "uuid";

// GET /api/v1/snippets?page=...&name=...  (listado real de App)
const listSnippetsUrl = /\/api\/v1\/snippets(\?.*)?$/;

describe('Home', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })

    it('Renders home', () => {
        cy.visit(FRONTEND_URL)
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('input[aria-label="search"]').should('be.visible');
        cy.contains('button', 'Add Snippet').should('be.visible').click();
        cy.contains('li', 'Create snippet').should('be.visible');
        cy.contains('li', 'Load snippet from file').should('be.visible');
    })

    // You need to have at least 1 snippet in your DB for this test to pass
    it('Renders the first snippets', () => {
        cy.intercept('GET', listSnippetsUrl, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getSnippets');

        cy.visit(FRONTEND_URL)
        cy.wait('@getSnippets')

        cy.get('[data-testid="snippet-row"]').should('have.length.greaterThan', 0)
        // la página muestra como máximo pageSize (10) filas
        cy.get('[data-testid="snippet-row"]').should('have.length.at.most', 10)
    })

    it('Can creat snippet find snippets by name', () => {
        cy.visit(FRONTEND_URL)
        const snippetData: CreateSnippet = {
            id: uuidv4(),
            name: `Test name ${Date.now()}`,
            content: "println(1);",
            language: "printscript",
            extension: ".ps"
        }

        // La búsqueda por nombre pega al listado real con ?name=...
        cy.intercept('GET', /\/api\/v1\/snippets\?.*name=/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('searchSnippets');

        // Se crea el snippet por API, con el token real de la sesión (igual que la UI)
        cy.getAccessToken().then((token) => {
            const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const userId = JSON.parse(atob(payload)).sub as string;

            cy.request({
                method: 'PUT',
                url: `${RUNNER_URL}/api/v1/snippets/${snippetData.id}`,
                headers: {Authorization: `Bearer ${token}`},
                body: {
                    userId: userId,
                    name: snippetData.name,
                    language: snippetData.language,
                    snippet: snippetData.content,
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(201);

                expect(response.body.name).to.eq(snippetData.name)
                expect(response.body.content).to.eq(snippetData.content)
                expect(response.body.language).to.eq(snippetData.language)
                expect(response.body).to.haveOwnProperty("id")
                expect(response.body.id).to.eq(snippetData.id)

                cy.get('input[aria-label="search"]').clear();
                cy.get('input[aria-label="search"]').type(snippetData.name + "{enter}");

                cy.wait("@searchSnippets")
                cy.contains('[data-testid="snippet-row"]', snippetData.name).should('exist');
            })
        })
    })
})
