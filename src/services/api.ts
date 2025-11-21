import { TestCase } from "../types/TestCase.ts";
import { Rule } from "../types/Rule.ts";
import { TestCaseResult } from "../utils/queries.tsx";
import { BACKEND_URL } from "../utils/constants.ts";


export class ApiSnippetOperations  {

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


    // --- Implementaciones para los endpoints adicionales de SnippetRunnerController ---

    // GET /api/v1/execution/{executionId}/status
    getExecutionStatus(executionId: string): Promise<never> {
        return this.request<never>(`/api/v1/execution/${executionId}/status`);
    }

    // POST /api/v1/execution/{executionId}/input
    postExecutionInput(executionId: string, input: never): Promise<never> {
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