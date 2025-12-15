import { RUNNER_URL } from "../utils/constants";
import { authService } from "./authService";
import { CancelExecutionRequest, ExecutionRequest, ExecutionResponse, InputRequest } from "../types/runner";

class RunnerService {
    private readonly baseUrl = RUNNER_URL;

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = authService.getAccessToken();

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
        const token = authService.getAccessToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json', // Even for text response, keep this for consistency unless problematic
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

    async getSnippetContent(snippetId: string): Promise<string> {
        // Assuming "snippets" is the default container
        return this.requestText(`/api/v1/snippet/snippets/${snippetId}`);
    }

    async startSnippetExecution(snippetId: string, data: ExecutionRequest): Promise<ExecutionResponse> {
        return this.request<ExecutionResponse>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async sendInput(snippetId: string, data: InputRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution/input`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async cancelExecution(snippetId: string, data: CancelExecutionRequest): Promise<void> {
        return this.request<void>(`/api/v1/snippets/${snippetId}/execution`, {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }


    async registerUser(userId: string): Promise<void> {
        return this.request<void>(`/api/v1/users/${userId}`, {
            method: 'PUT',
        });
    }
}


export const runnerService = new RunnerService();
