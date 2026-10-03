export function loginViaAuth0Ui(username: string, password: string) {
    const auth0Domain = Cypress.env('VITE_AUTH0_DOMAIN') || 'dev-65tlgyzfpbzeka8a.us.auth0.com';
    const clientId = Cypress.env('VITE_AUTH0_CLIENT_ID') || 'pDaLfxwVAerUnhjKfJNfxLfduUPJQi3x';
    const audience = Cypress.env('VITE_AUTH0_AUDIENCE') || 'https://api.snippets.com';
    const realm = Cypress.env('VITE_AUTH0_REALM') || 'User-Pass-Auth';
    const requestScopes = 'openid profile email read:snippets write:snippets delete:snippets';

    // Programmatically obtain tokens via Auth0's Resource Owner Password grant.
    cy.request({
        method: 'POST',
        url: `https://${auth0Domain}/oauth/token`,
        body: {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            username,
            password,
            audience,
            scope: requestScopes,
            client_id: clientId,
            realm,
        },
    }).then(({ body }) => {
        const { access_token, id_token, expires_in, token_type } = body;

        // Decode JWT payload (base64url → base64 → JSON)
        const payloadBase64 = id_token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const claims = JSON.parse(atob(payloadBase64));

        const decodedToken = {
            claims,
            user: claims,
            _raw: id_token,
        };

        const entries: Record<string, string> = {};

        // 1. User cache key
        entries[`@@auth0spajs@@::${clientId}::@@user@@`] = JSON.stringify({
            id_token,
            decodedToken,
        });

        // 2. Token entries for all potential scope / audience combinations
        // Note: Auth0Client adds 'offline_access' to its scope when useRefreshTokens: true
        const scopesToStore = [
            requestScopes,
            `${requestScopes} offline_access`,
            'openid profile email',
            'openid profile email offline_access',
        ];

        const audiencesToStore = [audience, 'default'];

        for (const sc of scopesToStore) {
            for (const aud of audiencesToStore) {
                const key = `@@auth0spajs@@::${clientId}::${aud}::${sc}`;
                entries[key] = JSON.stringify({
                    body: {
                        client_id: clientId,
                        access_token,
                        id_token,
                        scope: sc,
                        expires_in: expires_in || 86400,
                        token_type: token_type || 'Bearer',
                        refresh_token: 'cypress_dummy_refresh_token',
                        decodedToken,
                        audience: aud,
                    },
                    expiresAt: Math.floor(Date.now() / 1000) + (expires_in || 86400),
                });
            }
        }

        // Store in Cypress.env for window:before:load to inject into localStorage
        Cypress.env('__AUTH0_ENTRIES__', entries);

        // Guard cookie
        cy.setCookie(`auth0.${clientId}.is.authenticated`, 'true');
        cy.setCookie(`_legacy_auth0.${clientId}.is.authenticated`, 'true');
    });
}
