import {useMutation, useQuery} from 'react-query';
import {SnippetOperations} from "./snippetOperations.ts";
import { ApiSnippetOperations } from "../services/api.ts";
import { TestCase } from "../types/TestCase.ts";
import { Rule } from "../types/Rule.ts";
// import {useAuth0} from "@auth0/auth0-react";
// import {useEffect} from "react";


export const useSnippetsOperations = () => {
  // const {getAccessTokenSilently} = useAuth0()
  //
  // useEffect(() => {
  //     getAccessTokenSilently()
  //         .then(token => {
  //             console.log(token)
  //         })
  //         .catch(error => console.error(error));
  // });

  const snippetOperations: SnippetOperations = new ApiSnippetOperations(/* getAccessTokenSilently */); // Using the real API implementation

  return snippetOperations
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

  return useMutation<Rule[], Error, Rule[]>(
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

  return useMutation<Rule[], Error, Rule[]>(
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