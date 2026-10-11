import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Snippet Detail & Operations E2E (Real Backend)', () => {
    beforeEach(() => {
        const username = Cypress.env('VITE_AUTH0_USERNAME') || AUTH0_USERNAME || "desireless1789@gmail.com";
        const password = Cypress.env('VITE_AUTH0_PASSWORD') || AUTH0_PASSWORD || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);
    });

    it('Lifecycle: Creates real snippet, runs in Runner, formats, saves update, and deletes', () => {
        const testName = `Snippet-Lifecycle-${Date.now()}`;

        cy.visit("/");

        // 1. Crear un snippet de verdad
        cy.contains('button', 'Add Snippet', { timeout: 15000 }).should('be.visible').click();
        cy.contains('Create snippet').should('be.visible').click();

        cy.get('#name').type(testName);
        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type('let n: number = 42;\nprintln(n);');
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');

        // 2. Abrir el detalle del snippet real recién creado
        cy.contains('[data-testid="snippet-row"]', testName, { timeout: 15000 }).click();
        cy.contains('Loading...').should('not.exist');

        // 3. Ejecutar en el Runner de Kotlin real
        cy.get('[data-testid="PlayArrowIcon"]', { timeout: 10000 }).should('be.visible').click();
        cy.contains(/OUTPUT/i, { timeout: 20000 }).should('be.visible');

        // 4. Formatear código en base a reglas
        cy.get('[data-testid="ReadMoreIcon"]').click();
        cy.contains('Snippet formatted successfully', { timeout: 10000 }).should('be.visible');

        // 5. Modificar y guardar código en el backend real
        cy.get('.npm__react-simple-code-editor__textarea')
            .first()
            .type('\nprintln("nueva linea");');
        cy.get('[data-testid="SaveIcon"]').parents('button').should('not.be.disabled').click();
        cy.contains('Snippet updated successfully', { timeout: 10000 }).should('be.visible');

        // 6. Eliminar el snippet real de la base de datos
        cy.get('[data-testid="DeleteIcon"]').click();
        cy.contains('Are you sure you want to delete this snippet?').should('be.visible');
        cy.contains('button', 'Delete').click();

        // 7. Verificar que ya no exista en la base de datos
        cy.visit("/");
        cy.contains(testName).should('not.exist');
    });

    it('Sharing: Shares snippet with another real user and revokes/deletes', () => {
        const shareSnippetName = `Snippet-Share-${Date.now()}`;

        cy.visit("/");

        // Crear snippet para compartir
        cy.contains('button', 'Add Snippet', { timeout: 15000 }).click();
        cy.contains('Create snippet').click();
        cy.get('#name').type(shareSnippetName);
        cy.get('[data-testid="add-snippet-code-editor"]').click().type('println("shared code");');
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');

        // Abrir detalle
        cy.contains('[data-testid="snippet-row"]', shareSnippetName, { timeout: 15000 }).click();
        cy.contains('Loading...').should('not.exist');

        // Compartir con usuario a través de AccessManager real
        cy.get('[aria-label="Share"]', { timeout: 10000 }).click();
        cy.contains('Share your snippet').should('be.visible');
        cy.get('input[type="text"]').last().type('testuser@mail.com');
        cy.contains('button', 'Share').click();

        // Cerrar modal
        cy.contains('button', 'Close').click();
        cy.contains('Share your snippet').should('not.exist');

        // Limpiar: Borrar el snippet
        cy.get('[data-testid="DeleteIcon"]').click();
        cy.contains('button', 'Delete').click();
    });

    it('Tests interface: Opens test modal for snippet', () => {
        const testCaseSnippet = `Snippet-Tests-${Date.now()}`;

        cy.visit("/");

        // Crear snippet
        cy.contains('button', 'Add Snippet', { timeout: 15000 }).click();
        cy.contains('Create snippet').click();
        cy.get('#name').type(testCaseSnippet);
        cy.get('[data-testid="add-snippet-code-editor"]').click().type('let x: number = 1;\nprintln(x);');
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');

        // Abrir detalle
        cy.contains('[data-testid="snippet-row"]', testCaseSnippet, { timeout: 15000 }).click();
        cy.contains('Loading...').should('not.exist');

        // Abrir interfaz de test cases
        cy.get('[data-testid="BugReportIcon"]').first().click();
        cy.contains('Tests for', { timeout: 10000 }).should('exist');
        cy.contains('Create New Test').should('exist').click({ force: true });
        cy.contains('Save Test').should('exist');

        // Limpiar: Borrar snippet
        cy.visit("/");
        cy.contains('[data-testid="snippet-row"]', testCaseSnippet).click();
        cy.get('[data-testid="DeleteIcon"]').click();
        cy.contains('button', 'Delete').click();
    });
});