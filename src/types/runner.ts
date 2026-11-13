export interface CancelExecutionRequest {
    userId: string;
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

