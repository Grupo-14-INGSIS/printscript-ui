import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {SnippetOperations} from "./snippetOperations.ts";
import { ApiSnippetOperations } from "../services/api.ts";
import {TestCase} from "../types/TestCase.ts";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "./snippet.ts";
import {PaginatedUsers} from "./users.ts";

import {useAuth0} from "@auth0/auth0-react";
import {useMemo} from "react";

export const useSnippetsOperations = () => {
  const {getAccessTokenSilently} = useAuth0()

  return useMemo(() => new ApiSnippetOperations(getAccessTokenSilently), [getAccessTokenSilently]);
}

export const usePostTestCase = () => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<TestCase, Error, Partial<TestCase>>(
      (tc) => snippetOperations.postTestCase(tc)
  );
};

export type TestCaseResult = "success" | "fail"

export const useTestSnippet = () => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<TestCaseResult, Error, Partial<TestCase>>(
      (tc) => snippetOperations.testSnippet(tc)
  )
}

export const useGetFormatRules = () => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<void, Error, Rule[]>(
      rule => snippetOperations.modifyFormatRule(rule),
      {onSuccess}
  );
}

export const useGetLintingRules = () => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
}

export const useModifyLintingRules = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<void, Error, Rule[]>(
      rule => snippetOperations.modifyLintingRule(rule),
      {onSuccess}
  );
}

// --- Hooks for execution endpoints ---

export const useGetExecutionStatus = (executionId: string) => {
  const snippetOperations = useSnippetsOperations();
  return useQuery(['executionStatus', executionId], () => snippetOperations.getExecutionStatus(executionId), {
    enabled: !!executionId, // Only run if executionId is available
  });
};

export const usePostExecutionInput = () => {
  const snippetOperations = useSnippetsOperations();
  return useMutation<never, Error, { executionId: string; input: never }>(
      ({ executionId, input }) => snippetOperations.postExecutionInput(executionId, input)
  );
};

export const useDeleteExecution = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations();
  return useMutation<void, Error, string>(
      (executionId) => snippetOperations.deleteExecution(executionId),
      { onSuccess }
  );
};

export const useGetFileTypes = () => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Snippet, Error, CreateSnippet>(createSnippet => snippetOperations.createSnippet(createSnippet), {onSuccess});
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<PaginatedUsers, Error>(['users',name,page,pageSize], () => snippetOperations.getUserFriends(name,page, pageSize));
};

export const useGetTestCases = () => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<TestCase[] | undefined, Error>(['testCases'], () => snippetOperations.getTestCases(), {});
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess: () => void}) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id) => snippetOperations.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, string>(
        id => snippetOperations.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}

export const useFormatSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, string>(
        snippetContent => snippetOperations.formatSnippet(snippetContent)
    );
}

export const useGetSnippetById = (id: string) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<Snippet | undefined, Error>(['snippet', id], () => snippetOperations.getSnippetById(id), {
        enabled: !!id, // This query will not execute until the id is provided
    });
};


export const useShareSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}) => snippetOperations.shareSnippet(snippetId, userId)
    );
};


export const useUpdateSnippetById = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => snippetOperations.updateSnippetById(id, updateSnippet),{
            onSuccess,
        }
    );
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => snippetOperations.listSnippetDescriptors(page, pageSize,snippetName));
};