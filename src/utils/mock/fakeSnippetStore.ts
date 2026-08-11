import {CreateSnippet, PaginatedSnippets, Snippet} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts"; // Corrected path
import {StartExecutionResponse, ExecutionStatus, ExecutionEventType} from "../../types/runner.ts"; // Corrected path
import {Rule} from "../../types/Rule.ts";

export class FakeSnippetStore {
    public snippets: Snippet[] = [
        {
            id: "1",
            name: "Calculadora Basica",
            language: "printscript",
            author: "user1@ing.com",
            content: "let a: number = 10;\nlet b: number = 20;\nlet total: number = a + b;\nprintln(\"El resultado de la suma es:\");\nprintln(total);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "2",
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
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "5",
            name: "Calculadora Financiera",
            language: "printscript",
            author: "user3@ing.com",
            content: "let capital: number = 10000;\nconst interes: number = 0.05;\nlet ganancia: number = capital * interes;\nprintln(\"Ganancia estimada de la inversion:\");\nprintln(ganancia);",
            extension: "ps",
            compliance: "failed"
        },
        {
            id: "6",
            name: "Hola Mundo",
            language: "printscript",
            author: "user1@ing.com",
            content: "let mensaje: string = \"Hola, bienvenido a PrintScript!\";\nprintln(mensaje);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "7",
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
            extension: "ps",
            compliance: "pending"
        },
        {
            id: "9",
            name: "Operaciones Matematicas",
            language: "printscript",
            author: "admin@ing.com",
            content: "let x: number = 15;\nlet y: number = 3;\nprintln(\"Multiplicacion:\");\nprintln(x * y);\nprintln(\"Division:\");\nprintln(x / y);",
            extension: "ps",
            compliance: "compliant"
        },
        {
            id: "10",
            name: "Sistema Notificaciones",
            language: "printscript",
            author: "user1@ing.com",
            content: "const canal: string = \"Email\";\nlet activo: boolean = true;\nif (activo) {\n    println(\"Enviando notificacion por canal:\");\n    println(canal);\n}",
            extension: "ps",
            compliance: "compliant"
        }
    ];

    listSnippetDescriptors(page: number = 0, pageSize: number = 10, snippetName?: string): PaginatedSnippets {
        let filteredSnippets = this.snippets;
        if (snippetName) {
            const query = snippetName.toLowerCase();
            filteredSnippets = this.snippets.filter(s => s.name.toLowerCase().includes(query));
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
