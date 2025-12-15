import { Rule } from "../types/Rule.ts";
import { BACKEND_URL } from "../utils/constants.ts";
import { SnippetOperations } from "../utils/snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../utils/snippet.ts";
import { PaginatedUsers } from "../utils/users.ts";
import { FileType } from "../types/FileType.ts";
import { GetTokenSilentlyOptions } from "@auth0/auth0-react";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "../utils/queries.tsx";

export class ApiSnippetOperations implements SnippetOperations {

    constructor(private getAccessToken: (options?: GetTokenSilentlyOptions) => Promise<string>) {}

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;
        const token = await this.getAccessToken({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }
        });

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const defaultOptions: RequestInit = { headers };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    }

    // --- Rules ---

    async getFormatRules(language = "printscript"): Promise<Rule[]> {
        const rulesMap = await this.request<Record<string, string | number | boolean | null>>(`/api/v1/rules?task=formatting&language=${language}`);
        return Object.entries(rulesMap).map(([key, value]) => ({
            id: key,
            name: key,
            isActive: typeof value === 'boolean' ? value : true,
            value: typeof value === 'boolean' ? undefined : value,
        }));
    }

    modifyFormatRule(rules: Rule[], language = "printscript"): Promise<void> {
        const rulesMap = rules.reduce((acc, rule) => {
            if (rule.value === undefined || typeof rule.value === 'boolean') {
                acc[rule.name] = rule.isActive;
            } else {
                acc[rule.name] = rule.value;
            }
            return acc;
        }, {} as Record<string, string | number | boolean | null | undefined>);

        return this.request<void>('/api/v1/rules', {
            method: 'PUT',
            body: JSON.stringify({
                task: 'formatting',
                language,
                rules: rulesMap,
            }),
        });
    }

    async getLintingRules(language = "printscript"): Promise<Rule[]> {
        const rulesMap = await this.request<Record<string, string | number | boolean | null>>(`/api/v1/rules?task=linting&language=${language}`);
        return Object.entries(rulesMap).map(([key, value]) => ({
            id: key,
            name: key,
            isActive: typeof value === 'boolean' ? value : true,
            value: typeof value === 'boolean' ? undefined : value,
        }));
    }

    modifyLintingRule(rules: Rule[], language = "printscript"): Promise<void> {
        const rulesMap = rules.reduce((acc, rule) => {
            if (rule.value === undefined || typeof rule.value === 'boolean') {
                acc[rule.name] = rule.isActive;
            } else {
                acc[rule.name] = rule.value;
            }
            return acc;
        }, {} as Record<string, string | number | boolean | null | undefined>);

        return this.request<void>('/api/v1/rules', {
            method: 'PUT',
            body: JSON.stringify({
                task: 'linting',
                language,
                rules: rulesMap,
            }),
        });
    }
    
    // --- Snippets ---

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (snippetName) {
            params.append('name', snippetName);
        }
        
        const snippetsMap = await this.request<Record<string, { name: string; language: string; permission: string }>>(`/api/v1/snippets?${params.toString()}`);

        const snippetsArray: Snippet[] = Object.entries(snippetsMap).map(([id, details]) => ({
            id: id,
            name: details.name,
            language: details.language,
            author: details.permission, // Using role as author for now
            content: '', // This endpoint does not provide content
            extension: '', // This endpoint does not provide extension
            compliance: 'pending', // Default value
        }));

        return {
            page: 1, // The API doesn't return pagination data, so mocking it.
            page_size: snippetsArray.length,
            count: snippetsArray.length,
            snippets: snippetsArray,
        };
    }
    
    createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        return this.request<Snippet>(`/api/v1/snippets/${createSnippet.id}?language=${createSnippet.language}`, {
            method: 'PUT',
        });
    }

    deleteSnippet(id: string): Promise<string> {
        return this.request<string>(`/api/v1/snippets/${id}`, {
            method: 'DELETE',
        });
    }

    shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        return this.request<Snippet>(`/api/v1/snippets/${snippetId}/permission`, {
            method: 'PUT',
            body: JSON.stringify({ userId }),
        });
    }

    // Métodos no implementados (placeholders)
    getFileTypes(): Promise<FileType[]> {
        throw new Error("Method not implemented.");
    }
    getUserFriends(_name?: string, _page?: number, _pageSize?: number): Promise<PaginatedUsers> {
        throw new Error("Method not implemented.");
    }
    getTestCases(): Promise<TestCase[]> {
        throw new Error("Method not implemented.");
    }
    removeTestCase(_id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    formatSnippet(_snippet: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getSnippetById(_id: string): Promise<Snippet | undefined> {
        throw new Error("Method not implemented.");
    }
    updateSnippetById(_id: string, _updateSnippet: UpdateSnippet): Promise<Snippet> {
        throw new Error("Method not implemented.");
    }
    
    // --- Test & Execution ---
    
    testSnippet(_testCase: Partial<TestCase>): Promise<TestCaseResult> {
        // This should be adapted to the app's endpoint, which might proxy to the runner
        throw new Error("Method not implemented.");
    }

    postTestCase(_testCase: Partial<TestCase>): Promise<TestCase> {
        // This should be adapted to the app's endpoint
        throw new Error("Method not implemented.");
    }

    getExecutionStatus(_executionId: string): Promise<never> {
        throw new Error("Method not implemented.");
    }

    postExecutionInput(_executionId: string, _input: never): Promise<never> {
        throw new Error("Method not implemented.");
    }

    deleteExecution(_executionId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}