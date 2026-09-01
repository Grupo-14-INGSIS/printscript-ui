import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetFilters} from "./snippet.ts";
import { useServices } from '../contexts/serviceContext.tsx';
import { useAuth0 } from '@auth0/auth0-react';
import { StartExecutionResponse, ExecutionStatus, SharedUser } from '../types/runner.ts';
import { TestCase, CreateTestCase, TestCaseResult } from '../types/TestCase.ts';

export const useGetFormatRules = () => {
  const { apiService } = useServices();
  return useQuery<Rule[], Error>('formatRules', () => apiService.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
  const { apiService } = useServices();
  return useMutation<void, Error, Rule[]>(
      (rule: Rule[]) => apiService.modifyFormatRule(rule),
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
      (rule: Rule[]) => apiService.modifyLintingRule(rule),
      {onSuccess}
  );
}

// --- Hooks for execution endpoints ---

export const useStartExecution = ({onSuccess}: {onSuccess: (data: StartExecutionResponse) => void}): UseMutationResult<StartExecutionResponse, Error, {
    snippetId: string;
    environment: Record<string, string>;
    version: string;
}> => {
    const { apiService } = useServices();
    return useMutation<StartExecutionResponse, Error, { snippetId: string; environment: Record<string, string>; version: string }>(
        ({snippetId, environment, version}: { snippetId: string; environment: Record<string, string>; version: string }) => apiService.startExecution(snippetId, environment, version),
        {onSuccess}
    );
};


export const useSendInput = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, {
    snippetId: string;
    input: string;
}> => {
    const { apiService } = useServices();
    return useMutation<void, Error, { snippetId: string; input: string }>(
        ({snippetId, input}: { snippetId: string; input: string }) => apiService.sendInput(snippetId, input),
        {onSuccess}
    );
};

export const useCancelExecution = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, {snippetId: string, userId: string}> => {
    const { apiService } = useServices();
    const { user } = useAuth0();
    return useMutation<void, Error, {snippetId: string, userId: string}>(
        ({snippetId, userId}: {snippetId: string, userId: string}) => {
            if (!user?.sub) throw new Error("User not authenticated");
            return apiService.cancelExecution(snippetId, userId);
        },
        {onSuccess}
    );
};

export const useGetExecutionStatus = (snippetId: string, executionId: string) => {
    const { apiService } = useServices();
    return useQuery<ExecutionStatus, Error>(['executionStatus', snippetId, executionId], () => apiService.getExecutionStatus(snippetId, executionId), {
        enabled: !!executionId && !!snippetId, // Only run if both snippetId and executionId are available
        refetchInterval: 1000, // Refetch every second to get updates
    });
};

export const useGetFileTypes = () => {
    const { apiService } = useServices();
    return useQuery<FileType[], Error>('fileTypes', () => apiService.getFileTypes());
}

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, CreateSnippet> => {
    const { runnerService } = useServices();
    const { user } = useAuth0();

    return useMutation<void, Error, CreateSnippet>(
        async (snippet: CreateSnippet) => {
            if (!user?.sub) throw new Error("User not authenticated");
            await runnerService.createSnippet(snippet, user.sub);
        },
        {onSuccess}
    );
};

export const useGetTestCases = (snippetId: string | null) => {
    const { apiService } = useServices();
    return useQuery<TestCase[], Error>(['testCases', snippetId], () => apiService.getTestCases(snippetId!), {
        enabled: !!snippetId,
    });
};

export const useCreateTestCase = ({onSuccess}: {onSuccess?: (data: { testId: string }) => void} = {}) => {
    const { apiService } = useServices();
    return useMutation<{ testId: string }, Error, { snippetId: string; testCase: CreateTestCase }>(
        ({snippetId, testCase}) => apiService.createTestCase(snippetId, testCase),
        {
            onSuccess,
        }
    );
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess?: () => void} = {}) => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id: string) => apiService.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export const useDeleteTestCase = ({onSuccess}: {onSuccess?: () => void} = {}) => {
    const { apiService } = useServices();
    return useMutation<void, Error, { snippetId: string; testId: string }>(
        ['deleteTestCase'],
        ({snippetId, testId}) => apiService.deleteTestCase(snippetId, testId),
        {
            onSuccess,
        }
    );
};

export const useRunTestCase = ({onSuccess}: {onSuccess?: (result: TestCaseResult, variables: { snippetId: string; testId: string }) => void} = {}) => {
    const { apiService } = useServices();
    return useMutation<TestCaseResult, Error, { snippetId: string; testId: string }>(
        ['runTestCase'],
        ({snippetId, testId}) => apiService.runTestCase(snippetId, testId),
        {
            onSuccess,
        }
    );
};

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        (id: string) => apiService.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}

export const useFormatSnippet = () => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        (snippetContent: string) => apiService.formatSnippet(snippetContent)
    );
}

export const useGetSnippetById = (id: string | null) => {
    const { apiService, runnerService } = useServices();

    return useQuery<Snippet, Error>(
        ['snippet', id],
        async () => {
            if (!id) throw new Error("No snippet ID provided");

            // Fire both requests in parallel
            const metadataPromise = apiService.getSnippetData(id);
            const contentPromise = runnerService.getSnippetContent(id);

            const [metadata, content] = await Promise.all([metadataPromise, contentPromise]);

            // Combine the results
            return {
                id: metadata.snippetId,
                name: metadata.name,
                language: metadata.language,
                content: content,
                extension: 'ps', // Hardcode to .ps as requested
                compliance: 'pending', // Default value
                author: '', // Not provided by these endpoints
            };
        },
        {
            enabled: !!id,
        }
    );
};

export const useShareSnippet = () => {
    const { apiService } = useServices();
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}: { snippetId: string; userId: string }) => apiService.shareSnippet(snippetId, userId)
    );
};

export const useGetSharedUsers = (snippetId: string) => {
    const { apiService } = useServices();
    return useQuery<SharedUser[], Error>(['sharedUsers', snippetId], () => apiService.getSharedUsers(snippetId), {
        enabled: !!snippetId,
    });
};

export const useUpdateSnippetContent = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, {
    id: string;
    content: string
}> => {
    const { runnerService } = useServices();
    return useMutation<void, Error, { id: string; content: string }>(
        ({id, content}: { id: string; content: string }) => runnerService.updateSnippetContent(id, content),{
            onSuccess,
        }
    );
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, filters?: SnippetFilters) => {
    const { apiService } = useServices();
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page, pageSize, filters], () => apiService.listSnippetDescriptors(page, pageSize, filters));
};