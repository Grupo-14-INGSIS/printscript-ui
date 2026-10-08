import {CreateSnippet, PaginatedSnippets, Snippet, SnippetFilters} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts"; // Corrected path
import {StartExecutionResponse, ExecutionStatus, ExecutionEventType} from "../../types/runner.ts"; // Corrected path
import {Rule} from "../../types/Rule.ts";
import {TestCase, CreateTestCase, TestCaseResult} from "../../types/TestCase.ts";

export class FakeSnippetStore {
    public snippets: Snippet[] = [
        {
            id: "1",
<<<<<<< HEAD
            name: "Hello World",
            language: "printscript",
            author: "alice",
            content: "println(\"Hello, World!\");",
=======
            name: "Calculadora Basica",
            language: "printscript",
            author: "user1@ing.com",
            content: "let a: number = 10;\nlet b: number = 20;\nlet total: number = a + b;\nprintln(\"El resultado de la suma es:\");\nprintln(total);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "2",
<<<<<<< HEAD
            name: "Fibonacci Sequence",
            language: "printscript",
            author: "bob",
            content: "let a: number = 0;\nlet b: number = 1;\nprintln(a);\nprintln(b);",
=======
            name: "Calculadora Avanzada",
            language: "printscript",
            author: "user2@ing.com",
            content: "const base: number = 100;\nconst rate: number = 1.21;\nlet total: number = base * rate;\nif (total > 100) {\n    println(\"Monto supera el limite base\");\n} else {\n    println(\"Monto dentro del rango\");\n}",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "3",
            name: "Calculadora Descuento",
            language: "printscript",
            author: "user1@ing.com",
            content: "let precio: number = 500;\nlet descuento: number = 50;\nlet precioFinal: number = precio - descuento;\nprintln(\"Precio final con descuento:\");\nprintln(precioFinal);",
            extension: "ps",
            compliance: "not-compliant"
        },
        {
            id: "4",
            name: "Calculadora Impuestos",
            language: "printscript",
            author: "admin@ing.com",
            content: "const ingreso: number = 1500;\nlet impuesto: number = 0;\nif (ingreso > 1000) {\n    impuesto = ingreso * 0.15;\n} else {\n    impuesto = ingreso * 0.05;\n}\nprintln(\"Impuesto calculado:\");\nprintln(impuesto);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "pending"
        },
        {
<<<<<<< HEAD
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
=======
            id: "5",
            name: "Calculadora Financiera",
            language: "printscript",
            author: "user3@ing.com",
            content: "let capital: number = 10000;\nconst interes: number = 0.05;\nlet ganancia: number = capital * interes;\nprintln(\"Ganancia estimada de la inversion:\");\nprintln(ganancia);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "failed"
        },
        {
            id: "6",
<<<<<<< HEAD
            name: "Math Functions Demo",
            language: "printscript",
            author: "bob",
            content: "let pi: number = 3.14159;\nlet r: number = 5;\nlet area: number = pi * r * r;\nprintln(area);",
=======
            name: "Hola Mundo",
            language: "printscript",
            author: "user1@ing.com",
            content: "let mensaje: string = \"Hola, bienvenido a PrintScript!\";\nprintln(mensaje);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "7",
<<<<<<< HEAD
            name: "PrintScript 1.1 Features",
            language: "printscript",
            author: "eva",
            content: "const version: string = \"1.1\";\nprintln(version);",
=======
            name: "Validacion Edad",
            language: "printscript",
            author: "user2@ing.com",
            content: "let edad: number = 20;\nif (edad >= 18) {\n    println(\"Usuario es mayor de edad\");\n} else {\n    println(\"Usuario es menor de edad\");\n}",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "8",
            name: "Format Cadena",
            language: "printscript",
            author: "user3@ing.com",
            content: "let nombre: string = \"Juan\";\nlet apellido: string = \"Perez\";\nprintln(\"Nombre completo:\");\nprintln(nombre);\nprintln(apellido);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "pending"
        },
        {
<<<<<<< HEAD
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
=======
            id: "9",
            name: "Operaciones Matematicas",
            language: "printscript",
            author: "admin@ing.com",
            content: "let x: number = 15;\nlet y: number = 3;\nprintln(\"Multiplicacion:\");\nprintln(x * y);\nprintln(\"Division:\");\nprintln(x / y);",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "10",
<<<<<<< HEAD
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
=======
            name: "Sistema Notificaciones",
            language: "printscript",
            author: "user1@ing.com",
            content: "const canal: string = \"Email\";\nlet activo: boolean = true;\nif (activo) {\n    println(\"Enviando notificacion por canal:\");\n    println(canal);\n}",
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
            extension: "ps",
            compliance: "compliant"
        }
    ];

<<<<<<< HEAD
    listSnippetDescriptors(page: number = 0, pageSize: number = 10, filters?: SnippetFilters): PaginatedSnippets {
        let filteredSnippets = [...this.snippets];
        if (filters?.name && filters.name.trim() !== "") {
            const term = filters.name.trim().toLowerCase();
            filteredSnippets = filteredSnippets.filter(s => s.name.toLowerCase().includes(term));
=======
    listSnippetDescriptors(page: number = 0, pageSize: number = 10, snippetName?: string): PaginatedSnippets {
        let filteredSnippets = this.snippets;
        if (snippetName) {
            const query = snippetName.toLowerCase();
            filteredSnippets = this.snippets.filter(s => s.name.toLowerCase().includes(query));
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
        }
        if (filters?.authorRelation && filters.authorRelation !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.author.toLowerCase() === filters.authorRelation?.toLowerCase());
        }
        if (filters?.language && filters.language !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.language.toLowerCase() === filters.language?.toLowerCase());
        }
        if (filters?.compliance && filters.compliance !== 'all') {
            filteredSnippets = filteredSnippets.filter(s => s.compliance === filters.compliance);
        }

        if (filters?.sortBy) {
            const sortBy = filters.sortBy;
            const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
            filteredSnippets.sort((a, b) => {
                const valA = (a[sortBy] || '').toString().toLowerCase();
                const valB = (b[sortBy] || '').toString().toLowerCase();
                return valA.localeCompare(valB) * sortOrder;
            });
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

    // Tests mock storage
    public tests: Record<string, TestCase[]> = {};

    getTests(snippetId: string): TestCase[] {
        return this.tests[snippetId] || [];
    }

    createTest(snippetId: string, testCase: CreateTestCase): string {
        const testId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        if (!this.tests[snippetId]) {
            this.tests[snippetId] = [];
        }
        this.tests[snippetId].push({
            id: testId,
            name: testCase.name || `Test ${this.tests[snippetId].length + 1}`,
            snippetId,
            input: testCase.input,
            output: testCase.expected,
            expected: testCase.expected,
            version: testCase.version || '1.0',
            environment: testCase.environment || {},
        });
        return testId;
    }

    deleteTest(snippetId: string, testId: string): void {
        if (this.tests[snippetId]) {
            this.tests[snippetId] = this.tests[snippetId].filter(t => t.id !== testId);
        }
    }

    runTest(snippetId: string, testId: string): TestCaseResult {
        const test = (this.tests[snippetId] || []).find(t => t.id === testId);
        if (!test) {
            return {
                actual: [],
                result: 'ERROR',
                message: 'Test not found',
            };
        }
        return {
            actual: test.expected || test.output || [],
            result: 'SUCCESS',
            message: 'Test executed successfully',
        };
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
