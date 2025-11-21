import { SnippetOperations } from "../utils/snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../utils/snippet.ts";
import { PaginatedUsers } from "../utils/users.ts";
import { TestCase } from "../types/TestCase.ts";
import { Rule } from "../types/Rule.ts";
import { FileType } from "../types/FileType.ts";
import { TestCaseResult } from "../utils/queries.tsx";
import { BACKEND_URL } from "../utils/constants.ts";

export class ApiSnippetOperations implements SnippetOperations {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;
        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    }

    // --- Implementaciones según los endpoints proporcionados ---

    // FormatterJobController: /api/v1/formatting/rules
    getFormatRules(): Promise<Rule[]> {
        return this.request<Rule[]>('/api/v1/formatting/rules');
    }

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        return this.request<Rule[]>('/api/v1/formatting/rules', {
            method: 'POST',
            body: JSON.stringify(newRules),
        });
    }

    // LintingJobController: /api/v1/linting/rules
    getLintingRules(): Promise<Rule[]> {
        return this.request<Rule[]>('/api/v1/linting/rules');
    }

    modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        return this.request<Rule[]>('/api/v1/linting/rules', {
            method: 'POST',
            body: JSON.stringify(newRules),
        });
    }
    
    // SnippetRunnerController: /api/v1/execution/run (POST)
    testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        return this.request<TestCaseResult>('/api/v1/execution/run', {
            method: 'POST',
            body: JSON.stringify(testCase),
        });
    }

    // TestingJobController: /api/v1/testing (POST)
    postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        return this.request<TestCase>('/api/v1/testing', {
            method: 'POST',
            body: JSON.stringify(testCase),
        });
    }

    // --- Métodos de la interfaz SnippetOperations que no tienen endpoint proporcionado ---
    // Si necesitas usar estos métodos, deberás proporcionar los endpoints correspondientes
    // y adaptar la interfaz o crear nuevos métodos.

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        throw new Error("Method 'listSnippetDescriptors' not implemented: No endpoint provided.");
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        throw new Error("Method 'createSnippet' not implemented: No endpoint provided.");
    }
    
    async getSnippetById(id: string): Promise<Snippet | undefined> {
        throw new Error("Method 'getSnippetById' not implemented: No endpoint provided.");
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        throw new Error("Method 'updateSnippetById' not implemented: No endpoint provided.");
    }

    async deleteSnippet(id: string): Promise<string> {
        throw new Error("Method 'deleteSnippet' not implemented: No endpoint provided.");
    }

    async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
        throw new Error("Method 'getUserFriends' not implemented: No endpoint provided.");
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        throw new Error("Method 'shareSnippet' not implemented: No endpoint provided.");
    }

    async getTestCases(): Promise<TestCase[]> {
        throw new Error("Method 'getTestCases' not implemented: No endpoint provided.");
    }

    async formatSnippet(snippet: string): Promise<string> {
        throw new Error("Method 'formatSnippet' not implemented: No endpoint provided.");
    }

    async removeTestCase(id: string): Promise<string> {
        throw new Error("Method 'removeTestCase' not implemented: No endpoint provided.");
    }

    async getFileTypes(): Promise<FileType[]> {
        throw new Error("Method 'getFileTypes' not implemented: No endpoint provided.");
    }

    // --- Implementaciones para los endpoints adicionales de SnippetRunnerController ---

    // GET /api/v1/execution/{executionId}/status
    getExecutionStatus(executionId: string): Promise<any> {
        return this.request<never>(`/api/v1/execution/${executionId}/status`);
    }

    // POST /api/v1/execution/{executionId}/input
    postExecutionInput(executionId: string, input: any): Promise<any> {
        return this.request<never>(`/api/v1/execution/${executionId}/input`, {
            method: 'POST',
            body: JSON.stringify(input),
        });
    }

    // DELETE /api/v1/execution/{executionId}
    deleteExecution(executionId: string): Promise<void> {
        return this.request<void>(`/api/v1/execution/${executionId}`, {
            method: 'DELETE',
        });
    }
}