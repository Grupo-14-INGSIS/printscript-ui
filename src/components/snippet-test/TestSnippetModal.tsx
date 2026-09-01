import { Box, Button, Divider } from "@mui/material";
import { ModalWrapper } from "../common/ModalWrapper.tsx";
import { SnippetTestManager } from "./SnippetTestManager.tsx";

type TestSnippetModalProps = {
    open: boolean;
    onClose: () => void;
    snippetId: string;
    snippetName?: string;
    version?: string;
};

export const TestSnippetModal = ({
    open,
    onClose,
    snippetId,
    snippetName,
    version = "1.0",
}: TestSnippetModalProps) => {
    return (
        <ModalWrapper open={open} onClose={onClose}>
            <SnippetTestManager
                snippetId={snippetId}
                snippetName={snippetName}
                version={version}
            />
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="flex-end">
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </Box>
        </ModalWrapper>
    );
};
