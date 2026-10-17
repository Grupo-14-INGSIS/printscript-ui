import {useCallback} from "react";
import {ExecutionEventType, ExecutionKind} from "../types/runner.ts";
import {useServices} from "../contexts/serviceContext.tsx";

const POLL_MS = 300;

/**
 * Output en vivo (US #9 y #10). El backend responde la ejecución (o el test) recién al terminar, pero
 * mientras corre guarda cada línea impresa y la expone en `GET .../executions/status?kind=`.
 *
 * `withLiveOutput(snippetId, kind, task, onLines)` corre `task` (el POST) y, mientras no termina,
 * consulta el progreso cada 300 ms y llama a `onLines` con las líneas impresas hasta ahora.
 * Solo se usan las respuestas con estado OUTPUT (ejecución en curso): así no se muestra por un
 * instante el resultado de una ejecución anterior. El resultado final lo sigue dando `task`.
 */
export const useLiveOutput = () => {
    const {apiService} = useServices();

    return useCallback(async <T, >(
        snippetId: string,
        kind: ExecutionKind,
        task: () => Promise<T>,
        onLines: (lines: string[]) => void,
    ): Promise<T> => {
        let active = true;
        const poll = async () => {
            while (active) {
                try {
                    const status = await apiService.getExecutionStatus(snippetId, '', kind);
                    if (active && status?.status === ExecutionEventType.OUTPUT && Array.isArray(status.message)) {
                        onLines(status.message);
                    }
                } catch {
                    // Es solo para mostrar el progreso: el resultado final llega igual en la respuesta de task
                }
                await new Promise(resolve => setTimeout(resolve, POLL_MS));
            }
        };
        void poll();
        try {
            return await task();
        } finally {
            active = false;
        }
    }, [apiService]);
};

/**
 * Une el output nuevo con el que ya se mostraba sin que "retroceda": la ejecución interactiva se
 * re-ejecuta con cada input (stateless) y al principio el backend tiene menos líneas que antes.
 */
export const mergeLines = (shown: string[], incoming: string[]): string[] =>
    incoming.length >= shown.length ? incoming : [...incoming, ...shown.slice(incoming.length)];
