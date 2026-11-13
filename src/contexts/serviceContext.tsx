import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth0, GetTokenSilentlyOptions } from '@auth0/auth0-react';
import { ApiSnippetOperations } from '../services/api';
import { SnippetOperations } from '../utils/snippetOperations';
import { FakeSnippetOperations } from '../utils/mock/fakeSnippetOperations';
import { FakeSnippetStore } from '../utils/mock/fakeSnippetStore';

// In-memory store singleton so state is shared and preserved in the session
const globalFakeStore = new FakeSnippetStore();

// Flag to toggle between mock services and backend services
const USE_MOCK_SERVICES = false;

interface ServiceContextType {
    apiService: SnippetOperations;
}

const ServiceContext = createContext<ServiceContextType | null>(null);

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getAccessTokenSilently } = useAuth0();

    const getAccessToken = useCallback((options?: GetTokenSilentlyOptions) => getAccessTokenSilently(options), [getAccessTokenSilently]);

    const services = useMemo(() => {
        if (USE_MOCK_SERVICES) {
            return { apiService: new FakeSnippetOperations(globalFakeStore) };
        }
        return { apiService: new ApiSnippetOperations(getAccessToken) };
    }, [getAccessToken]);

    return (
        <ServiceContext.Provider value={services}>
            {children}
        </ServiceContext.Provider>
    );
};
