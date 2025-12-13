import { Rule } from "../types/Rule.ts";
import { BACKEND_URL } from "../utils/constants.ts";
import { SnippetOperations } from "../utils/snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../utils/snippet.ts";
import { PaginatedUsers } from "../utils/users.ts";
import { FileType } from "../types/FileType.ts";
import { authService } from "./authService.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "../utils/queries.tsx";


export class ApiSnippetOperations implements SnippetOperations {

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;
        const token = authService.getAccessToken();

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

    getFormatRules(language = "printscript"): Promise<Rule[]> {
        return this.request<Rule[]>(`/api/v1/rules?task=formatting&language=${language}`);
    }

    modifyFormatRule(rules: Rule[], language = "printscript"): Promise<void> {
        const rulesMap = rules.reduce((acc, rule) => {
            acc[rule.name] = rule.value;
            return acc;
        }, {} as Record<string, any>);

        return this.request<void>('/api/v1/rules', {
            method: 'PUT',
            body: JSON.stringify({
                task: 'formatting',
                language,
                rules: rulesMap,
            }),
        });
    }

    getLintingRules(language = "printscript"): Promise<Rule[]> {
        return this.request<Rule[]>(`/api/v1/rules?task=linting&language=${language}`);
    }

    modifyLintingRule(rules: Rule[], language = "printscript"): Promise<void> {
        const rulesMap = rules.reduce((acc, rule) => {
            acc[rule.name] = rule.value;
            return acc;
        }, {} as Record<string, any>);

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

    listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (snippetName) {
            params.append('name', snippetName);
        }
        return this.request<PaginatedSnippets>(`/api/v1/snippets?${params.toString()}`);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserFriends(_name?: string, _page?: number, _pageSize?: number): Promise<PaginatedUsers> {
        throw new Error("Method not implemented.");
    }
    getTestCases(): Promise<TestCase[]> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeTestCase(_id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formatSnippet(_snippet: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getSnippetById(_id: string): Promise<Snippet | undefined> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSnippetById(_id: string, _updateSnippet: UpdateSnippet): Promise<Snippet> {
        throw new Error("Method not implemented.");
    }
    
    // --- Test & Execution ---
    
    testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        // This should be adapted to the app's endpoint, which might proxy to the runner
        throw new Error("Method not implemented.");
    }

    postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        // This should be adapted to the app's endpoint
        throw new Error("Method not implemented.");
    }

    getExecutionStatus(executionId: string): Promise<never> {
        throw new Error("Method not implemented.");
    }

    postExecutionInput(executionId: string, input: never): Promise<never> {
        throw new Error("Method not implemented.");
    }

    deleteExecution(executionId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}