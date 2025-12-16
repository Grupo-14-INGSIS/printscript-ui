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

        // Setup intercepts ANTES del login
        cy.intercept('GET', '**/api/v1/snippets*', (req) => {
            req.reply({
                statusCode: 200,
                body: fakeSnippetStore.listSnippetDescriptors(),
            });
        }).as('getSnippetsList');

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

        // Intercept para RUN snippet
        cy.intercept('POST', `**/api/v1/runner/run/${testSnippetId}`, (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    output: 'hello world',
                    errors: []
                }
            });
        }).as('runSnippet');

        // Intercept para FORMAT snippet
        cy.intercept('POST', `**/api/v1/runner/format/${testSnippetId}`, (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    formattedCode: 'console.log("hello world");'
                }
            });
        }).as('formatSnippet');

        // Intercept para SAVE/UPDATE snippet
        cy.intercept('PUT', `**/api/v1/snippets/${testSnippetId}`, (req) => {
            req.reply({
                statusCode: 200,
                body: { success: true }
            });
        }).as('updateSnippet');

        // Intercept para DELETE snippet
        cy.intercept('DELETE', `**/api/v1/snippets/${testSnippetId}`, (req) => {
            req.reply({
                statusCode: 200,
                body: { success: true }
            });
        }).as('deleteSnippet');

        // Login
        cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD);

        // Navigate to the specific snippet detail page
        cy.visit(`/snippets/${testSnippetId}`);

        // Wait for the snippet to load
        cy.wait('@getSnippetById', { timeout: 10000 });

        // Esperar a que la página se renderice
        cy.wait(2000);
    });

    it('Can share a snippet', () => {
        // Buscar el botón de Share - probemos varias formas
        cy.get('button').contains(/share/i, { timeout: 10000 })
            .should('be.visible')
            .click();

        // Si el botón no tiene texto, intentar con aria-label
        cy.get('button[aria-label*="Share"], button[aria-label*="share"]', { timeout: 5000 })
            .should('be.visible')
            .first()
            .click({ force: true });

        // Esperar a que algo aparezca (modal, dropdown, etc)
        cy.wait(2000);

        // Tomar screenshot para debug
        cy.screenshot('after-share-click');
    });

    it('Can run snippets', function() {
        // Debug: ver qué botones hay disponibles
        cy.get('button').then(($buttons) => {
            cy.log(`Found ${$buttons.length} buttons`);
            $buttons.each((i, btn) => {
                cy.log(`Button ${i}: ${Cypress.$(btn).attr('aria-label')} - disabled: ${Cypress.$(btn).prop('disabled')}`);
            });
        });

        // Intentar encontrar el botón de Play/Run
        cy.get('button[aria-label*="Run"], button[aria-label*="run"], button[aria-label*="Play"]', { timeout: 10000 })
            .should('exist')
            .then(($btn) => {
                // Log del estado del botón
                cy.log('Button disabled state:', $btn.prop('disabled'));
                cy.log('Button aria-label:', $btn.attr('aria-label'));

                // Si está deshabilitado, esperar un poco más
                if ($btn.prop('disabled')) {
                    cy.wait(3000);
                }
            });

        // Intentar hacer clic con force si es necesario
        cy.get('[data-testid="PlayArrowIcon"]', { timeout: 10000 })
            .parents('button')
            .click({ force: true });

        // Esperar un poco para que se ejecute
        cy.wait(2000);

        // Screenshot para debug
        cy.screenshot('after-run-click');
    });

    it('Can format snippets', function() {
        // Buscar el botón de format
        cy.get('[data-testid="ReadMoreIcon"]', { timeout: 10000 })
            .should('exist')
            .parents('button')
            .then(($btn) => {
                // Hacer scroll al elemento
                $btn[0].scrollIntoView();
                cy.wait(500);
            });

        // Hacer clic con force
        cy.get('[data-testid="ReadMoreIcon"]')
            .parents('button')
            .click({ force: true });

        // Esperar un poco
        cy.wait(2000);

        // Screenshot para debug
        cy.screenshot('after-format-click');
    });

    it('Can save snippets', function() {
        // Buscar el editor de código
        cy.get('.npm__react-simple-code-editor__textarea', { timeout: 10000 })
            .should('exist')
            .first()
            .then(($editor) => {
                // Hacer scroll al editor
                $editor[0].scrollIntoView();
                cy.wait(500);
            });

        // Hacer clic en el editor
        cy.get('.npm__react-simple-code-editor__textarea')
            .first()
            .click({ force: true });

        // Escribir algo nuevo
        cy.get('.npm__react-simple-code-editor__textarea')
            .first()
            .type('{enter}Some new line', { force: true });

        // Esperar un poco
        cy.wait(1000);

        // Buscar el botón de guardar
        cy.get('[data-testid="SaveIcon"]', { timeout: 5000 })
            .should('exist')
            .parents('button')
            .then(($btn) => {
                $btn[0].scrollIntoView();
                cy.wait(500);
            });

        // Hacer clic en guardar
        cy.get('[data-testid="SaveIcon"]')
            .parents('button')
            .click({ force: true });

        // Esperar confirmación
        cy.wait(2000);

        // Screenshot para debug
        cy.screenshot('after-save-click');
    });

    it('Can delete snippets', function() {
        // Buscar el botón de delete
        cy.get('[data-testid="DeleteIcon"]', { timeout: 10000 })
            .should('exist')
            .parents('button')
            .then(($btn) => {
                $btn[0].scrollIntoView();
                cy.wait(500);
            });

        // Hacer clic en delete
        cy.get('[data-testid="DeleteIcon"]')
            .parents('button')
            .click({ force: true });

        // Esperar un poco para ver si aparece modal de confirmación
        cy.wait(1000);

        // Screenshot para debug
        cy.screenshot('after-delete-click');

        // Si hay un modal de confirmación, intentar confirmar
        cy.get('body').then(($body) => {
            const confirmButton = $body.find('button:contains("Delete"), button:contains("Confirm"), button:contains("Yes")');
            if (confirmButton.length > 0) {
                cy.wrap(confirmButton).first().click({ force: true });
            }
        });
    });
});