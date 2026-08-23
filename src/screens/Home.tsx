import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {useParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import {
  AuthorRelationFilter,
  ComplianceFilter,
  SnippetFilters,
  SnippetSortBy,
  SortOrder
} from "../utils/snippet.ts";

const HomeScreen = () => {
  const {id: paramsId} = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  const [snippetId, setSnippetId] = useState<string | null>(null);
  
  const [authorFilter, setAuthorFilter] = useState<AuthorRelationFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('all');
  const [sortBy, setSortBy] = useState<SnippetSortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const {page, page_size, count, handleChangeCount, handleGoToPage} = usePaginationContext();

  const filters: SnippetFilters = useMemo(() => ({
    name: debouncedSearchTerm,
    authorRelation: authorFilter,
    language: languageFilter,
    compliance: complianceFilter,
    sortBy,
    sortOrder,
  }), [debouncedSearchTerm, authorFilter, languageFilter, complianceFilter, sortBy, sortOrder]);

  const {data, isLoading} = useGetSnippets(page, page_size, filters);

  useEffect(() => {
    if (data?.count !== undefined && data.count !== count) {
      handleChangeCount(data.count);
    }
  }, [count, data?.count, handleChangeCount]);

  useEffect(() => {
    if (paramsId) {
      setSnippetId(paramsId);
    }
  }, [paramsId]);

  useEffect(() => {
    handleGoToPage(0);
  }, [debouncedSearchTerm, authorFilter, languageFilter, complianceFilter, sortBy, sortOrder, handleGoToPage]);

  const handleCloseModal = () => setSnippetId(null);

  const handleSearchSnippet = (snippetName: string) => {
    setSearchTerm(snippetName);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSortChange = (field: SnippetSortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAuthorFilter('all');
    setLanguageFilter('all');
    setComplianceFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
      <>
        <SnippetTable
          loading={isLoading}
          handleClickSnippet={setSnippetId}
          snippets={data?.snippets}
          handleSearchSnippet={handleSearchSnippet}
          searchValue={searchTerm}
          onClearSearch={handleClearSearch}
          authorFilter={authorFilter}
          onAuthorFilterChange={setAuthorFilter}
          languageFilter={languageFilter}
          onLanguageFilterChange={setLanguageFilter}
          complianceFilter={complianceFilter}
          onComplianceFilterChange={setComplianceFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
        />
        <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
          {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
        </Drawer>
      </>
  );
};

export default withNavbar(HomeScreen);

