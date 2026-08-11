import {Box,  Divider, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";

type TestSnippetModalProps = {
    open: boolean
    onClose: () => void
}

export const TestSnippetModal = ({open, onClose}: TestSnippetModalProps) => {

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Test snippet</Typography>
            <Divider/>
            <Box mt={2} display="flex">
                <Typography>Testing is not fully implemented yet.</Typography>
            </Box>
        </ModalWrapper>
    )
}
