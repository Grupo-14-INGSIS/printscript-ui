import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from "@mui/material";
import {AddSnippetModal} from "./AddSnippetModal.tsx";
import {useRef, useState} from "react";
import {Add, Clear, FilterAltOff, Search} from "@mui/icons-material";
import {LoadingSnippetRow, SnippetRow} from "./SnippetRow.tsx";
import {
  AuthorRelationFilter,
  ComplianceFilter,
  CreateSnippetWithLang,
  getFileLanguage,
  Snippet,
  SnippetSortBy,
  SortOrder
} from "../../utils/snippet.ts";
import {usePaginationContext} from "../../contexts/paginationContext.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useGetFileTypes} from "../../utils/queries.tsx";

type SnippetTableProps = {
  handleClickSnippet: (id: string) => void;
  snippets?: Snippet[];
  loading: boolean;
  handleSearchSnippet: (snippetName: string) => void;
  searchValue?: string;
  onClearSearch?: () => void;
  authorFilter?: AuthorRelationFilter;
  onAuthorFilterChange?: (author: AuthorRelationFilter) => void;
  languageFilter?: string;
  onLanguageFilterChange?: (language: string) => void;
  complianceFilter?: ComplianceFilter;
  onComplianceFilterChange?: (compliance: ComplianceFilter) => void;
  sortBy?: SnippetSortBy;
  sortOrder?: SortOrder;
  onSortChange?: (field: SnippetSortBy) => void;
  onResetFilters?: () => void;
}

