import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth0, GetTokenSilentlyOptions } from '@auth0/auth0-react';
import { ApiSnippetOperations } from '../services/api';
import { RunnerService } from '../services/runnerService';
import { SnippetOperations } from '../utils/snippetOperations';
import { FakeSnippetOperations } from '../utils/mock/fakeSnippetOperations';
import { FakeSnippetStore } from '../utils/mock/fakeSnippetStore';
import { CreateSnippet } from '../utils/snippet';

export class FakeRunnerService {
    constructor(private fakeStore: FakeSnippetStore) {}

    async createSnippet(snippet: CreateSnippet, _userId?: string): Promise<void> {
        this.fakeStore.createSnippet(snippet);
    }

    async getSnippetContent(snippetId: string): Promise<string> {
        const s = this.fakeStore.snippets.find(s => s.id === snippetId);
        return s ? s.content : '';
    }

    async updateSnippetContent(id: string, content: string): Promise<void> {
        const s = this.fakeStore.snippets.find(s => s.id === id);
        if (s) {
            s.content = content;
        }
    }

    async registerUser(_userId: string): Promise<void> {
        return Promise.resolve();
    }
}

// In-memory store singleton so state is shared and preserved in the session
const globalFakeStore = new FakeSnippetStore();

// Flag to toggle between mock services and backend services
const USE_MOCK_SERVICES = true;

interface ServiceContextType {
    apiService: SnippetOperations;
    runnerService: RunnerService | FakeRunnerService;
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
            return {
                apiService: new FakeSnippetOperations(globalFakeStore),
                runnerService: new FakeRunnerService(globalFakeStore) as unknown as RunnerService,
            };
        }

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
