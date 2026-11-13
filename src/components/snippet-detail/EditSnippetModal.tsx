import {useEffect, useState} from "react";
import {Alert, Box, Button, CircularProgress, FormControl, Input, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {Save} from "@mui/icons-material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {Snippet} from "../../utils/snippet.ts";
import {useGetFileTypes, useUpdateSnippetMetadata} from "../../utils/queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {queryClient} from "../../App.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";

/**
 * US #2: el dueño edita el nombre, la descripción, el lenguaje y la versión del snippet. El código se edita
 * en el editor del detalle. Solo se manda lo que cambió; cambiar lenguaje o versión vuelve a lintear.
 */
export const EditSnippetModal = ({open, onClose, snippet}: {
    open: boolean,
    onClose: () => void,
    snippet?: Snippet,
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("printscript");
    const [version, setVersion] = useState("1.1");
    const [error, setError] = useState<string | null>(null);
    const {createSnackbar} = useSnackbarContext();
    const {data: fileTypes} = useGetFileTypes();
    const {mutateAsync: updateMetadata, isLoading} = useUpdateSnippetMetadata({
        onSuccess: () => {
            queryClient.invalidateQueries(['snippet', snippet?.id]);
            queryClient.invalidateQueries('listSnippets');
            createSnackbar('success', 'Snippet updated successfully');
            onClose();
        }
    });

    useEffect(() => {
        if (open && snippet) {
            setName(snippet.name);
            setDescription(snippet.description ?? "");
            setLanguage(snippet.language || "printscript");
            setVersion(snippet.version ?? "1.1");
            setError(null);
        }
    }, [open, snippet]);

    if (!snippet) return null;

    const changes = {
        ...(name.trim() !== snippet.name ? {name: name.trim()} : {}),
        ...(description !== (snippet.description ?? "") ? {description} : {}),
        ...(language !== snippet.language ? {language} : {}),
        ...(version !== (snippet.version ?? "1.1") ? {version} : {}),
    };
    const hasChanges = Object.keys(changes).length > 0;

    const handleSave = async () => {
        setError(null);
        try {
            await updateMetadata({id: snippet.id, metadata: changes});
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update snippet';
            setError(message);
            createSnackbar('error', message);
        }
    };

    const languages = fileTypes && fileTypes.length > 0 ? fileTypes : [{language: "printscript", extension: "ps", version: "1.1"}];

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Box sx={{display: 'flex', flexDirection: "row", justifyContent: "space-between"}}>
                <Typography variant="h5" component="h2" sx={{display: 'flex', alignItems: 'center'}}>
                    Edit snippet
                </Typography>
                <Button disabled={!name.trim() || !hasChanges || isLoading} variant="contained" disableRipple
                        sx={{boxShadow: 0}} onClick={handleSave}>
                    <Box pr={1} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        {isLoading ? <CircularProgress size={24}/> : <Save/>}
                    </Box>
                    Save
                </Button>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <InputLabel htmlFor="edit-name">Name</InputLabel>
                <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} sx={{width: '50%'}}/>
                <InputLabel htmlFor="edit-description">Description</InputLabel>
                <Input id="edit-description" value={description} onChange={e => setDescription(e.target.value)}
                       multiline sx={{width: '100%'}}/>
                <FormControl variant="standard" sx={{width: '50%'}}>
                    <InputLabel id="edit-language-label">Language</InputLabel>
                    <Select labelId="edit-language-label" value={language} onChange={e => setLanguage(e.target.value)}>
                        {languages.map((ft: FileType) => (
                            <MenuItem key={ft.language} value={ft.language}>{ft.language}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="standard" sx={{width: '50%'}}>
                    <InputLabel id="edit-version-label">Version</InputLabel>
                    <Select labelId="edit-version-label" value={version} onChange={e => setVersion(e.target.value)}>
                        <MenuItem value="1.0">1.0</MenuItem>
                        <MenuItem value="1.1">1.1</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {error && (
                <Alert severity="error" sx={{whiteSpace: 'pre-wrap', my: 1}}>{error}</Alert>
            )}
        </ModalWrapper>
    );
}
