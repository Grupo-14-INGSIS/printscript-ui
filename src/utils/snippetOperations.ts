import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
<<<<<<< HEAD
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData, SnippetFilters} from "./snippet.ts";
import { StartExecutionResponse, ExecutionStatus, SharedUser } from "../types/runner.ts";
import { TestCase, CreateTestCase, TestCaseResult } from "../types/TestCase.ts";
import { User } from "./users.ts";
=======
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData} from "./snippet.ts";
import { StartExecutionResponse, ExecutionStatus, SharedUser } from "../types/runner.ts"; // Import new types
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c

export interface SnippetOperations {
    getFormatRules(): Promise<Rule[]>

    getLintingRules(): Promise<Rule[]>

    getFileTypes(): Promise<FileType[]>

    modifyFormatRule(newRules: Rule[], language?: string, applyToSnippets?: boolean): Promise<void>

    modifyLintingRule(newRules: Rule[], language?: string, applyToSnippets?: boolean): Promise<void>

    registerUser(email: string): Promise<void>

    createSnippet(createSnippet: CreateSnippet, userId?: string): Promise<void>

    // --- Test Cases ---
    getTestCases(snippetId: string): Promise<TestCase[]>

    createTestCase(snippetId: string, testCase: CreateTestCase): Promise<{ testId: string }>

    removeTestCase(snippetIdOrTestId: string, testId?: string): Promise<string>

    deleteTestCase(snippetId: string, testId: string): Promise<void>

    runTestCase(snippetId: string, testId: string): Promise<TestCaseResult>

    formatSnippet(snippet: string): Promise<string>

    lintSnippet(snippet: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    getSnippetData(id: string): Promise<SnippetData>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    getSharedUsers(snippetId: string): Promise<SharedUser[]>

<<<<<<< HEAD
    getUsers(name?: string): Promise<User[]>

    listSnippetDescriptors(page: number,pageSize: number,filters?: SnippetFilters): Promise<PaginatedSnippets>
=======
    listSnippetDescriptors(page: number,pageSize: number,sippetName?: string): Promise<PaginatedSnippets>
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c

    // --- Execution Methods ---
    startExecution(snippetId: string, environment: Record<string, string>, version: string, inputs?: string[]): Promise<StartExecutionResponse>
    sendInput(snippetId: string, input: string): Promise<void>
    cancelExecution(snippetId: string, userId: string): Promise<void>
    getExecutionStatus(snippetId: string, executionId: string): Promise<ExecutionStatus>

}
