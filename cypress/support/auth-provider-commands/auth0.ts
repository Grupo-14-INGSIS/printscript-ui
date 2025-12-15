// cypress/support/auth-provider-commands/auth0.ts

export function loginViaAuth0Ui(username: string, password: string) {
    // App landing page redirects to Auth0.
    cy.visit('/')

    // Login on Auth0.
    cy.origin(
        `https://${Cypress.env('VITE_AUTH0_DOMAIN')}`,
        { args: { username, password } },
        ({ username, password }) => {
            // Esperar a que el formulario esté visible
            cy.get('input#username').should('be.visible').type(username)
            cy.get('input#password').should('be.visible').type(password, { log: false })

            // Buscar el botón visible y hacer clic con force si es necesario
            cy.get('button[type="submit"]').contains('Continue').click({ force: true })

            // Alternativa: buscar cualquier botón Continue que sea visible
            // cy.contains('button', 'Continue').filter(':visible').click()
        }
    )

    // Ensure Auth0 has redirected us back to the app
    cy.url().should('equal', Cypress.env('VITE_FRONTEND_URL') + '/')
}