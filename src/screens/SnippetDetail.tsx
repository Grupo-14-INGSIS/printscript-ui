import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography, Select, MenuItem, FormControl, InputLabel, Tab, Tabs, Switch, FormControlLabel, Chip, Menu, ListItemIcon, ListItemText, TextField} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetContent, useStartExecution, useCancelExecution, useGetExecutionStatus, useGetTestCases, useLintSnippet, useRunTestCase, useUpdateSnippetMetadata
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, PlayArrow, StopRounded, UploadFile, Terminal, FactCheck, Code} from "@mui/icons-material";
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

const DownloadButton = ({snippet, onFormatSnippet}: { snippet?: Snippet, onFormatSnippet?: (code: string) => Promise<string> }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formatting, setFormatting] = useState(false);

  if (!snippet) return null;

  const handleDownloadOriginal = () => {
    const file = new Blob([snippet.content], {type: 'text/plain'});
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.name}.ps`;
    a.click();
    URL.revokeObjectURL(url);
    setAnchorEl(null);
  };

  const handleDownloadFormatted = async () => {
    setFormatting(true);
    try {
      const formatted = onFormatSnippet ? await onFormatSnippet(snippet.content) : snippet.content;
      const file = new Blob([formatted], {type: 'text/plain'});
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${snippet.name}_formatted.ps`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to original if formatting fails
      handleDownloadOriginal();
    } finally {
      setFormatting(false);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <Tooltip title={"Download"}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} disabled={formatting}>
          {formatting ? <CircularProgress size={20} /> : <Download/>}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleDownloadOriginal}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Download Original</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadFormatted} disabled={formatting}>
          <ListItemIcon><Code fontSize="small" /></ListItemIcon>
          <ListItemText>Download Formatted</ListItemText>
        </MenuItem>
      </Menu>
    </>
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
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const {createSnackbar} = useSnackbarContext();

  const [autoFormat, setAutoFormat] = useState<boolean>(() => {
    const stored = localStorage.getItem("printscript_auto_format");
    return stored !== null ? stored === "true" : true;
  });
  const [autoLint, setAutoLint] = useState<boolean>(() => {
    const stored = localStorage.getItem("printscript_auto_lint");
    return stored !== null ? stored === "true" : true;
  });
  const [lintReport, setLintReport] = useState<string | null>(null);

  const handleToggleAutoFormat = (checked: boolean) => {
    setAutoFormat(checked);
    localStorage.setItem("printscript_auto_format", String(checked));
  };

  const handleToggleAutoLint = (checked: boolean) => {
    setAutoLint(checked);
    localStorage.setItem("printscript_auto_lint", String(checked));
  };

  const {data: snippet, isLoading} = useGetSnippetById(id);
  const {data: testCases} = useGetTestCases(id);
  const {mutateAsync: formatSnippetAsync, isLoading: isFormatLoading} = useFormatSnippet();
  const {mutateAsync: lintSnippetAsync, isLoading: isLintLoading} = useLintSnippet();
  const {mutateAsync: runTestCase} = useRunTestCase();
  const {mutateAsync: updateSnippetMetadata} = useUpdateSnippetMetadata({
    onSuccess: () => {
      queryClient.invalidateQueries(['snippet', id]);
      setEditingDescription(false);
    }
  });
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
        setRunSnippet(true);
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
    if (executionStatus?.status === 'COMPLETED' || executionStatus?.status === 'ERROR') {
      setRunSnippet(false);
    }
  }, [executionStatus]);

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content);
      setUpdateError(null);
      if (snippet.version) {
        setVersion(snippet.version);
      } else if (snippet.content.includes("const ") || snippet.content.includes("if ") || snippet.content.includes("readInput") || snippet.content.includes("readEnv")) {
        setVersion("1.1");
      }
    }
  }, [snippet]);

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

  const handleManualFormat = async () => {
    try {
      const formatted = await formatSnippetAsync(code);
      setCode(formatted);
      setUpdateError(null);
      createSnackbar('success', 'Snippet formatted successfully');
    } catch (err: unknown) {
      console.error("Format error:", err);
      const message = err instanceof Error ? err.message : 'Failed to format snippet';
      createSnackbar('error', message);
    }
  };

  const handleManualLint = async () => {
    try {
      const result = await lintSnippetAsync(code);
      if (!result || result.includes("SUCCESS") || result.includes("No issues were found")) {
        setLintReport(null);
        createSnackbar('success', 'Snippet passed linting with no issues!');
      } else {
        setLintReport(result);
        createSnackbar('warning', 'Linting issues detected');
      }
    } catch (err: unknown) {
      console.error("Lint error:", err);
      const message = err instanceof Error ? err.message : 'Failed to lint snippet';
      createSnackbar('error', message);
    }
  };

  const handleVersionChange = async (newVersion: string) => {
    setVersion(newVersion);
    try {
      await updateSnippetMetadata({ snippetId: id, metadata: { version: newVersion } });
      createSnackbar('info', `Version changed to ${newVersion}`);
    } catch (e) {
      console.error("Failed to update version:", e);
    }
  };

  const handleSaveSnippet = async () => {
    setUpdateError(null);
    try {
      let contentToSave = code;
      if (autoFormat) {
        try {
          contentToSave = await formatSnippetAsync(code);
          setCode(contentToSave);
        } catch (fErr) {
          console.warn("Auto-format failed, saving current content", fErr);
        }
      }
      await updateSnippetContent({id: id, content: contentToSave, version: version});
      if (snippet && snippet.version !== version) {
        await updateSnippetMetadata({ snippetId: id, metadata: { version: version } });
      }

      if (autoLint) {
        try {
          const result = await lintSnippetAsync(contentToSave);
          if (!result || result.includes("SUCCESS") || result.includes("No issues were found")) {
            setLintReport(null);
          } else {
            setLintReport(result);
            createSnackbar('warning', 'Auto-lint: issues detected');
          }
        } catch (lErr) {
          console.warn("Auto-lint failed", lErr);
        }
      }

      // US #16: Auto-run tests after saving
      if (testCases && testCases.length > 0) {
        let passed = 0;
        let failed = 0;
        let errored = 0;
        for (const tc of testCases) {
          try {
            const res = await runTestCase({snippetId: id, testId: tc.id});
            if (res.result === 'SUCCESS') passed++;
            else if (res.result === 'FAILED') failed++;
            else errored++;
          } catch {
            errored++;
          }
        }
        queryClient.invalidateQueries(['testCases', id]);
        const total = testCases.length;
        if (failed === 0 && errored === 0) {
          createSnackbar('success', `All ${total} test(s) passed`);
        } else {
          createSnackbar('warning', `Tests: ${passed}/${total} passed, ${failed} failed, ${errored} error(s)`);
        }
      }
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
            setBottomTab(0);
            if (snippet && snippet.content !== code) {
                await handleSaveSnippet();
            }
            const res = await startExecution({
                snippetId: id,
                environment: {}, // Default empty environment
                version: version,
            });
            setExecutionResult(res);
            setExecutionId(id);
            setRunSnippet(true);
        } catch (err: unknown) {
            console.error("Execution error:", err);
            const message = err instanceof Error ? err.message : 'Execution failed';
            createSnackbar('error', message);
            setRunSnippet(false);
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
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
              <Chip
                label={`v${version}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
              {snippet?.compliance && (
                <Chip
                  label={snippet.compliance.toUpperCase()}
                  color={snippet.compliance === 'compliant' ? 'success' : snippet.compliance === 'not-compliant' ? 'error' : snippet.compliance === 'failed' ? 'error' : 'warning'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
            {editingDescription ? (
              <TextField
                size="small"
                autoFocus
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={() => updateSnippetMetadata({ snippetId: id, metadata: { description: descriptionDraft } })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateSnippetMetadata({ snippetId: id, metadata: { description: descriptionDraft } });
                  if (e.key === 'Escape') setEditingDescription(false);
                }}
                placeholder="Add a description..."
                fullWidth
                sx={{ mb: 1 }}
                helperText="Press Enter to save, Escape to cancel"
              />
            ) : (
              <Typography
                variant="body2"
                color={snippet?.description ? "text.secondary" : "text.disabled"}
                mb={1}
                sx={{ fontStyle: snippet?.description ? 'italic' : 'normal', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => { setDescriptionDraft(snippet?.description ?? ""); setEditingDescription(true); }}
              >
                {snippet?.description || "Click to add a description..."}
              </Typography>
            )}
            <Box display="flex" flexDirection="row" gap="8px" padding="8px" alignItems="center" flexWrap="wrap">
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
              <DownloadButton snippet={snippet} onFormatSnippet={formatSnippetAsync}/>
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
                  onChange={(e) => handleVersionChange(e.target.value)}
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
              {/* Manual format */}
              <Tooltip title={"Format"}>
                <IconButton onClick={handleManualFormat} disabled={isFormatLoading}>
                  <ReadMoreIcon />
                </IconButton>
              </Tooltip>
              {/* Manual lint */}
              <Tooltip title={"Lint"}>
                <IconButton onClick={handleManualLint} disabled={isLintLoading}>
                  <FactCheck />
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

              <Box sx={{ borderLeft: '1px solid #ccc', height: 28, mx: 1 }} />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={autoFormat}
                    onChange={(e) => handleToggleAutoFormat(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2" sx={{ userSelect: 'none' }}>Auto-format</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={autoLint}
                    onChange={(e) => handleToggleAutoLint(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2" sx={{ userSelect: 'none' }}>Auto-lint</Typography>}
              />
            </Box>
            {updateError && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-wrap', my: 1.5 }}>
                {updateError}
              </Alert>
            )}
            {lintReport && (
              <Alert severity="warning" onClose={() => setLintReport(null)} sx={{ whiteSpace: 'pre-wrap', my: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">Linting Report:</Typography>
                {lintReport}
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
                  <SnippetExecution snippetId={id} executionId={executionId} executionStatus={executionStatus || executionResult || undefined} />
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


