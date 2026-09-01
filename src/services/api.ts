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
            let parsedMessage = errorBody;
            try {
                const json = JSON.parse(errorBody);
                parsedMessage = json.message || json.error || errorBody;
            } catch {
                parsedMessage = errorBody;
            }
            throw new Error(parsedMessage || `HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) return {} as T;
        try {
            return JSON.parse(text);
        } catch {
            return text as unknown as T;
        }
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
        const response = await this.request<unknown>(`/api/v1/snippets/${snippetId}/tests`);

        if (!response) {
            return [];
        }

        const mapItem = (test: Record<string, unknown>, idFallback: string, index: number): TestCase => {
            const id = test.id ?? test.testId ?? test._id ?? idFallback;
            const rawInput = test.input ?? test.inputs ?? test.inputArguments ?? [];
            const rawOutput = test.output ?? test.outputs ?? test.expected ?? test.expectedOutputs ?? test.expectedOutput ?? [];
            
            const toArray = (val: unknown): string[] => {
                if (Array.isArray(val)) {
                    return val.map((item) => String(item));
                }
                if (val !== undefined && val !== null) {
                    return [String(val)];
                }
                return [];
            };

            const input = toArray(rawInput);
            const output = toArray(rawOutput);
            const name = test.name ?? test.testName ?? test.description ?? `Test #${index + 1}`;
            const env = (test.environment ?? test.env ?? {}) as Record<string, string>;

            return {
                id: String(id),
                name: String(name),
                snippetId: typeof test.snippetId === 'string' ? test.snippetId : snippetId,
                input: input,
                output: output,
                expected: output,
                version: typeof test.version === 'string' ? test.version : '1.0',
                environment: typeof env === 'object' && env !== null ? env : {},
            };
        };

        if (Array.isArray(response)) {
            return response.map((test, idx) => mapItem(test as Record<string, unknown>, `test-${idx + 1}`, idx));
        }

        if (typeof response === 'object' && response !== null) {
            const obj = response as Record<string, unknown>;
            const list = obj.tests ?? obj.testCases ?? obj.content ?? obj.data;
            if (Array.isArray(list)) {
                return list.map((test, idx) => mapItem(test as Record<string, unknown>, `test-${idx + 1}`, idx));
            }

            return Object.entries(obj).map(([key, value], idx) => {
                const testObj = (value && typeof value === 'object') ? (value as Record<string, unknown>) : { name: key };
                return mapItem(testObj, key, idx);
            });
        }

        return [];
    }

    createTestCase(snippetId: string, testCase: CreateTestCase): Promise<{ testId: string }> {
        return this.request<{ testId: string }>(`/api/v1/snippets/${snippetId}/tests`, {
            method: 'POST',
            body: JSON.stringify({
                name: testCase.name || 'Test',
                testName: testCase.name || 'Test',
                input: testCase.input || [],
                inputs: testCase.input || [],
                output: testCase.expected || [],
                outputs: testCase.expected || [],
                expected: testCase.expected || [],
                expectedOutputs: testCase.expected || [],
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

    async runTestCase(snippetId: string, testId: string): Promise<TestCaseResult> {
        const res = await this.request<unknown>(`/api/v1/snippets/${snippetId}/tests/${testId}`, {
            method: 'PUT',
        });

        if (typeof res === 'string') {
            const upper = res.toUpperCase();
            const result = (upper.includes('SUCCESS') || upper.includes('PASS')) ? 'SUCCESS' : (upper.includes('FAIL') ? 'FAILED' : 'ERROR');
            return {
                actual: [],
                result: result as 'SUCCESS' | 'FAILED' | 'ERROR',
                message: res,
            };
        }

        if (typeof res === 'object' && res !== null) {
            const obj = res as Record<string, unknown>;
            let resultStatus: 'SUCCESS' | 'FAILED' | 'ERROR' = 'ERROR';
            const rawStatus = String(obj.result ?? obj.status ?? (obj.success === true ? 'SUCCESS' : obj.success === false ? 'FAILED' : 'SUCCESS')).toUpperCase();
            if (rawStatus.includes('SUCCESS') || rawStatus.includes('PASS')) {
                resultStatus = 'SUCCESS';
            } else if (rawStatus.includes('FAIL')) {
                resultStatus = 'FAILED';
            }

            const actual = obj.actual ?? obj.actualOutput ?? obj.outputs ?? obj.output ?? [];
            const actualList = Array.isArray(actual)
                ? actual.map((item) => String(item))
                : (actual !== undefined && actual !== null ? [String(actual)] : []);

            const message = typeof obj.message === 'string'
                ? obj.message
                : (typeof obj.error === 'string' ? obj.error : '');

            return {
                actual: actualList,
                result: resultStatus,
                message: message,
            };
        }

        return {
            actual: [],
            result: 'SUCCESS',
            message: 'Test executed successfully',
        };
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