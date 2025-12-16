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

export interface GetSnippetResponse {
    name: string;
    content: string;
}

export enum ExecutionEventType {
    STARTED = "STARTED",
    OUTPUT = "OUTPUT",
    WAITING = "WAITING",
    COMPLETED = "COMPLETED",
    ERROR = "ERROR",
}

export interface StartExecutionResponse {
    status: ExecutionEventType;
    message: string[];
}

// For now, ExecutionStatus can be identical to StartExecutionResponse
export interface ExecutionStatus {
    status: ExecutionEventType;
    message: string[];
}

