import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Home Page E2E (Real Backend)', () => {
    beforeEach(() => {
        const username = Cypress.env('VITE_AUTH0_USERNAME') || AUTH0_USERNAME || "desireless1789@gmail.com";
        const password = Cypress.env('VITE_AUTH0_PASSWORD') || AUTH0_PASSWORD || "desireless1789@gmail.com";
        cy.loginToAuth0(username, password);
    });

    it('Renders home page with brand and navigation controls', () => {
        cy.visit("/");

        // Verificar branding del header
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');

        // Verificar input de búsqueda
        cy.get('input[aria-label="search"]').should('be.visible');

        // Verificar botón Add Snippet
        cy.contains('button', 'Add Snippet').should('be.visible');
    });

    it('Search: Creates real snippet and finds it through search filter', () => {
        const uniqueSearchName = `Search-Real-${Date.now()}`;

        cy.visit("/");

        // 1. Crear snippet real en la base de datos
        cy.contains('button', 'Add Snippet', { timeout: 15000 }).click();
        cy.contains('Create snippet').click();
        cy.get('#name').type(uniqueSearchName);
        cy.get('[data-testid="add-snippet-code-editor"]').click().type('println("search test");');
        cy.contains('button', 'Save Snippet').click();
        cy.contains('Snippet created successfully', { timeout: 20000 }).should('be.visible');
        cy.get('.MuiAlert-action button').click();

        // 2. Buscarlo en la barra de búsqueda real
        cy.get('input[aria-label="search"]').clear().type(uniqueSearchName);

        // 3. Verificar que aparezca en el listado filtrado
        cy.contains(uniqueSearchName, { timeout: 15000 }).should('exist');

        // 4. Limpieza: entrar y borrarlo de la base de datos
        cy.contains('[data-testid="snippet-row"]', uniqueSearchName).click();
        cy.get('[data-testid="DeleteIcon"]', { timeout: 10000 }).click();
        cy.contains('button', 'Delete').click();
    });
});