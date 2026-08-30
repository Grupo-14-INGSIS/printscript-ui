import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData, SnippetFilters} from "./snippet.ts";
import { StartExecutionResponse, ExecutionStatus, SharedUser } from "../types/runner.ts";
import { TestCase, CreateTestCase, TestCaseResult } from "../types/TestCase.ts";

export interface SnippetOperations {
    getFormatRules(): Promise<Rule[]>

    getLintingRules(): Promise<Rule[]>

    getFileTypes(): Promise<FileType[]>

    modifyFormatRule(newRules: Rule[], language?: string): Promise<void>

    modifyLintingRule(newRules: Rule[], language?: string): Promise<void>

    registerUser(email: string): Promise<void>

    createSnippet(createSnippet: CreateSnippet, userId?: string): Promise<void>

    // --- Test Cases ---
    getTestCases(snippetId: string): Promise<TestCase[]>

    createTestCase(snippetId: string, testCase: CreateTestCase): Promise<{ testId: string }>

    removeTestCase(snippetIdOrTestId: string, testId?: string): Promise<string>

    deleteTestCase(snippetId: string, testId: string): Promise<void>

    runTestCase(snippetId: string, testId: string): Promise<TestCaseResult>

    formatSnippet(snippet: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    getSnippetData(id: string): Promise<SnippetData>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    getSharedUsers(snippetId: string): Promise<SharedUser[]>

    listSnippetDescriptors(page: number,pageSize: number,filters?: SnippetFilters): Promise<PaginatedSnippets>

    // --- Execution Methods ---
    startExecution(snippetId: string, environment: Record<string, string>, version: string): Promise<StartExecutionResponse>
    sendInput(snippetId: string, input: string): Promise<void>
    cancelExecution(snippetId: string, userId: string): Promise<void>
    getExecutionStatus(snippetId: string, executionId: string): Promise<ExecutionStatus>

}
