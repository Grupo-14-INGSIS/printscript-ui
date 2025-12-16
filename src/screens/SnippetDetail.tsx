import {useEffect, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetContent, useStartExecution, useCancelExecution, useGetExecutionStatus
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById, useLintSnippet} from "../utils/queries.tsx"; // Added useLintSnippet
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, PlayArrow, StopRounded, FormatAlignLeft, Troubleshoot} from "@mui/icons-material"; // Added FormatAlignLeft, Troubleshoot
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {Snippet} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import {queryClient} from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import { useAuth0 } from '@auth0/auth0-react';
import { LintingError, SnippetLintResponse } from '../types/runner.ts'; // Added LintingError, SnippetLintResponse


type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
}

const DownloadButton = ({snippet}: { snippet?: Snippet }) => {
  if (!snippet) return null;
  const file = new Blob([snippet.content], {type: 'text/plain'});

  return (
    <Tooltip title={"Download"}>
      <IconButton sx={{
        cursor: "pointer"
      }}>
        <a download={`${snippet.name}.ps`} target="_blank"
           rel="noreferrer" href={URL.createObjectURL(file)} style={{
          textDecoration: "none",
          color: "inherit",
          display: 'flex',
          alignItems: 'center',
        }}>
          <Download/>
        </a>
      </IconButton>
    </Tooltip>
  )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
  const {id, handleCloseModal} = props;
  const { user } = useAuth0();
  const [code, setCode] = useState(
      ""
  );
  const [shareModalOppened, setShareModalOppened] = useState(false)
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false)
  const [testModalOpened, setTestModalOpened] = useState(false);
  const [runSnippet, setRunSnippet] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [lintingErrors, setLintingErrors] = useState<LintingError[]>([]); // New state for linting errors


  const {data: snippet, isLoading} = useGetSnippetById(id);
  const {mutate: formatSnippet, isLoading: isFormatLoading} = useFormatSnippet({
    onSuccess: (formattedCode) => {
      setCode(formattedCode);
      setLintingErrors([]); // Clear linting errors on format
    }
  })
  const {mutate: lintSnippet, isLoading: isLintLoading} = useLintSnippet({
    onSuccess: (lintResult: SnippetLintResponse) => {
      setLintingErrors(lintResult.errors);
    }
  })
  const {mutate: updateSnippetContent, isLoading: isUpdateSnippetLoading} = useUpdateSnippetContent({onSuccess: () => queryClient.invalidateQueries(['snippet', id])})
  const {mutateAsync: startExecution, isLoading: isStartingExecution} = useStartExecution({
    onSuccess: () => {
        // TODO: Backend does not return executionId, using snippetId as a workaround for now.
        setExecutionId(id); 
        setRunSnippet(true);
    }
  });
  const {mutateAsync: cancelExecution, isLoading: isCancellingExecution} = useCancelExecution({
    onSuccess: () => {
        setExecutionId(null);
        setRunSnippet(false);
    }
  });

  const {data: executionStatus} = useGetExecutionStatus(id, executionId || '');

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content);
    }
  }, [snippet]);

  const handleRunToggle = async () => {
    if (runSnippet && executionId) { // If running, cancel
        await cancelExecution({snippetId: id, userId: user?.sub || ''}); // Using snippetId for cancel, assuming it's required
    } else { // If not running, start
        if (snippet) {
            await startExecution({
                snippetId: id,
                environment: {}, // Default empty environment
                version: "1.1", // Default version
            });
        }
    }
  };

  const handleFormat = () => {
    if (snippet) {
      formatSnippet({ snippetId: id, version: snippet.language === '1.0' ? '1.0' : '1.1' });
    }
  };

  const handleLint = () => {
    if (snippet) {
      lintSnippet({ snippetId: id, version: snippet.language === '1.0' ? '1.0' : '1.1' });
    }
  };

  return (
      <Box p={4} minWidth={'60vw'}>
        <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
          <CloseIcon style={{cursor: "pointer"}} onClick={handleCloseModal}/>
        </Box>
        {
          isLoading ? (<>
            <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
            <CircularProgress/>
          </>) : <>
            <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
            <Box display="flex" flexDirection="row" gap="8px" padding="8px">
              <Tooltip title={"Share"}>
                <IconButton onClick={() => setShareModalOppened(true)}>
                  <Share/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Test"}>
                <IconButton onClick={() => setTestModalOpened(true)}>
                  <BugReport/>
                </IconButton>
              </Tooltip>
              <DownloadButton snippet={snippet}/>
              <Tooltip title={runSnippet ? "Stop run" : "Run"}>
                <IconButton onClick={handleRunToggle} disabled={isStartingExecution || isCancellingExecution || !snippet}>
                  {runSnippet ? <StopRounded/> : <PlayArrow/>}
                </IconButton>
              </Tooltip>
              <Tooltip title={"Format"}>
                <IconButton onClick={handleFormat} disabled={isFormatLoading || !snippet}>
                  <FormatAlignLeft /> {/* Changed icon to FormatAlignLeft */}
                </IconButton>
              </Tooltip>
              <Tooltip title={"Lint"}>
                <IconButton onClick={handleLint} disabled={isLintLoading || !snippet}>
                  <Troubleshoot /> {/* New icon for Lint */}
                </IconButton>
              </Tooltip>
              <Tooltip title={"Save changes"}>
                <IconButton color={"primary"} onClick={() => updateSnippetContent({id: id, content: code})} disabled={isUpdateSnippetLoading || snippet?.content === code} >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                  <Delete color={"error"} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box display={"flex"} gap={2}>
              <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
                <Editor
                    value={code}
                    padding={10}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.js, "javascript")}
                    maxLength={1000}
                    style={{
                      minHeight: "500px",
                      fontFamily: "monospace",
                      fontSize: 17,
                    }}
                />
              </Bòx>
            </Box>
            {lintingErrors.length > 0 && (
              <Box pt={1} flex={1} marginTop={2}>
                <Alert severity="error">
                  <Typography variant="h6">Linting Errors:</Typography>
                  {lintingErrors.map((error, index) => (
                    <Typography key={index}>
                      Line {error.line}, Column {error.column}: {error.message}
                    </Typography>
                  ))}
                </Alert>
              </Box>
            )}
            <Box pt={1} flex={1} marginTop={2}>
              <Alert severity="info">Output</Alert>
              <SnippetExecution snippetId={id} executionId={executionId} executionStatus={executionStatus} />
            </Box>
          </>
        }
        <ShareSnippetModal open={shareModalOppened}
                           onClose={() => setShareModalOppened(false)}/>
        <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)}/>
        <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={id} setCloseDetails={handleCloseModal} />
      </Box>
  );
}


