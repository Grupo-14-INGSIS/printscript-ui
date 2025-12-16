import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData} from "./snippet.ts";
import { StartExecutionResponse, ExecutionStatus } from "../types/runner.ts"; // Import new types

export interface SnippetOperations {
    getFormatRules(): Promise<Rule[]>

    getLintingRules(): Promise<Rule[]>

    getFileTypes(): Promise<FileType[]>

    modifyFormatRule(newRules: Rule[], language?: string): Promise<void>

    modifyLintingRule(newRules: Rule[], language?: string): Promise<void>

    createSnippet(createSnippet: CreateSnippet): Promise<void>

    getTestCases(snippetId: string): Promise<string[]>

    removeTestCase(id: string): Promise<string>

    formatSnippet(snippet: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    getSnippetData(id: string): Promise<SnippetData>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    listSnippetDescriptors(page: number,pageSize: number,sippetName?: string): Promise<PaginatedSnippets>

    // --- Execution Methods ---
    startExecution(snippetId: string, environment: Record<string, string>, version: string): Promise<StartExecutionResponse>
    sendInput(snippetId: string, input: string): Promise<void>
    cancelExecution(snippetId: string, userId: string): Promise<void>
    getExecutionStatus(snippetId: string, executionId: string): Promise<ExecutionStatus>

}
