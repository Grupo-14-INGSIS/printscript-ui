import {Box, Button, Divider, List, ListItem, ListItemText, TextField, Typography, Autocomplete, CircularProgress} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetSharedUsers, useShareSnippet, useSearchUsers} from "../../utils/queries.tsx"; // Assuming these hooks will be created
import {useState} from "react";
import useDebounce from "../../hooks/useDebounce.ts";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  snippetId: string
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, snippetId} = props
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);

  const debouncedQuery = useDebounce(inputValue, 300);
  const {data: searchResults, isLoading: isSearching} = useSearchUsers(debouncedQuery);
  const {data: sharedUsers} = useGetSharedUsers(snippetId);
  const {mutate: shareSnippet} = useShareSnippet();

  const handleShare = () => {
    if (selectedUser) {
      shareSnippet({snippetId, userId: selectedUser.id});
      setSelectedUser(null);
      setInputValue("");
    } else if (inputValue.trim()) {
      // Fallback: share by raw ID/email if no suggestion selected
      shareSnippet({snippetId, userId: inputValue.trim()});
      setInputValue("");
    }
  };

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <Autocomplete
                freeSolo
                options={searchResults ?? []}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                inputValue={inputValue}
                value={selectedUser}
                onInputChange={(_e, value) => {
                    setInputValue(value);
                    if (!value) setSelectedUser(null);
                }}
                onChange={(_e, value) => {
                    if (value && typeof value !== 'string') {
                        setSelectedUser(value);
                    } else {
                        setSelectedUser(null);
                    }
                }}
                loading={isSearching}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search user by name or email"
                        variant="outlined"
                        helperText="Type at least 2 characters to search"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isSearching ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
            <Button
                onClick={handleShare}
                variant={"contained"}
                disabled={!inputValue.trim() && !selectedUser}
            >
                Share
            </Button>
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
