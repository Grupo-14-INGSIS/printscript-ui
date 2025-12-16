import { SnippetOperations } from "../snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, SnippetData, UpdateSnippet } from "../snippet.ts";
import { FileType } from "../../types/FileType.ts"; // Corrected path
import { StartExecutionResponse, ExecutionStatus } from "../../types/runner.ts"; // Corrected path
import { Rule } from "../../types/Rule.ts"; // Corrected path
import { FakeSnippetStore } from "./fakeSnippetStore.ts"; // Added import for FakeSnippetStore

export class FakeSnippetOperations implements SnippetOperations {
    constructor(private fakeStore: FakeSnippetStore) { // Changed 'any' to 'FakeSnippetStore'
    }

    // --- Rules ---
    getFormatRules(): Promise<Rule[]> {
        return Promise.resolve([]);
    }

    modifyFormatRule(_newRules: Rule[], _language?: string): Promise<void> {
        return Promise.resolve();
    }

    getLintingRules(): Promise<Rule[]> {
        return Promise.resolve([]);
    }

    modifyLintingRule(_newRules: Rule[], _language?: string): Promise<void> {
        return Promise.resolve();
    }

    // --- Snippets ---
    listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        return Promise.resolve(this.fakeStore.listSnippetDescriptors(page, pageSize, snippetName));
    }

    createSnippet(createSnippet: CreateSnippet): Promise<void> {
        this.fakeStore.createSnippet(createSnippet);
        return Promise.resolve();
    }

    deleteSnippet(id: string): Promise<string> {
        return Promise.resolve(id);
    }

    shareSnippet(snippetId: string, _userId: string): Promise<Snippet> {
        const foundSnippet = this.fakeStore.snippets.find((s: Snippet) => s.id === snippetId);
        if (foundSnippet) {
            return Promise.resolve(foundSnippet);
        }
        return Promise.resolve({
            id: snippetId,
            name: "Mock Shared Snippet",
            language: "printscript",
            author: "mockUser",
            content: "println('Mock shared snippet content');",
            extension: "ps",
            compliance: "pending"
        });
    }

    getFileTypes(): Promise<FileType[]> {
        return Promise.resolve([{ language: "printscript", extension: "prs", version: "1.1" }]);
    }

    getTestCases(_snippetId: string): Promise<string[]> {
        return Promise.resolve([]);
    }

    removeTestCase(id: string): Promise<string> {
        return Promise.resolve(id);
    }

    formatSnippet(snippet: string): Promise<string> {
        return Promise.resolve(snippet);
    }

    getSnippetData(id: string): Promise<SnippetData> {
        const snippet = this.fakeStore.getSnippetData(id);
        return Promise.resolve({ snippetId: snippet.id, name: snippet.name, language: snippet.language });
    }

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const snippet = this.fakeStore.getSnippetData(id);
        if (updateSnippet.content) {
            snippet.content = updateSnippet.content;
        }
        return Promise.resolve(snippet);
    }

    // --- Test & Execution ---
    startExecution(snippetId: string, environment: Record<string, string>, version: string): Promise<StartExecutionResponse> {
        return Promise.resolve(this.fakeStore.startExecution(snippetId, environment, version));
    }

    sendInput(snippetId: string, input: string): Promise<void> {
        this.fakeStore.sendInput(snippetId, input);
        return Promise.resolve();
    }

    cancelExecution(snippetId: string, userId: string): Promise<void> {
        this.fakeStore.cancelExecution(snippetId, userId);
        return Promise.resolve();
    }

    getExecutionStatus(snippetId: string, executionId: string): Promise<ExecutionStatus> {
        return Promise.resolve(this.fakeStore.getExecutionStatus(snippetId, executionId));
    }
}