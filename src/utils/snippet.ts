import {Pagination} from "./pagination.ts";
import {FileType} from "../types/FileType.ts";

export type ComplianceEnum =
    'pending' |
    'failed' |
    'not-compliant' |
    'compliant'


export type CreateSnippet = {
  id: string;
  name: string;
  content: string;
  language: string;
  extension: string;
}

export type CreateSnippetWithLang = CreateSnippet & { language: string }

export type UpdateSnippet = {
  content: string
}

export type SnippetData = {
    snippetId: string;
    name: string;
    language: string;
};

export type Snippet = CreateSnippet & {
  id: string
} & SnippetStatus

type SnippetStatus = {
  compliance: ComplianceEnum;
  author: string;
}
export type PaginatedSnippets = Pagination & {
  snippets: Snippet[]
}

export type AuthorRelationFilter = 'all' | 'owner' | 'shared';
export type ComplianceFilter = 'all' | ComplianceEnum;
export type SortOrder = 'asc' | 'desc';
export type SnippetSortBy = 'name' | 'language' | 'author' | 'compliance';

export type SnippetFilters = {
    name?: string;
    authorRelation?: AuthorRelationFilter;
    language?: string;
    compliance?: ComplianceFilter;
    sortBy?: SnippetSortBy;
    sortOrder?: SortOrder;
};

export const getFileLanguage = (fileTypes: FileType[], fileExt?: string) => {
  return fileExt && fileTypes?.find(x => x.extension == fileExt)
}