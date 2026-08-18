import {CreateSnippet, PaginatedSnippets, Snippet} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts"; // Corrected path
import {StartExecutionResponse, ExecutionStatus, ExecutionEventType} from "../../types/runner.ts"; // Corrected path
import {Rule} from "../../types/Rule.ts";

export class FakeSnippetStore {
    public snippets: Snippet[] = [
        {
            id: "1",
            name: "Hello World",
            language: "printscript",
            author: "alice",
            content: "println(\"Hello, World!\");",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "2",
            name: "Fibonacci Sequence",
            language: "printscript",
            author: "bob",
            content: "let a: number = 0;\nlet b: number = 1;\nprintln(a);\nprintln(b);",
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "3",
            name: "Basic Calculator",
            language: "printscript",
            author: "charlie",
            content: "let x: number = 10;\nlet y: number = 20;\nlet sum: number = x + y;\nprintln(sum);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "4",
            name: "String Concatenation",
            language: "printscript",
            author: "alice",
            content: "let greeting: string = \"Hello\";\nlet name: string = \"INGSIS\";\nprintln(greeting + \" \" + name);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "5",
            name: "Bubble Sort Algorithm",
            language: "printscript",
            author: "david",
            content: "println(\"Sorting elements...\");",
            extension: "ps",
            compliance: "failed"
        },
        {
            id: "6",
            name: "Math Functions Demo",
            language: "printscript",
            author: "bob",
            content: "let pi: number = 3.14159;\nlet r: number = 5;\nlet area: number = pi * r * r;\nprintln(area);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "7",
            name: "PrintScript 1.1 Features",
            language: "printscript",
            author: "eva",
            content: "const version: string = \"1.1\";\nprintln(version);",
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "8",
            name: "Even or Odd Checker",
            language: "printscript",
            author: "charlie",
            content: "let n: number = 7;\nif (n % 2 == 0) {\n  println(\"even\");\n} else {\n  println(\"odd\");\n}",
            extension: "ps",
            compliance: "not-compliant"
        },
        {
            id: "9",
            name: "Variable Scope Demo",
            language: "printscript",
            author: "alice",
            content: "let outer: string = \"global scope\";\nprintln(outer);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "10",
            name: "Binary Search Tree",
            language: "printscript",
            author: "david",
            content: "println(\"BST structure initialized\");",
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "11",
            name: "JSON Parser Helper",
            language: "printscript",
            author: "eva",
            content: "println(\"Parsing JSON config\");",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "12",
            name: "Custom Logger Utility",
            language: "printscript",
            author: "frank",
            content: "println(\"[LOG] Application started successfully\");",
            extension: "ps",
            compliance: "compliant"
        }
    ];

    listSnippetDescriptors(page: number = 0, pageSize: number = 10, snippetName?: string): PaginatedSnippets {
        let filteredSnippets = this.snippets;
        if (snippetName && snippetName.trim() !== "") {
            const term = snippetName.trim().toLowerCase();
            filteredSnippets = this.snippets.filter(s => s.name.toLowerCase().includes(term));
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
            id: createSnippet.id || String(Date.now()),
            author: "mockUser", // Mock author
            content: createSnippet.content || "", // Initial content
            extension: createSnippet.extension || "ps", // Default extension
            compliance: "pending", // Default compliance
        };
        this.snippets.push(newSnippet);
        return newSnippet;
    }

    deleteSnippet(id: string): string {
        this.snippets = this.snippets.filter(s => s.id !== id);
        return id;
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