export const SnippetTable = (props: SnippetTableProps) => {
  const {
    snippets,
    handleClickSnippet,
    loading,
    handleSearchSnippet,
    searchValue = '',
    onClearSearch,
    authorFilter = 'all',
    onAuthorFilterChange,
    languageFilter = 'all',
    onLanguageFilterChange,
    complianceFilter = 'all',
    onComplianceFilterChange,
    sortBy = 'name',
    sortOrder = 'asc',
    onSortChange,
    onResetFilters
  } = props;
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [popoverMenuOpened, setPopoverMenuOpened] = useState(false);
  const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>();

  const popoverRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {page, page_size: pageSize, count, handleChangePageSize, handleGoToPage} = usePaginationContext();
  const {createSnackbar} = useSnackbarContext();
  const {data: fileTypes} = useGetFileTypes();

  const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files;
    if (!files || !files.length) {
      createSnackbar('error',"Please select at leat one file");
      return;
    }
    const file = files[0];
    const splitName = file.name.split(".");
    const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1));
    if (!fileType) {
      createSnackbar('error', `File type ${splitName.at(-1)} not supported`);
      return;
    }
    file.text().then((text) => {
      setSnippet({
        id: uuidv4(),
        name: splitName[0],
        content: text,
        language: fileType.language,
        extension: fileType.extension
      });
    }).catch(e => {
      console.error(e);
    }).finally(() => {
      setAddModalOpened(true);
      target.value = "";
    });
  };

  function handleClickMenu() {
    setPopoverMenuOpened(false);
  }

  const hasActiveFilters = Boolean(
    searchValue ||
    (authorFilter && authorFilter !== 'all') ||
    (languageFilter && languageFilter !== 'all') ||
    (complianceFilter && complianceFilter !== 'all')
  );

  return (
      <>
        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box sx={{background: 'white', minWidth: '240px', flex: {xs: '1 1 100%', md: '0 1 280px'}, display: 'flex', alignItems: 'center', px: 1, borderRadius: 1}}>
              <InputBase
                  sx={{ml: 1, flex: 1}}
                  placeholder="Search snippet by name..."
                  inputProps={{'aria-label': 'search'}}
                  value={searchValue}
                  onChange={e => handleSearchSnippet(e.target.value)}
              />
              {searchValue && onClearSearch ? (
                <IconButton type="button" sx={{p: '5px'}} aria-label="clear" onClick={onClearSearch}>
                  <Clear fontSize="small" />
                </IconButton>
              ) : (
                <IconButton type="button" sx={{p: '10px'}} aria-label="search">
                  <Search/>
                </IconButton>
              )}
            </Box>

            <Box display="flex" flexDirection="row" gap={1.5} flexWrap="wrap" alignItems="center">
              {/* Author / Relation Filter */}
              <FormControl size="small" sx={{ minWidth: 130, background: 'white', borderRadius: 1 }}>
                <InputLabel id="author-filter-label">Author</InputLabel>
                <Select
                  labelId="author-filter-label"
                  id="author-filter"
                  value={authorFilter}
                  label="Author"
                  onChange={e => onAuthorFilterChange?.(e.target.value as AuthorRelationFilter)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                  <MenuItem value="shared">Shared</MenuItem>
                </Select>
              </FormControl>

              {/* Language Filter */}
              <FormControl size="small" sx={{ minWidth: 140, background: 'white', borderRadius: 1 }}>
                <InputLabel id="language-filter-label">Language</InputLabel>
                <Select
                  labelId="language-filter-label"
                  id="language-filter"
                  value={languageFilter}
                  label="Language"
                  onChange={e => onLanguageFilterChange?.(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {fileTypes?.map(ft => (
                    <MenuItem key={ft.language} value={ft.language}>
                      {ft.language}
                    </MenuItem>
                  )) ?? <MenuItem value="printscript">printscript</MenuItem>}
                </Select>
              </FormControl>

              {/* Conformance / Linting Filter */}
              <FormControl size="small" sx={{ minWidth: 150, background: 'white', borderRadius: 1 }}>
                <InputLabel id="compliance-filter-label">Conformance</InputLabel>
                <Select
                  labelId="compliance-filter-label"
                  id="compliance-filter"
                  value={complianceFilter}
                  label="Conformance"
                  onChange={e => onComplianceFilterChange?.(e.target.value as ComplianceFilter)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="compliant">Compliant</MenuItem>
                  <MenuItem value="not-compliant">Not Compliant</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters Button */}
              {hasActiveFilters && onResetFilters && (
                <Button variant="outlined" size="small" onClick={onResetFilters} startIcon={<FilterAltOff />}>
                  Reset
                </Button>
              )}

              <Button ref={popoverRef} variant="contained" disableRipple sx={{boxShadow: 0}}
                      onClick={() => setPopoverMenuOpened(true)}>
                <Add/>
                Add Snippet
              </Button>
            </Box>
          </Box>
        </Box>

        <Table size="medium" sx={{borderSpacing: "0 10px", borderCollapse: "separate"}}>
          <TableHead>
            <TableRow sx={{fontWeight: 'bold'}}>
              <StyledTableCell sx={{fontWeight: "bold"}}>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder : 'asc'}
                  onClick={() => onSortChange?.('name')}
                >
                  Name
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>
                <TableSortLabel
                  active={sortBy === 'language'}
                  direction={sortBy === 'language' ? sortOrder : 'asc'}
                  onClick={() => onSortChange?.('language')}
                >
                  Language
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>
                <TableSortLabel
                  active={sortBy === 'author'}
                  direction={sortBy === 'author' ? sortOrder : 'asc'}
                  onClick={() => onSortChange?.('author')}
                >
                  Author
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>
                <TableSortLabel
                  active={sortBy === 'compliance'}
                  direction={sortBy === 'compliance' ? sortOrder : 'asc'}
                  onClick={() => onSortChange?.('compliance')}
                >
                  Conformance
                </TableSortLabel>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{
            loading ? (
                <>
                  {Array.from({length: 10}).map((_, index) => (
                      <LoadingSnippetRow key={index}/>
                  ))}
                </>
            ) : (
                <>
                  {
                      snippets && snippets.length > 0 ? (
                        snippets.map((snippet) => (
                            <SnippetRow data-testid={"snippet-row"}
                                         onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet}/>
                        ))
                      ) : (
                        <TableRow>
                          <StyledTableCell colSpan={4} align="center" sx={{py: 4, color: 'text.secondary'}}>
                            No snippets found
                          </StyledTableCell>
                        </TableRow>
                      )
                  }
                </>
            )
          }
          </TableBody>
          <TablePagination count={count} page={page} rowsPerPage={pageSize}
                           onPageChange={(_, page) => handleGoToPage(page)}
                           onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))}/>
        </Table>
        <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
                         onClose={() => setAddModalOpened(false)}/>
        <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClick={handleClickMenu}>
          <MenuItem onClick={() => setAddModalOpened(true)}>Create snippet</MenuItem>
          <MenuItem onClick={() => inputRef?.current?.click()}>Load snippet from file</MenuItem>
        </Menu>
        <input hidden type={"file"} ref={inputRef} multiple={false} data-testid={"upload-file-input"}
               onChange={e => handleLoadSnippet(e?.target)}/>
      </>
  )
}


export const StyledTableCell = styled(TableCell)`
    border: 0;
    align-items: center;
`
