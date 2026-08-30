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
        await this.request<void>(`/api/v1/snippet/snippets/${id}`, {
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
        const res = await this.request<unknown>(`/api/v1/snippet/snippets/${snippetId}`);
        if (typeof res === 'object' && res !== null && 'content' in res) {
            return (res as { content: string }).content;
        }
        if (typeof res === 'string') {
            return res;
        }
        return '';
    }

    startSnippetExecution(snippetId: string, data: ExecutionRequest): Promise<ExecutionResponse> {
        return this.request<ExecutionResponse>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    sendInput(snippetId: string, data: InputRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution/input`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    cancelExecution(snippetId: string, data: CancelExecutionRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

    registerUser(userId: string): Promise<void> {
        return this.request<void>(`/api/v1/users/${userId}`, {
            method: 'PUT',
        });
    }

    async updateSnippetContent(id: string, content: string): Promise<void> {
        await this.request<void>(`/api/v1/snippet/snippets/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                snippet: content,
            }),
        });
    }
}
