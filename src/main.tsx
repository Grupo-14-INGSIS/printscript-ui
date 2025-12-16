import React, { useEffect } from 'react';
import App from './App.tsx'
import './index.css'
import {createRoot} from "react-dom/client";
import {PaginationProvider} from "./contexts/paginationContext.tsx";
import {SnackbarProvider} from "./contexts/snackbarContext.tsx";
import {Auth0Provider, useAuth0} from "@auth0/auth0-react";
import { ServiceProvider, useServices } from "./contexts/serviceContext.tsx";

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth0();
    const { runnerService } = useServices();
    useEffect(() => {
        const registerUserOnAuth = async () => {
            if (isAuthenticated && user?.sub) {
                try {
                    console.log('Registering user:', user.sub);
                    await runnerService.registerUser(user.sub);
                    console.log('User registered successfully');
                } catch (error) {
                    // We can ignore 409 conflict, it just means the user already exists.
                    if (!(error instanceof Error) || !error.message.includes("409")) {
                        console.error('Error registering user:', error);
                    }
                }
            }
        };
        registerUserOnAuth();
    }, [isAuthenticated, user, runnerService]);
    return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN ?? ""}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID ?? ""}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: "openid profile email read:snippets write:snippets delete:snippets",
                connection: import.meta.env.VITE_AUTH0_REALM
            }}
            cacheLocation="localstorage"
        >
            <ServiceProvider>
                <AuthWrapper>
                    <PaginationProvider>
                        <SnackbarProvider>
                            <App/>
                        </SnackbarProvider>
                   </PaginationProvider>
                </AuthWrapper>
            </ServiceProvider>
        </Auth0Provider>
    </React.StrictMode>,
)