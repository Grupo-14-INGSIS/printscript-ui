import {Box, OutlinedInput, CircularProgress, Typography} from "@mui/material";
import {highlight, languages} from "prismjs";
import Editor from "react-simple-code-editor";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {useEffect, useState} from "react";
import { ExecutionEventType, ExecutionStatus } from '../types/runner.ts';


type SnippetExecutionProps = {
    snippetId: string;
    executionId: string | null;
    executionStatus?: ExecutionStatus;
    /** Se llama cuando el usuario ingresa un valor para un `readInput` pendiente. */
    onSendInput?: (input: string) => Promise<void>;
    isSendingInput?: boolean;
}

export const SnippetExecution = ({ executionId, executionStatus, onSendInput, isSendingInput = false }: SnippetExecutionProps) => {
  const [input, setInput] = useState<string>("");
  const [outputLines, setOutputLines] = useState<string[]>([]);

  useEffect(() => {
    if (executionStatus && executionStatus.message) {
      setOutputLines(executionStatus.message);
    } else {
      setOutputLines([]);
    }
  }, [executionStatus]);

  const handleEnter = async (event: { key: string }) => {
    if (event.key === 'Enter' && input.trim() !== '' && executionStatus?.status === ExecutionEventType.WAITING) {
        if (executionId && onSendInput) {
            try {
                await onSendInput(input);
                setInput("");
            } catch (err) {
                console.error("Error sending input:", err);
            }
        }
    }
  };

    const currentOutput = outputLines.join("\n");

    return (
      <>
        <Bòx flex={1} overflow={"none"} minHeight={200} bgcolor={'black'} color={'white'} code={currentOutput}>
            {isSendingInput ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <Editor
                  value={currentOutput}
                  padding={10}
                  onValueChange={() => {}} // No-op for read-only editor
                  highlight={(code) => highlight(code, languages.js, 'javascript')}
                  readOnly // Output editor is read-only
                  style={{
                      fontFamily: "monospace",
                      fontSize: 17,
                  }}
                />
            )}
        </Bòx>
        {executionStatus?.status === ExecutionEventType.WAITING && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                The snippet is waiting for input (readInput). Type a value and press Enter.
              </Typography>
              <OutlinedInput
                  onKeyDown={handleEnter}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your input here and press Enter"
                  fullWidth
                  autoFocus
                  disabled={isSendingInput}
              />
            </>
        )}
        {(executionStatus?.status === ExecutionEventType.COMPLETED || executionStatus?.status === ExecutionEventType.ERROR) && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Execution {executionStatus.status === ExecutionEventType.COMPLETED ? 'finished' : 'failed'}.
            </Typography>
        )}
      </>
    )
}
