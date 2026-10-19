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

/** run = ejecución interactiva, test = corrida de un test (cada una tiene su propio output en vivo). */
export type ExecutionKind = 'run' | 'test';

/** US #13: original = como lo escribió el usuario, formatted = con las reglas de formateo del dueño. */
export type DownloadVariant = 'original' | 'formatted';

export interface SharedUser {
    id: string;
    email: string;
}

