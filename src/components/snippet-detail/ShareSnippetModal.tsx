import {Box, Button, Divider, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetSharedUsers, useShareSnippet} from "../../utils/queries.tsx"; // Assuming these hooks will be created
import {useState} from "react";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  snippetId: string
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, snippetId} = props
  const [emailToShare, setEmailToShare] = useState("");
  const {data: sharedUsers} = useGetSharedUsers(snippetId);
  const {mutate: shareSnippet} = useShareSnippet();

  const handleShare = () => {
    if (emailToShare) {
      shareSnippet({snippetId, userId: emailToShare});
      setEmailToShare("");
    }
  };

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
                label="User email or ID to share with"
                variant="outlined"
                value={emailToShare}
                onChange={(e) => setEmailToShare(e.target.value)}
            />
            <Button onClick={handleShare} variant={"contained"}>Share</Button>
        </Box>
        <Box mt={4}>
            <Typography variant="h6">Shared with:</Typography>
            <List>
                {sharedUsers?.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.email} />
                    </ListItem>
                ))}
            </List>
        </Box>
        <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Close</Button>
        </Box>
      </ModalWrapper>
  )
}
