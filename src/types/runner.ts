export interface ExecutionRequest {
    userId: string;
    environment: Record<string, string>;
    version: string;
}

export interface ExecutionResponse {
    status: 'STARTED' | 'ERROR';
    message: string;
}

export interface InputRequest {
    userId: string;
    input?: string;
}

export interface CancelExecutionRequest {
    userId: string;
}
