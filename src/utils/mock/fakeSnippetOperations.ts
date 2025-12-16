import {SnippetOperations} from '../snippetOperations'
import {FakeSnippetStore} from './fakeSnippetStore'
import {CreateSnippet, PaginatedSnippets, Snippet, SnippetData, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";

const DELAY: number = 1000

export class FakeSnippetOperations implements SnippetOperations {
  private readonly fakeStore = new FakeSnippetStore()

  constructor() {
    autoBind(this)
  }

  createSnippet(createSnippet: CreateSnippet): Promise<void> {
    return new Promise(resolve => {
      this.fakeStore.createSnippet(createSnippet)
      setTimeout(() => resolve(), DELAY)
    })
  }
  
  getSnippetData(id: string): Promise<SnippetData> {
      return new Promise(resolve => {
          const snippet = this.fakeStore.getSnippetById(id);
          if (snippet) {
              resolve({id: snippet.id, name: snippet.name, language: snippet.language});
          } else {
              throw new Error("Snippet not found");
          }
      })
  }

  listSnippetDescriptors(page: number,pageSize: number): Promise<PaginatedSnippets> {
    const response: PaginatedSnippets = {
      page: page,
      page_size: pageSize,
      count: 20,
      snippets: page == 0 ? this.fakeStore.listSnippetDescriptors().splice(0,pageSize) : this.fakeStore.listSnippetDescriptors().splice(1,2)
    }

    return new Promise(resolve => {
      setTimeout(() => resolve(response), DELAY)
    })
  }

  updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.updateSnippet(id, updateSnippet)), DELAY)
    })
  }

  shareSnippet(snippetId: string): Promise<Snippet> {
    return new Promise(resolve => {
      // @ts-expect-error, it will always find it in the fake store
      setTimeout(() => resolve(this.fakeStore.getSnippetById(snippetId)), DELAY)
    })
  }

  getFormatRules(): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getFormatRules()), DELAY)
    })
  }

  getLintingRules(): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getLintingRules()), DELAY)
    })
  }

  formatSnippet(snippetContent: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.formatSnippet(snippetContent)), DELAY)
    })
  }

  getTestCases(_snippetId: string): Promise<string[]> {
    return new Promise(resolve => {
      // Returning just IDs as strings now
      setTimeout(() => resolve(this.fakeStore.getTestCases().map(tc => tc.id)), DELAY)
    })
  }

  postTestCase(testCase: TestCase): Promise<TestCase> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.postTestCase(testCase)), DELAY)
    })
  }

  removeTestCase(id: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.removeTestCase(id)), DELAY)
    })
  }

  testSnippet(): Promise<TestCaseResult> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.testSnippet()), DELAY)
    })
  }

  deleteSnippet(id: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.deleteSnippet(id)), DELAY)
    })
  }

  getFileTypes(): Promise<FileType[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
    })
  }

  modifyFormatRule(newRules: Rule[], _language?: string): Promise<void> {
    return new Promise(resolve => {
      this.fakeStore.modifyFormattingRule(newRules)
      setTimeout(() => resolve(), DELAY)
    })
  }

  modifyLintingRule(newRules: Rule[], _language?: string): Promise<void> {
    return new Promise(resolve => {
      this.fakeStore.modifyLintingRule(newRules)
      setTimeout(() => resolve(), DELAY)
    })
  }

  getExecutionStatus(_executionId: string): Promise<never> {
    return Promise.resolve(undefined as never);
  }

  postExecutionInput(_executionId: string, _input: never): Promise<never> {
    return Promise.resolve(undefined as never);
  }

  deleteExecution(_executionId: string): Promise<void> {
    return Promise.resolve(undefined);
  }
}
