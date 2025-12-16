import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth0, GetTokenSilentlyOptions } from '@auth0/auth0-react';
import { ApiSnippetOperations } from '../services/api';
import { RunnerService } from '../services/runnerService';

interface ServiceContextType {
    apiService: ApiSnippetOperations;
    runnerService: RunnerService;
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

    // We need to bind the 'this' context to the getAccessTokenSilently function
    const getAccessToken = useCallback((options?: GetTokenSilentlyOptions) => getAccessTokenSilently(options), [getAccessTokenSilently]);

    const services = useMemo(() => {
        return {
            apiService: new ApiSnippetOperations(getAccessToken),
            runnerService: new RunnerService(getAccessToken),
        };
    }, [getAccessToken]);

    return (
        <ServiceContext.Provider value={services}>
            {children}
        </ServiceContext.Provider>
    );
};
