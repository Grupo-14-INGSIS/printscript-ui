import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {TestCase} from "../types/TestCase.ts";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "./snippet.ts";
import {PaginatedUsers} from "./users.ts";
import { useServices } from '../contexts/serviceContext.tsx';
import { useAuth0 } from '@auth0/auth0-react';

export const usePostTestCase = () => {
  const { apiService } = useServices();
  return useMutation<TestCase, Error, Partial<TestCase>>(
      (tc) => apiService.postTestCase(tc)
  );
};

export type TestCaseResult = "success" | "fail"

export const useTestSnippet = () => {
  const { apiService } = useServices();
  return useMutation<TestCaseResult, Error, Partial<TestCase>>(
      (tc) => apiService.testSnippet(tc)
  )
}

export const useGetFormatRules = () => {
  const { apiService } = useServices();
  return useQuery<Rule[], Error>('formatRules', () => apiService.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
  const { apiService } = useServices();
  return useMutation<void, Error, Rule[]>(
      rule => apiService.modifyFormatRule(rule),
      {onSuccess}
  );
}

export const useGetLintingRules = () => {
  const { apiService } = useServices();
  return useQuery<Rule[], Error>('lintingRules', () => apiService.getLintingRules());
}

export const useModifyLintingRules = ({onSuccess}: {onSuccess: () => void}) => {
  const { apiService } = useServices();
  return useMutation<void, Error, Rule[]>(
      rule => apiService.modifyLintingRule(rule),
      {onSuccess}
  );
}

// --- Hooks for execution endpoints ---
export const useGetExecutionStatus = (executionId: string) => {
  const { apiService } = useServices();
  return useQuery(['executionStatus', executionId], () => apiService.getExecutionStatus(executionId), {
    enabled: !!executionId,
  });
};

export const usePostExecutionInput = () => {
  const { apiService } = useServices();
  return useMutation<never, Error, { executionId: string; input: never }>(
      ({ executionId, input }) => apiService.postExecutionInput(executionId, input)
  );
};

export const useDeleteExecution = ({onSuccess}: {onSuccess: () => void}) => {
  const { apiService } = useServices();
  return useMutation<void, Error, string>(
      (executionId) => apiService.deleteExecution(executionId),
      { onSuccess }
  );
};

export const useGetFileTypes = () => {
    const { apiService } = useServices();
    return useQuery<FileType[], Error>('fileTypes', () => apiService.getFileTypes());
}

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const { runnerService } = useServices();
    const { user } = useAuth0();

    return useMutation<any, Error, CreateSnippet>(
        (snippet) => {
            if (!user?.sub) throw new Error("User not authenticated");
            return runnerService.createSnippet(snippet, user.sub);
        },
        {onSuccess}
    );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const { apiService } = useServices();
    return useQuery<PaginatedUsers, Error>(['users',name,page,pageSize], () => apiService.getUserFriends(name,page, pageSize));
};

export const useGetTestCases = () => {
    const { apiService } = useServices();
    return useQuery<TestCase[] | undefined, Error>(['testCases'], () => apiService.getTestCases(), {});
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess: () => void}) => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id) => apiService.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        id => apiService.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}

export const useFormatSnippet = () => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        snippetContent => apiService.formatSnippet(snippetContent)
    );
}

export const useGetSnippetById = (id: string) => {
    const { apiService } = useServices();
    return useQuery<Snippet | undefined, Error>(['snippet', id], () => apiService.getSnippetById(id), {
        enabled: !!id,
    });
};

export const useShareSnippet = () => {
    const { apiService } = useServices();
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}) => apiService.shareSnippet(snippetId, userId)
    );
};

export const useUpdateSnippetById = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    const { apiService } = useServices();
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => apiService.updateSnippetById(id, updateSnippet),{
            onSuccess,
        }
    );
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const { apiService } = useServices();
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => apiService.listSnippetDescriptors(page, pageSize,snippetName));
};