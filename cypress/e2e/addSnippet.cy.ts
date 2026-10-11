import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Add Snippet E2E (Real Backend)', () => {
    beforeEach(() => {
        const username = Cypress.env('VITE_AUTH0_USERNAME') || AUTH0_USERNAME || "desireless1789@gmail.com";
        const password = Cypress.env('VITE_AUTH0_PASSWORD') || AUTH0_PASSWORD || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);
    });

    it('Can add snippet manually and persist it in real database', () => {
        const uniqueSnippetName = `Snippet-Real-${Date.now()}`;

        cy.visit("/");

        // Abrir modal de creación
        cy.contains('button', 'Add Snippet', { timeout: 15000 }).should('be.visible').click();
        cy.contains('Create snippet').should('be.visible').click();

        // Completar formulario con código PrintScript real
        cy.get('#name').should('be.visible').type(uniqueSnippetName);
        cy.get('[data-testid="add-snippet-code-editor"]').should('be.visible').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type('let x: string = "hello world";\nprintln(x);');

        // Guardar en el backend real
        cy.contains('button', 'Save Snippet').should('be.visible').click();

        // Verificar confirmación del backend
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');
        cy.get('.MuiAlert-action button').click();

        // Filtrar por nombre para encontrarlo independientemente de la paginación
        cy.get('input[aria-label="search"]').clear().type(uniqueSnippetName);

        // Verificar que persiste y aparece en la lista
        cy.contains(uniqueSnippetName, { timeout: 15000 }).should('exist');
    });

    it('Can add snippet via .ps file and persist it in real backend', () => {
        cy.visit("/");

        // Subir archivo real
        cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", { force: true });

        // Guardar
        cy.contains('button', 'Save Snippet').should('be.visible').click();

        // Verificar respuesta exitosa real
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');
    });
});