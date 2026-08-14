import {CreateSnippet, PaginatedSnippets, Snippet} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts"; // Corrected path
import {StartExecutionResponse, ExecutionStatus, ExecutionEventType} from "../../types/runner.ts"; // Corrected path
import {Rule} from "../../types/Rule.ts";

export class FakeSnippetStore {
    public snippets: Snippet[] = [
        {
            id: "1",
            name: "Test Snippet 1",
            language: "printscript",
            author: "user1",
            content: "println(\"Hello from Snippet 1\");",
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "2",
            name: "Test Snippet 2",
            language: "printscript",
            author: "user2",
            content: "println(\"Hello from Snippet 2\");",
            extension: "ps",
            compliance: "pending"
        },
    ];

    listSnippetDescriptors(page: number = 0, pageSize: number = 10, snippetName?: string): PaginatedSnippets {
        let filteredSnippets = this.snippets;
        if (snippetName) {
            filteredSnippets = this.snippets.filter(s => s.name.includes(snippetName));
        }
        const start = page * pageSize;
        const end = start + pageSize;
        const pagedSnippets = filteredSnippets.slice(start, end);

        return {
            page: page,
            page_size: pageSize,
            count: filteredSnippets.length,
            snippets: pagedSnippets
        };
    }

    createSnippet(createSnippet: CreateSnippet): Snippet {
        const newSnippet: Snippet = {
            ...createSnippet,
            author: "mockUser", // Mock author
            content: "", // Initial empty content
            extension: "ps", // Default extension
            compliance: "pending", // Default compliance
        };
        this.snippets.push(newSnippet);
        return newSnippet;
    }

    getSnippetData(id: string): Snippet {
        const snippet = this.snippets.find(s => s.id === id);
        if (!snippet) throw new Error("Snippet not found");
        return snippet;
    }

    // Placeholder for other SnippetOperations methods if needed by tests
    getFormatRules(): Rule[] { return []; }
    getLintingRules(): Rule[] { return []; }
    getFileTypes(): FileType[] { return [{ language: "printscript", extension: "ps", version: "1.1" }]; }
    modifyFormatRule(_newRules: Rule[]): void {} // Prefixed
    modifyLintingRule(_newRules: Rule[]): void {} // Prefixed
    removeTestCase(id: string): string { return id; }
    formatSnippet(snippet: string): string { return snippet; }
    deleteSnippet(id: string): string { return id; }
    shareSnippet(_snippetId: string, _userId: string): Snippet { return this.snippets[0]; } // Prefixed
    updateSnippetContent(_id: string, _content: string): void {}

    // Execution related mocks
    startExecution(
        _snippetId: string,
        _environment: Record<string, string>,
        _version: string
    ): StartExecutionResponse { // Prefixed
        return { status: ExecutionEventType.STARTED, message: ["Mock execution started"] };
    }
    sendInput(_snippetId: string, _input: string): void {} // Prefixed
    cancelExecution(_snippetId: string, _userId: string): void {} // Prefixed
    getExecutionStatus(_snippetId: string, _executionId: string): ExecutionStatus { // Prefixed
        return { status: ExecutionEventType.COMPLETED, message: ["Mock execution completed"] };
    }
}
