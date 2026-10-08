import {Autocomplete, Box, Button, Divider, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetSharedUsers, useGetUsers, useShareSnippet} from "../../utils/queries.tsx";
import {useState} from "react";
import {queryClient} from "../../App.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import useDebounce from "../../hooks/useDebounce.ts";
import {User} from "../../utils/users.ts";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  snippetId: string
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, snippetId} = props
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const debouncedInput = useDebounce(inputValue, 300);
  const {createSnackbar} = useSnackbarContext();

  const {data: sharedUsers, refetch: refetchShared} = useGetSharedUsers(snippetId);
  const {data: users, isLoading: isLoadingUsers} = useGetUsers(debouncedInput);
  const {mutateAsync: shareSnippet, isLoading: isSharing} = useShareSnippet();

  // El email con el que se comparte: el usuario elegido de la lista o lo tipeado a mano
  const emailToShare = selectedUser?.name ?? inputValue.trim();

  const handleShare = async () => {
    if (!emailToShare) return;
    try {
      await shareSnippet({snippetId, userId: emailToShare});
      createSnackbar('success', `Snippet shared with ${emailToShare}`);
      setInputValue("");
      setSelectedUser(null);
      await queryClient.invalidateQueries(['sharedUsers', snippetId]);
      await refetchShared();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to share snippet';
      createSnackbar('error', message);
    }
  };

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <Autocomplete<User, false, false, true>
                freeSolo
                options={users ?? []}
                loading={isLoadingUsers}
                value={selectedUser}
                inputValue={inputValue}
                onInputChange={(_, value) => setInputValue(value)}
                onChange={(_, value) => {
                  if (typeof value === 'string' || value === null) {
                    setSelectedUser(null);
                  } else {
                    setSelectedUser(value);
                  }
                }}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="User email to share with"
                    variant="outlined"
                    placeholder="Start typing to search users..."
                  />
                )}
            />
            <Button onClick={handleShare} variant={"contained"} disabled={!emailToShare || isSharing}>
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
        </Box>
        <Box mt={4}>
            <Typography variant="h6">Shared with:</Typography>
            <List>
                {sharedUsers && sharedUsers.length > 0 ? sharedUsers.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.email} />
                    </ListItem>
                )) : (
                    <ListItem>
                        <ListItemText secondary="Not shared with anyone yet" />
                    </ListItem>
                )}
            </List>
        </Box>
        <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Close</Button>
        </Box>
      </ModalWrapper>
  )
}
