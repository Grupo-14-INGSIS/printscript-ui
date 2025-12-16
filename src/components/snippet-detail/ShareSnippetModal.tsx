import {Box, Button, Divider, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose} = props

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
            <Typography>Sharing is not implemented yet.</Typography>
            <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
                <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            </Box>
        </Box>
      </ModalWrapper>
  )
}

