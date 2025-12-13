import {TestCase} from "../types/TestCase.ts";
import {TestCaseResult} from "./queries.tsx";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "./snippet.ts";
import {PaginatedUsers} from "./users.ts";

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

    getUserFriends(name?: string,page?: number,pageSize?: number): Promise<PaginatedUsers>

    createSnippet(createSnippet: CreateSnippet): Promise<Snippet>

    getTestCases(): Promise<TestCase[]>

    removeTestCase(id: string): Promise<string>

    formatSnippet(snippet: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    getSnippetById(id: string): Promise<Snippet | undefined>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet>

    listSnippetDescriptors(page: number,pageSize: number,sippetName?: string): Promise<PaginatedSnippets>

}
