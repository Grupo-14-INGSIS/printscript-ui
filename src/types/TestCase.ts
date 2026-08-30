export type TestCase = {
    id: string;
    name?: string;
    snippetId?: string;
    input?: string[];
    output?: string[];
    expected?: string[];
    version?: string;
    environment?: Record<string, string>;
};

export type CreateTestCase = {
    name?: string;
    input: string[];
    expected: string[];
    version?: string;
    environment?: Record<string, string>;
};

export type TestCaseResult = {
    actual: string[];
    result: 'SUCCESS' | 'FAILED' | 'ERROR';
    message: string;
};