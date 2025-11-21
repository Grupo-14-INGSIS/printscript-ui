import {TestCase} from "../types/TestCase.ts";
import {TestCaseResult} from "./queries.tsx";
import {Rule} from "../types/Rule.ts";

export interface SnippetOperations {
  getFormatRules(): Promise<Rule[]>

  getLintingRules(): Promise<Rule[]>

  postTestCase(testCase: Partial<TestCase>): Promise<TestCase>

  testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult>

  modifyFormatRule(newRules: Rule[]): Promise<Rule[]>

  modifyLintingRule(newRules: Rule[]): Promise<Rule[]>

  getExecutionStatus(executionId: string): Promise<never>

  postExecutionInput(executionId: string, input: never): Promise<never>

  deleteExecution(executionId: string): Promise<void>
}
