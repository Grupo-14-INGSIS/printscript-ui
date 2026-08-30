import { Rule } from "../types/Rule.ts";
import { BACKEND_URL } from "../utils/constants.ts";
import { SnippetOperations } from "../utils/snippetOperations.ts";
import { ComplianceEnum, CreateSnippet, PaginatedSnippets, Snippet, SnippetData, SnippetFilters, UpdateSnippet } from "../utils/snippet.ts";
import { FileType } from "../types/FileType.ts";
import { GetTokenSilentlyOptions } from "@auth0/auth0-react";
import { StartExecutionResponse, ExecutionStatus, CancelExecutionRequest, SharedUser } from '../types/runner.ts';
import { TestCase, CreateTestCase, TestCaseResult } from '../types/TestCase.ts';
import { formatPrintScriptCode } from "../utils/formatter.ts";

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

    registerUser(email: string): Promise<void> {
        return this.request<void>('/api/v1/users', {
            method: 'PUT',
            body: JSON.stringify({ email })
        });
    }

    async listSnippetDescriptors(page: number, pageSize: number, filters?: SnippetFilters): Promise<PaginatedSnippets> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (filters?.name && filters.name.trim() !== '') {
            params.append('name', filters.name.trim());
        }
        if (filters?.authorRelation && filters.authorRelation !== 'all') {
            params.append('relation', filters.authorRelation);
        }
        if (filters?.language && filters.language !== 'all') {
            params.append('language', filters.language);
        }
        if (filters?.compliance && filters.compliance !== 'all') {
            params.append('compliance', filters.compliance);
        }
        if (filters?.sortBy) {
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', filters.sortOrder ?? 'asc');
        }
        
        const snippetsMap = await this.request<Record<string, { name: string; language: string; permission?: string; author?: string; compliance?: ComplianceEnum; status?: string }>>(`/api/v1/snippets?${params.toString()}`);

        const snippetsArray: Snippet[] = Object.entries(snippetsMap).map(([id, details]) => ({
            id: id,
            name: details.name,
            language: details.language,
            author: details.author || details.permission || '', // Support permission or author
            content: '', // This endpoint does not provide content
            extension: '', // This endpoint does not provide extension
            compliance: (details.compliance || details.status || 'pending') as ComplianceEnum,
        }));

        let filteredSnippets = snippetsArray;
        if (filters?.name && filters.name.trim() !== "") {
            const term = filters.name.trim().toLowerCase();
            filteredSnippets = filteredSnippets.filter(s => s.name.toLowerCase().includes(term));
        }
        if (filters?.authorRelation && filters.authorRelation !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.author.toLowerCase() === filters.authorRelation?.toLowerCase());
        }
        if (filters?.language && filters.language !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.language.toLowerCase() === filters.language?.toLowerCase());
        }
        if (filters?.compliance && filters.compliance !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.compliance === filters.compliance);
        }

        if (filters?.sortBy) {
            const sortBy = filters.sortBy;
            const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
            filteredSnippets.sort((a, b) => {
                const valA = (a[sortBy] || '').toString().toLowerCase();
                const valB = (b[sortBy] || '').toString().toLowerCase();
                return valA.localeCompare(valB) * sortOrder;
            });
        }

        const start = page * pageSize;
        const end = start + pageSize;
        const pagedSnippets = filteredSnippets.slice(start, end);

        return {
            page: page,
            page_size: pageSize,
            count: filteredSnippets.length,
            snippets: pagedSnippets,
        };
    }
    
    createSnippet(createSnippet: CreateSnippet, userId?: string): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${createSnippet.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                userId: userId ?? '',
                name: createSnippet.name,
                language: createSnippet.language,
            }),
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

    getSharedUsers(snippetId: string): Promise<SharedUser[]> {
        return this.request<SharedUser[]>(`/api/v1/snippets/${snippetId}/permission`);
    }

    // Métodos no implementados (placeholders)
    getFileTypes(): Promise<FileType[]> {
        return Promise.resolve([{ language: "printscript", extension: "ps", version: "1.1" }]);
    }
    async getTestCases(snippetId: string): Promise<TestCase[]> {
        const testsMap = await this.request<Record<string, {
            testId: string;
            snippetId: string;
            input?: string[];
            output?: string[];
            version?: string;
            environment?: Record<string, string>;
            name?: string;
        }>>(`/api/v1/snippets/${snippetId}/tests`);

        return Object.entries(testsMap || {}).map(([id, test]) => ({
            id: test.testId || id,
            name: test.name || `Test ${id.substring(0, 8)}`,
            snippetId: test.snippetId || snippetId,
            input: test.input || [],
            output: test.output || [],
            expected: test.output || [],
            version: test.version || '1.0',
            environment: test.environment || {},
        }));
    }

    createTestCase(snippetId: string, testCase: CreateTestCase): Promise<{ testId: string }> {
        return this.request<{ testId: string }>(`/api/v1/snippets/${snippetId}/tests`, {
            method: 'POST',
            body: JSON.stringify({
                input: testCase.input,
                expected: testCase.expected,
                version: testCase.version || '1.0',
                environment: testCase.environment || {},
            }),
        });
    }

    async removeTestCase(snippetIdOrTestId: string, testId?: string): Promise<string> {
        if (testId) {
            await this.deleteTestCase(snippetIdOrTestId, testId);
            return testId;
        }
        await this.request<void>(`/api/v1/tests/${snippetIdOrTestId}`, {
            method: 'DELETE',
        });
        return snippetIdOrTestId;
    }

    deleteTestCase(snippetId: string, testId: string): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/tests/${testId}`, {
            method: 'DELETE',
        });
    }

    runTestCase(snippetId: string, testId: string): Promise<TestCaseResult> {
        return this.request<TestCaseResult>(`/api/v1/snippets/${snippetId}/tests/${testId}`, {
            method: 'PUT',
        });
    }
    async formatSnippet(snippet: string): Promise<string> {
        try {
            const rules = await this.getFormatRules("printscript");
            return formatPrintScriptCode(snippet, rules);
        } catch (_error) {
            return formatPrintScriptCode(snippet, []);
        }
    }
    getSnippetData(id: string): Promise<SnippetData> {
        return this.request<SnippetData>(`/api/v1/snippets/${id}`);
    }
    updateSnippetById(_id: string, _updateSnippet: UpdateSnippet): Promise<Snippet> {
        throw new Error("Method not implemented.");
    }
    
    // --- Test & Execution ---
    async startExecution(snippetId: string, environment: Record<string, string>, version: string): Promise<StartExecutionResponse> {
        return this.request<StartExecutionResponse>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'POST',
            body: JSON.stringify({ environment, version }),
        });
    }

    sendInput(snippetId: string, input: string): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution/input`, {
            method: 'POST',
            body: JSON.stringify({ input }),
        });
    }

    cancelExecution(snippetId: string, userId: string): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'DELETE',
            body: JSON.stringify({ userId } as CancelExecutionRequest),
        });
    }

    getExecutionStatus(snippetId: string, _executionId: string): Promise<ExecutionStatus> {
        // The App's endpoint is /api/v1/snippets/{snippetId}/run/status
        return this.request<ExecutionStatus>(`/api/v1/snippets/${snippetId}/run/status`);
    }
}