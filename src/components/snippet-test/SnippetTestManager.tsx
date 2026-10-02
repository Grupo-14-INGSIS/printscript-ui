import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    Add,
    CheckCircle,
    Cancel,
    Error as ErrorIcon,
    PlayArrow,
    Delete,
    Refresh,
    PlaylistPlay,
} from "@mui/icons-material";
import {
    useGetTestCases,
    useCreateTestCase,
    useDeleteTestCase,
    useRunTestCase,
} from "../../utils/queries.tsx";
import { queryClient } from "../../App.tsx";
import { useSnackbarContext } from "../../contexts/snackbarContext.tsx";
import { CreateTestCase, TestCaseResult } from "../../types/TestCase.ts";

export type SnippetTestManagerProps = {
    snippetId: string;
    snippetName?: string;
    version?: string;
};

export const SnippetTestManager = ({
    snippetId,
    snippetName,
    version = "1.0",
}: SnippetTestManagerProps) => {
    const { createSnackbar } = useSnackbarContext();
    const [currentTab, setCurrentTab] = useState<number>(0);

    // Form state for creating a test case
    const [testName, setTestName] = useState<string>("");
    const [inputLines, setInputLines] = useState<string>("");
    const [expectedLines, setExpectedLines] = useState<string>("");
    const [testVersion, setTestVersion] = useState<string>(version || "1.0");
    const [envJson, setEnvJson] = useState<string>("");
    const [formError, setFormError] = useState<string | null>(null);

    // Execution results state keyed by testId
    const [results, setResults] = useState<Record<string, { result: TestCaseResult; loading?: boolean }>>({});
    const [runningAll, setRunningAll] = useState<boolean>(false);

    const { data: testCases, isLoading: isLoadingTests, isError: isTestsError, error: testsError, refetch: refetchTests } = useGetTestCases(snippetId);

    const { mutateAsync: createTestCase, isLoading: isCreating } = useCreateTestCase({
        onSuccess: () => {
            queryClient.invalidateQueries(['testCases', snippetId]);
            createSnackbar('success', 'Test case created successfully');
            resetForm();
            setCurrentTab(0);
        },
    });

    const { mutateAsync: deleteTestCase, isLoading: isDeleting } = useDeleteTestCase({
        onSuccess: () => {
            queryClient.invalidateQueries(['testCases', snippetId]);
            createSnackbar('success', 'Test case deleted successfully');
        },
    });

    const { mutateAsync: runTestCase } = useRunTestCase();

    const resetForm = () => {
        setTestName("");
        setInputLines("");
        setExpectedLines("");
        setTestVersion(version || "1.0");
        setEnvJson("");
        setFormError(null);
    };

    const handleCreateTest = async () => {
        setFormError(null);

        let parsedEnv: Record<string, string> = {};
        if (envJson.trim()) {
            try {
                parsedEnv = JSON.parse(envJson);
                if (typeof parsedEnv !== "object" || Array.isArray(parsedEnv)) {
                    setFormError('Environment variables must be a valid JSON object (e.g. {"KEY": "VALUE"})');
                    return;
                }
            } catch {
                setFormError("Invalid JSON format for environment variables");
                return;
            }
        }

        const inputs = inputLines
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const expected = expectedLines
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const newTestCase: CreateTestCase = {
            name: testName.trim() || undefined,
            input: inputs,
            expected: expected,
            version: testVersion,
            environment: parsedEnv,
        };

        try {
            await createTestCase({ snippetId, testCase: newTestCase });
            await refetchTests();
            resetForm();
            setCurrentTab(0);
        } catch (err: unknown) {
            console.error("Error creating test case:", err);
            const message = err instanceof Error ? err.message : "Failed to create test case";
            setFormError(message);
            createSnackbar("error", message);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        try {
            await deleteTestCase({ snippetId, testId });
            await refetchTests();
            setResults((prev) => {
                const updated = { ...prev };
                delete updated[testId];
                return updated;
            });
        } catch (err: unknown) {
            console.error("Error deleting test case:", err);
            const message = err instanceof Error ? err.message : "Failed to delete test case";
            createSnackbar("error", message);
        }
    };

    const handleRunSingleTest = async (testId: string) => {
        setResults((prev) => ({
            ...prev,
            [testId]: { result: prev[testId]?.result || { actual: [], result: "SUCCESS", message: "" }, loading: true },
        }));

        try {
            const res = await runTestCase({ snippetId, testId });
            setResults((prev) => ({
                ...prev,
                [testId]: { result: res, loading: false },
            }));

            if (res.result === "SUCCESS") {
                createSnackbar("success", "Test passed!");
            } else if (res.result === "FAILED") {
                createSnackbar("warning", "Test failed: output does not match expected");
            } else {
                createSnackbar("error", `Test error: ${res.message}`);
            }
        } catch (err: unknown) {
            console.error("Error running test case:", err);
            const message = err instanceof Error ? err.message : "Execution failed";
            setResults((prev) => ({
                ...prev,
                [testId]: {
                    result: { actual: [], result: "ERROR", message },
                    loading: false,
                },
            }));
            createSnackbar("error", message);
        }
    };

    const handleRunAllTests = async () => {
        if (!testCases || testCases.length === 0) return;
        setRunningAll(true);

        for (const tc of testCases) {
            setResults((prev) => ({
                ...prev,
                [tc.id]: { result: prev[tc.id]?.result || { actual: [], result: "SUCCESS", message: "" }, loading: true },
            }));

            try {
                const res = await runTestCase({ snippetId, testId: tc.id });
                setResults((prev) => ({
                    ...prev,
                    [tc.id]: { result: res, loading: false },
                }));
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Execution failed";
                setResults((prev) => ({
                    ...prev,
                    [tc.id]: {
                        result: { actual: [], result: "ERROR", message },
                        loading: false,
                    },
                }));
            }
        }

        setRunningAll(false);
        createSnackbar("info", "Finished running all tests");
    };

    const renderResultChip = (resultInfo?: { result: TestCaseResult; loading?: boolean }) => {
        if (!resultInfo) {
            return <Chip size="small" label="Not run" variant="outlined" />;
        }
        if (resultInfo.loading) {
            return <Chip size="small" icon={<CircularProgress size={14} />} label="Running..." color="default" />;
        }

        switch (resultInfo.result.result) {
            case "SUCCESS":
                return <Chip size="small" icon={<CheckCircle />} label="Passed" color="success" />;
            case "FAILED":
                return <Chip size="small" icon={<Cancel />} label="Failed" color="error" />;
            case "ERROR":
                return <Chip size="small" icon={<ErrorIcon />} label="Error" color="warning" />;
            default:
                return <Chip size="small" label={resultInfo.result.result} />;
        }
    };

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Tests for {snippetName || "Snippet"}
                    </Typography>
                </Box>
                <IconButton onClick={() => refetchTests()} size="small" title="Refresh tests">
                    <Refresh />
                </IconButton>
            </Box>

            <Tabs
                value={currentTab}
                onChange={(_, val) => setCurrentTab(val)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label={`Test Cases (${testCases?.length ?? 0})`} />
                <Tab label="Create New Test" icon={<Add />} iconPosition="start" />
            </Tabs>

            {/* TAB 0: LIST AND RUN TESTS */}
            {currentTab === 0 && (
                <Box sx={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {isLoadingTests ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : isTestsError ? (
                        <Box py={2}>
                            <Alert
                                severity="error"
                                action={
                                    <Button color="inherit" size="small" onClick={() => refetchTests()}>
                                        Retry
                                    </Button>
                                }
                            >
                                {testsError instanceof Error ? testsError.message : "Error loading tests"}
                            </Alert>
                        </Box>
                    ) : testCases && testCases.length > 0 ? (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    {testCases.length} {testCases.length === 1 ? "test" : "tests"} defined
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={runningAll ? <CircularProgress size={16} color="inherit" /> : <PlaylistPlay />}
                                    onClick={handleRunAllTests}
                                    disabled={runningAll}
                                >
                                    Run All Tests
                                </Button>
                            </Box>

                            {testCases.map((tc, index) => {
                                const resultData = results[tc.id];
                                return (
                                    <Card key={tc.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ pb: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {tc.name || `Test #${index + 1}`}
                                                        </Typography>
                                                        <Chip label={`v${tc.version || "1.0"}`} size="small" variant="outlined" />
                                                        {renderResultChip(resultData)}
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {tc.id}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="Run this test">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() => handleRunSingleTest(tc.id)}
                                                                disabled={resultData?.loading || runningAll}
                                                            >
                                                                {resultData?.loading ? <CircularProgress size={18} /> : <PlayArrow />}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Delete test">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleDeleteTest(tc.id)}
                                                                disabled={isDeleting || runningAll}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Box mt={1.5} display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                                <Box bgcolor="#f5f5f5" p={1} borderRadius={1}>
                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                        INPUTS ({tc.input?.length ?? 0}):
                                                    </Typography>
                                                    {tc.input && tc.input.length > 0 ? (
                                                        tc.input.map((inp, i) => (
                                                            <Typography key={i} variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                                                                {inp}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            (No inputs)
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Box bgcolor="#f5f5f5" p={1} borderRadius={1}>
                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                        EXPECTED OUTPUT ({tc.expected?.length ?? tc.output?.length ?? 0}):
                                                    </Typography>
                                                    {(tc.expected || tc.output) && (tc.expected || tc.output)!.length > 0 ? (
                                                        (tc.expected || tc.output)!.map((out, i) => (
                                                            <Typography key={i} variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                                                                {out}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            (No expected output)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            {/* Results Details Box */}
                                            {resultData && !resultData.loading && (
                                                <Box
                                                    mt={1.5}
                                                    p={1.5}
                                                    borderRadius={1}
                                                    bgcolor={
                                                        resultData.result.result === "SUCCESS"
                                                            ? "#e8f5e9"
                                                            : resultData.result.result === "FAILED"
                                                            ? "#ffebee"
                                                            : "#fff8e1"
                                                    }
                                                >
                                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                        <Typography variant="caption" fontWeight="bold">
                                                            ACTUAL OUTPUT:
                                                        </Typography>
                                                        {resultData.result.result === "SUCCESS" ? (
                                                            <Chip label="MATCHED" size="small" color="success" />
                                                        ) : (
                                                            <Chip
                                                                label={resultData.result.result}
                                                                size="small"
                                                                color={resultData.result.result === "FAILED" ? "error" : "warning"}
                                                            />
                                                        )}
                                                    </Box>
                                                    {resultData.result.actual && resultData.result.actual.length > 0 ? (
                                                        resultData.result.actual.map((act, i) => (
                                                            <Typography key={i} variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                                                                {act}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            (No actual output returned)
                                                        </Typography>
                                                    )}
                                                    {resultData.result.message && (
                                                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                                            Details: {resultData.result.message}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </>
                    ) : (
                        <Box textAlign="center" py={4}>
                            <Typography variant="body1" color="text.secondary" mb={2}>
                                No tests found for this snippet.
                            </Typography>
                            <Button variant="outlined" startIcon={<Add />} onClick={() => setCurrentTab(1)}>
                                Create First Test
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {/* TAB 1: CREATE TEST */}
            {currentTab === 1 && (
                <Box
                    component="form"
                    sx={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
                >
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
                            {formError}
                        </Alert>
                    )}

                    <TextField
                        label="Test Name / Description (Optional)"
                        variant="outlined"
                        size="small"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="e.g. Basic addition test"
                        fullWidth
                    />

                    <FormControl size="small" sx={{ width: "200px" }}>
                        <InputLabel id="test-version-label">PrintScript Version</InputLabel>
                        <Select
                            labelId="test-version-label"
                            value={testVersion}
                            label="PrintScript Version"
                            onChange={(e) => setTestVersion(e.target.value)}
                        >
                            <MenuItem value="1.0">1.0</MenuItem>
                            <MenuItem value="1.1">1.1</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Inputs (one per line)"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={inputLines}
                        onChange={(e) => setInputLines(e.target.value)}
                        placeholder={"input1\ninput2"}
                        helperText="Values provided consecutively when the snippet invokes readInput()"
                        fullWidth
                    />

                    <TextField
                        label="Expected Outputs (one per line)"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={expectedLines}
                        onChange={(e) => setExpectedLines(e.target.value)}
                        placeholder={"Hello World\n42"}
                        helperText="Lines expected to be printed by println()"
                        fullWidth
                    />

                    <TextField
                        label="Environment Variables (JSON format, optional)"
                        variant="outlined"
                        size="small"
                        value={envJson}
                        onChange={(e) => setEnvJson(e.target.value)}
                        placeholder='{"VAR_NAME": "value"}'
                        helperText="Key-value pairs accessible via readEnv()"
                        fullWidth
                    />

                    <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
                        <Button variant="outlined" onClick={() => setCurrentTab(0)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateTest}
                            disabled={isCreating}
                            startIcon={isCreating ? <CircularProgress size={18} color="inherit" /> : <Add />}
                        >
                            Save Test
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
