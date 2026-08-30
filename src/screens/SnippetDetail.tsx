import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography, Select, MenuItem, FormControl, InputLabel, Tab, Tabs} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetContent, useStartExecution, useCancelExecution, useGetExecutionStatus, useGetTestCases
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, PlayArrow, StopRounded, UploadFile, Terminal} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {SnippetTestManager} from "../components/snippet-test/SnippetTestManager.tsx";
import {Snippet} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import { StartExecutionResponse } from "../types/runner.ts";
import { useSnackbarContext } from "../contexts/snackbarContext.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import { useAuth0 } from '@auth0/auth0-react';


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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState(
      ""
  );
  const [version, setVersion] = useState<string>("1.0");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [shareModalOppened, setShareModalOppened] = useState(false)
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false)
  const [testModalOpened, setTestModalOpened] = useState(false);
  const [bottomTab, setBottomTab] = useState<number>(0);
  const [runSnippet, setRunSnippet] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<StartExecutionResponse | null>(null);
  const {createSnackbar} = useSnackbarContext();

  const {data: snippet, isLoading} = useGetSnippetById(id);
  const {data: testCases} = useGetTestCases(id);
  const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet()
  const {mutateAsync: updateSnippetContent, isLoading: isUpdateSnippetLoading} = useUpdateSnippetContent({
    onSuccess: () => {
      queryClient.invalidateQueries(['snippet', id]);
      createSnackbar('success', 'Snippet updated successfully');
      setUpdateError(null);
    }
  });
  const {mutateAsync: startExecution, isLoading: isStartingExecution} = useStartExecution({
    onSuccess: (data) => {
        setExecutionResult(data);
        setExecutionId(id); 
        setRunSnippet(false);
    }
  });
  const {mutateAsync: cancelExecution, isLoading: isCancellingExecution} = useCancelExecution({
    onSuccess: () => {
        setExecutionId(null);
        setExecutionResult(null);
        setRunSnippet(false);
    }
  });

  const {data: executionStatus} = useGetExecutionStatus(id, executionId || '');

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content);
      setUpdateError(null);
      // Auto-detect 1.1 if code contains 1.1 syntax
      if (snippet.content.includes("const ") || snippet.content.includes("if ") || snippet.content.includes("readInput") || snippet.content.includes("readEnv")) {
        setVersion("1.1");
      }
    }
  }, [snippet]);

  useEffect(() => {
    if (formatSnippetData) {
      setCode(formatSnippetData);
      setUpdateError(null);
    }
  }, [formatSnippetData])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setCode(content);
      setUpdateError(null);
      createSnackbar('info', `Loaded content from ${file.name}`);
    } catch (err) {
      console.error("Error reading file:", err);
      createSnackbar('error', 'Failed to read file content');
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveSnippet = async () => {
    setUpdateError(null);
    try {
      await updateSnippetContent({id: id, content: code});
    } catch (err: unknown) {
      console.error("Error saving snippet:", err);
      const message = err instanceof Error ? err.message : 'Failed to update snippet';
      setUpdateError(message);
      createSnackbar('error', message);
    }
  };

  const handleRunToggle = async () => {
    if (runSnippet && executionId) { // If running, cancel
        await cancelExecution({snippetId: id, userId: user?.sub || ''});
    } else { // If not running, start
        try {
            if (snippet && snippet.content !== code) {
                await handleSaveSnippet();
            }
            const detectedVersion = (code.includes("const ") || code.includes("if ") || code.includes("readInput") || code.includes("readEnv")) ? "1.1" : version;
            const res = await startExecution({
                snippetId: id,
                environment: {}, // Default empty environment
                version: detectedVersion,
            });
            setExecutionResult(res);
        } catch (err: unknown) {
            console.error("Execution error:", err);
            const message = err instanceof Error ? err.message : 'Execution failed';
            createSnackbar('error', message);
        }
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
            <Box display="flex" flexDirection="row" gap="8px" padding="8px" alignItems="center">
              <Tooltip title={"Share"}>
                <IconButton onClick={() => setShareModalOppened(true)}>
                  <Share/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Tests"}>
                <IconButton onClick={() => {
                  setBottomTab(1);
                  setTestModalOpened(true);
                }}>
                  <BugReport/>
                </IconButton>
              </Tooltip>
              <DownloadButton snippet={snippet}/>
              <Tooltip title={"Upload file"}>
                <IconButton onClick={() => fileInputRef.current?.click()}>
                  <UploadFile />
                </IconButton>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".ps"
                onChange={handleFileUpload}
              />
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <InputLabel id="version-select-label">Version</InputLabel>
                <Select
                  labelId="version-select-label"
                  value={version}
                  label="Version"
                  onChange={(e) => setVersion(e.target.value)}
                  size="small"
                >
                  <MenuItem value="1.0">1.0</MenuItem>
                  <MenuItem value="1.1">1.1</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title={runSnippet ? "Stop run" : "Run"}>
                <IconButton onClick={handleRunToggle} disabled={isStartingExecution || isCancellingExecution || !snippet}>
                  {runSnippet ? <StopRounded/> : <PlayArrow/>}
                </IconButton>
              </Tooltip>
              {/* TODO: we can implement a live mode*/}
              <Tooltip title={"Format"}>
                <IconButton onClick={() => formatSnippet(code)} disabled={isFormatLoading}>
                  <ReadMoreIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Save changes"}>
                <IconButton color={"primary"} onClick={handleSaveSnippet} disabled={isUpdateSnippetLoading || snippet?.content === code} >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                  <Delete color={"error"} />
                </IconButton>
              </Tooltip>
            </Box>
            {updateError && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-wrap', my: 1.5 }}>
                {updateError}
              </Alert>
            )}
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
            <Box pt={2} flex={1} marginTop={2}>
              <Tabs
                value={bottomTab}
                onChange={(_, val) => setBottomTab(val)}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
              >
                <Tab label="Output" icon={<Terminal fontSize="small" />} iconPosition="start" />
                <Tab
                  label={`Tests ${testCases && testCases.length > 0 ? `(${testCases.length})` : ''}`}
                  icon={<BugReport fontSize="small" />}
                  iconPosition="start"
                />
              </Tabs>

              {bottomTab === 0 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 1 }}>Output</Alert>
                  <SnippetExecution snippetId={id} executionId={executionId} executionStatus={executionResult || executionStatus} />
                </Box>
              )}

              {bottomTab === 1 && (
                <Box bgcolor="white" p={2} borderRadius={2} border="1px solid #e0e0e0">
                  <SnippetTestManager snippetId={id} snippetName={snippet?.name} version={version} />
                </Box>
              )}
            </Box>
          </>
        }
        <ShareSnippetModal open={shareModalOppened}
                           onClose={() => setShareModalOppened(false)}
                           snippetId={id}/>
        <TestSnippetModal
          open={testModalOpened}
          onClose={() => setTestModalOpened(false)}
          snippetId={id}
          snippetName={snippet?.name}
          version={version}
        />
        <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={id} setCloseDetails={handleCloseModal} />
      </Box>
  );
}


