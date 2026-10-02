import { Rule } from "../types/Rule.ts";

export interface LintResult {
    compliant: boolean;
    issues: string[];
    summary: string;
}

export function lintPrintScriptCode(code: string, rules: Rule[]): LintResult {
    if (!code || !code.trim()) {
        return { compliant: true, issues: [], summary: "No issues found." };
    }

    const ruleMap: Record<string, string | number | boolean | null | undefined> = {};
    for (const rule of rules) {
        ruleMap[rule.name] = rule.value !== undefined ? rule.value : rule.isActive;
    }

    const issues: string[] = [];
    const lines = code.split('\n');

    // 1. identifier_format check (camelCase vs snake_case)
    const identifierRule = ruleMap['identifier_format'];
    const style = typeof identifierRule === 'string'
        ? identifierRule
        : (identifierRule === true ? 'camelCase' : null);

    // 2. println check: mandatory variable or literal
    const mandatoryPrintln = ruleMap['mandatory-variable-or-literal-in-println'] !== false &&
        ruleMap['mandatory_variable_or_literal_in_println'] !== false;

    // 3. readInput check: mandatory variable or literal
    const mandatoryReadInput = ruleMap['mandatory-variable-or-literal-in-readInput'] !== false &&
        ruleMap['mandatory_variable_or_literal_in_readInput'] !== false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        if (style && style !== 'none') {
            const declMatches = line.matchAll(/\b(?:let|const)\s+([a-zA-Z0-9_]+)/g);
            for (const match of declMatches) {
                const varName = match[1];
                if (style === 'camelCase' && !/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
                    issues.push(`Line ${lineNum}: Identifier '${varName}' does not match camelCase`);
                } else if (style === 'snake_case' && !/^[a-z0-9_]+$/.test(varName)) {
                    issues.push(`Line ${lineNum}: Identifier '${varName}' does not match snake_case`);
                }
            }
        }

        if (mandatoryPrintln && line.includes('println')) {
            if (/println\s*\(\s*\)/.test(line)) {
                issues.push(`Line ${lineNum}: println must contain a variable or literal expression`);
            }
        }

        if (mandatoryReadInput && line.includes('readInput')) {
            if (/readInput\s*\(\s*\)/.test(line)) {
                issues.push(`Line ${lineNum}: readInput must contain a prompt argument`);
            }
        }
    }

    const compliant = issues.length === 0;
    return {
        compliant,
        issues,
        summary: compliant
            ? "No issues were found. Code is compliant."
            : `${issues.length} issue(s) found:\n${issues.map(i => `• ${i}`).join('\n')}`
    };
}
