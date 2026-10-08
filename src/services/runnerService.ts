import { RUNNER_URL } from "../utils/constants";
import { CancelExecutionRequest, ExecutionRequest, ExecutionResponse, InputRequest } from "../types/runner";
import { GetTokenSilentlyOptions } from "@auth0/auth0-react";
import { CreateSnippet } from "../utils/snippet.ts";

export class RunnerService {
    private readonly baseUrl = RUNNER_URL;

    constructor(private getAccessToken: (options?: GetTokenSilentlyOptions) => Promise<string>) {}

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = await this.getAccessToken({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }
        });

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Request-Id': (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
            ...(token && {'Authorization': `Bearer ${token}`}),
        };

        const config: RequestInit = {
            ...options,
            headers,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorBody = await response.text();
            let parsedMessage = errorBody;
            try {
                const json = JSON.parse(errorBody);
                parsedMessage = json.message || json.error || errorBody;
            } catch {
                parsedMessage = errorBody;
            }
            throw new Error(parsedMessage || `HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) return {} as T;
        try {
            return JSON.parse(text);
        } catch {
            return text as unknown as T;
        }
    }

    async createSnippet(snippet: CreateSnippet, userId?: string): Promise<void> {
        const { id, content, name, language } = snippet;
        await this.request<void>(`/api/v1/snippets/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                userId: userId || 'default_user',
                name: name || 'Snippet',
                language: language || 'printscript',
                snippet: content,
            }),
        });
    }

    async getSnippetContent(snippetId: string): Promise<string> {
<<<<<<< HEAD
        const res = await this.request<unknown>(`/api/v1/snippets/${snippetId}`);
=======
        const res = await this.request<any>(`/api/v1/snippet/snippets/${snippetId}`);
>>>>>>> c676902a7b21abbc9c31c86623ee89726df9e40c
        if (typeof res === 'object' && res !== null && 'content' in res) {
            return res.content;
        }
        if (typeof res === 'string') {
            return res;
        }
        return '';
    }

    startSnippetExecution(snippetId: string, data: ExecutionRequest): Promise<ExecutionResponse> {
        return this.request<ExecutionResponse>(`/api/v1/snippets/${snippetId}/executions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    sendInput(snippetId: string, data: InputRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/executions/input`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    cancelExecution(snippetId: string, data: CancelExecutionRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/executions`, {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

    async registerUser(userId: string): Promise<void> {
        try {
            await this.request<void>(`/api/v1/users/${userId}`, {
                method: 'PUT',
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes('409') || message.includes('already exists')) {
                return;
            }
            throw err;
        }
    }

    /**
     * Actualiza el contenido del snippet. Se envía el JWT para que el Runner corra
     * automáticamente los tests del snippet (User Story #16) y devuelva el resultado.
     */
    async updateSnippetContent(id: string, content: string, version?: string): Promise<string> {
        let jwt: string | null = null;
        try {
            jwt = await this.getAccessToken({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            });
        } catch {
            jwt = null;
        }
        const result = await this.request<unknown>(`/api/v1/snippets/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                snippet: content,
                jwt,
                ...(version ? { version } : {}),
            }),
        });
        return typeof result === 'string' ? result : '';
    }
}