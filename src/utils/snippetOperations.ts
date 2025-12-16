import {TestCase} from "../types/TestCase.ts";
import {TestCaseResult} from "./queries.tsx";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData, UpdateSnippet} from "./snippet.ts";

export interface SnippetOperations {
    getFormatRules(): Promise<Rule[]>

    getLintingRules(): Promise<Rule[]>

    getFileTypes(): Promise<FileType[]>

    postTestCase(testCase: Partial<TestCase>): Promise<TestCase>

    testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult>

    modifyFormatRule(newRules: Rule[], language?: string): Promise<void>

    modifyLintingRule(newRules: Rule[], language?: string): Promise<void>

    getExecutionStatus(executionId: string): Promise<never>

    postExecutionInput(executionId: string, input: never): Promise<never>

    deleteExecution(executionId: string): Promise<void>

    createSnippet(createSnippet: CreateSnippet): Promise<void>

    getTestCases(snippetId: string): Promise<string[]>

    removeTestCase(id: string): Promise<string>

    formatSnippet(snippet: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    getSnippetData(id: string): Promise<SnippetData>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet>

    listSnippetDescriptors(page: number,pageSize: number,sippetName?: string): Promise<PaginatedSnippets>

}
