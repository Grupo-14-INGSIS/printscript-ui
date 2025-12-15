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
                scope: "read:snippets write:snippets delete:snippets",
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
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    }

    private async requestText(endpoint: string, options?: RequestInit): Promise<string> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = await this.getAccessToken({
            authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: "read:snippets write:snippets delete:snippets",
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
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        return response.text();
    }

    createSnippet(snippet: CreateSnippet, userId: string): Promise<void> {
        const { id, name, language, content } = snippet;
        const body = {
            userId: userId,
            name: name,
            language: language,
            snippet: content, // In the Runner DTO, the content is called 'snippet'
        };
        return this.request<void>(`/api/v1/snippet/snippets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    getSnippetContent(snippetId: string): Promise<string> {
        return this.requestText(`/api/v1/snippet/snippets/${snippetId}`);
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
}
