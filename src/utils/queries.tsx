import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {TestCase} from "../types/TestCase.ts";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {CreateSnippet, PaginatedSnippets, Snippet} from "./snippet.ts";
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

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, CreateSnippet> => {
    const { runnerService } = useServices();
    const { user } = useAuth0();

    return useMutation<void, Error, CreateSnippet>(
        (snippet) => {
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
                id: metadata.id,
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
        ({snippetId, userId}) => apiService.shareSnippet(snippetId, userId)
    );
};

export const useUpdateSnippetContent = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<void, Error, {
    id: string;
    content: string
}> => {
    const { runnerService } = useServices();
    return useMutation<void, Error, { id: string; content: string }>(
        ({id, content}) => runnerService.updateSnippetContent(id, content),{
            onSuccess,
        }
    );
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const { apiService } = useServices();
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => apiService.listSnippetDescriptors(page, pageSize,snippetName));
};