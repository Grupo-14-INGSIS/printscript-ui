import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet} from "./snippet.ts";
import { useServices } from '../contexts/serviceContext.tsx';
import { useAuth0 } from '@auth0/auth0-react';
import { StartExecutionResponse, ExecutionStatus } from '../types/runner.ts';

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

export const useCancelExecution = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, string> => {
    const { apiService } = useServices();
    return useMutation<void, Error, string>(
        (snippetId: string) => apiService.cancelExecution(snippetId),
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
        (snippet: CreateSnippet) => {
            if (!user?.sub) throw new Error("User not authenticated");
            return runnerService.createSnippet(snippet, user.sub);
        },
        {onSuccess}
    );
};

export const useGetTestCases = (snippetId: string | null) => {
    const { apiService } = useServices();
    return useQuery<string[], Error>(['testCases', snippetId], () => apiService.getTestCases(snippetId!), {
        enabled: !!snippetId,
    });
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess: () => void}) => {
    const { apiService } = useServices();
    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id: string) => apiService.removeTestCase(id),
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

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const { apiService } = useServices();
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => apiService.listSnippetDescriptors(page, pageSize,snippetName));
};