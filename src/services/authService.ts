interface LoginCredentials {
    username: string;
    password: string;
}

interface AuthTokens {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
    token_type: string;
}

class AuthService {
    private readonly domain = import.meta.env.VITE_AUTH0_DOMAIN;
    private readonly clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    private readonly audience = import.meta.env.VITE_AUTH0_AUDIENCE;
    private readonly realm = import.meta.env.VITE_AUTH0_REALM || 'User-Pass-Auth';
    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'auth_user';

    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const params = {
            grant_type: 'password',
            username: credentials.username,
            password: credentials.password,
            audience: this.audience,
            scope: 'openid profile email read:snippets write:snippets delete:snippets',
            client_id: this.clientId,
            realm: this.realm,
        };

        console.log('Login params:', params);

        const response = await fetch(`https://${this.domain}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(params),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Login failed');
        }

        const tokens: AuthTokens = await response.json();
        localStorage.setItem(this.tokenKey, JSON.stringify(tokens));
        await this.fetchUserInfo(tokens.access_token);

        return tokens;
    }

    async fetchUserInfo(accessToken: string) {
        const response = await fetch(`https://${this.domain}/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return user;
        }
        return null;
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    getAccessToken(): string | null {
        const tokens = localStorage.getItem(this.tokenKey);
        if (!tokens) return null;

        try {
            const parsed: AuthTokens = JSON.parse(tokens);
            return parsed.access_token;
        } catch {
            return null;
        }
    }

    getUser() {
        const user = localStorage.getItem(this.userKey);
        if (!user) return null;

        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    async refreshToken(): Promise<AuthTokens | null> {
        const tokens = localStorage.getItem(this.tokenKey);
        if (!tokens) return null;

        try {
            const parsed: AuthTokens = JSON.parse(tokens);
            if (!parsed.refresh_token) return null;

            const response = await fetch(`https://${this.domain}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: this.clientId,
                    refresh_token: parsed.refresh_token,
                }),
            });

            if (!response.ok) return null;

            const newTokens: AuthTokens = await response.json();
            localStorage.setItem(this.tokenKey, JSON.stringify(newTokens));
            return newTokens;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }
    }
}

export const authService = new AuthService();