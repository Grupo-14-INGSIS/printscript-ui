import {AUTH0_PASSWORD, AUTH0_USERNAME, RUNNER_URL} from "../../src/utils/constants";

describe('Snippet detail tests', () => {
    // Snippet real, creado una vez para esta suite; el último test lo borra.
    const snippetName = `Detail snippet ${Date.now()}`;
    const snippetContent = 'let greeting: string = "Hello e2e";\nprintln(greeting);';

    before(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
        cy.visit("/")
        cy.contains('button', 'Add Snippet').click();
        cy.contains('li', 'Create snippet').click();
        cy.get('#name').type(snippetName);
        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(snippetContent);
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully').should('be.visible');
    })

    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
        cy.intercept('GET', /\/api\/v1\/snippets(\?.*)?$/).as("getSnippets")
        cy.intercept('GET', /\/api\/v1\/snippets\/[^/?]+$/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as("getSnippetById")
        // El modal de compartir pide la lista de usuarios al montarse el detalle
        cy.intercept('GET', /\/api\/v1\/users(\?.*)?$/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getUsers');

        cy.visit("/")
        cy.wait("@getSnippets")

        // Abrir el detalle del snippet de la suite (se busca por nombre por si no está en la primera página)
        cy.get('input[aria-label="search"]').clear().type(snippetName);
        cy.contains('[data-testid="snippet-row"]', snippetName).click();
        cy.wait("@getSnippetById")
        cy.contains('Loading...').should('not.exist');
        cy.get('[aria-label="Share"]').should('be.visible');
    })

    it('Can share a snippet', () => {
        cy.intercept('POST', /\/api\/v1\/snippets\/[^/]+\/permissions$/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('shareSnippet');

        cy.get('[aria-label="Share"]').click();
        cy.contains('Share your snippet').should('be.visible');

        // El autocomplete lista los usuarios reales; se elige el primero que no sea el logueado
        cy.get('input[placeholder="Start typing to search users..."]').click();
        cy.wait('@getUsers');
        cy.get('[role="option"]').should('have.length.greaterThan', 0);
        cy.get('[role="option"]').then(($options) => {
            const emails = $options.toArray().map((el) => el.textContent?.trim() ?? '');
            const email = emails.find((e) => e !== AUTH0_USERNAME && e !== '');
            expect(email, 'another real user to share with').to.exist;

            cy.contains('[role="option"]', email!).click();
            cy.contains('button', 'Share').click();

            cy.wait('@shareSnippet').then((interception) => {
                expect(interception.request.body).to.have.property('userId', email);
                expect(interception.response?.statusCode).to.eq(200);
            });
            cy.contains(`Snippet shared with ${email}`).should('be.visible');
            // Quedó registrado en el AccessManager: aparece en la lista de compartidos
            cy.contains('li', email!).should('exist');
        });

        cy.contains('button', 'Close').click();
        cy.contains('Share your snippet').should('not.exist');
    })

    it('Can run snippets', function() {
        cy.intercept('POST', /\/api\/v1\/snippets\/[^/]+\/executions$/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('runSnippet');

        cy.get('[data-testid="PlayArrowIcon"]').click();

        // El Runner ejecutó el snippet: la salida es la del código real
        cy.wait('@runSnippet').its('response.body.message').should('include', 'Hello e2e');
        cy.get('.npm__react-simple-code-editor__textarea').should("have.length.greaterThan", 1);
        cy.get('.npm__react-simple-code-editor__textarea').last().should('contain.value', 'Hello e2e');
        // el estado queda debajo del output dentro del modal: hay que scrollear hasta el
        cy.contains('p', 'Execution finished').scrollIntoView().should('be.visible');
    });

    it('Can format snippets', function() {
        cy.intercept('GET', /\/api\/v1\/rules\?task=formatting/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getFormatRules');

        cy.get('[data-testid="ReadMoreIcon"]').click();

        cy.wait('@getFormatRules');
        cy.contains('Snippet formatted successfully').should('be.visible');
        cy.get('.npm__react-simple-code-editor__textarea').first().should('contain.value', 'println(greeting);');
    });

    it('Can save snippets', function() {
        cy.intercept('PATCH', RUNNER_URL + '/api/v1/snippets/*', (req) => {
            expect(req.body.snippet).to.include('println("saved");');
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('patchSnippet');

        // Sin cambios el botón de guardar está deshabilitado
        cy.get('[data-testid="SaveIcon"]').parents('button').should('be.disabled');

        cy.get('.npm__react-simple-code-editor__textarea').first().click();
        cy.get('.npm__react-simple-code-editor__textarea').first().type('\nprintln("saved");');
        cy.get('[data-testid="SaveIcon"]').parents('button').should('not.be.disabled');
        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@patchSnippet');
        cy.contains('Snippet updated successfully').should('be.visible');
        // Al recargar el snippet desde el backend, el contenido guardado es el nuevo
        cy.get('[data-testid="SaveIcon"]').parents('button').should('be.disabled');
    });

    it('Can delete snippets', function() {
        cy.intercept('DELETE', /\/api\/v1\/snippets\/[^/]+$/, (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('deleteSnippet');

        cy.get('[data-testid="DeleteIcon"]').click();
        cy.contains('Are you sure you want to delete this snippet?').should('be.visible');
        cy.contains('button', 'Delete').click();

        cy.wait('@deleteSnippet');
        cy.contains('Are you sure you want to delete this snippet?').should('not.exist');

        // Ya no está en la base: la búsqueda por nombre no lo encuentra
        cy.get('input[aria-label="search"]').clear().type(snippetName);
        cy.contains('No snippets found').should('be.visible');
        cy.contains('[data-testid="snippet-row"]', snippetName).should('not.exist');
    });
})
