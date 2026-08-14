import { Rule } from "../types/Rule.ts";

export function formatPrintScriptCode(code: string, rules: Rule[]): string {
    if (!code) return code;

    const ruleMap: Record<string, string | number | boolean | null | undefined> = {};
    for (const rule of rules) {
        ruleMap[rule.name] = rule.value !== undefined ? rule.value : rule.isActive;
    }

    const spaceBeforeColon = ruleMap['enforce-spacing-before-colon-in-declaration'] === true;
    const spaceAfterColon = ruleMap['enforce-spacing-after-colon-in-declaration'] !== false; // default true
    const spaceAroundEquals = ruleMap['enforce-no-spacing-around-equals'] === true ? false : true;

    const lines = code.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Format variable declaration colons (e.g. let x: string / const y: number)
        line = line.replace(/(\b(?:let|const)\s+[a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g, (_match, varPart, typePart) => {
            const colonPart = spaceBeforeColon ? " :" : ":";
            const afterPart = spaceAfterColon ? " " : "";
            return `${varPart}${colonPart}${afterPart}${typePart}`;
        });

        // Format equals sign spacing
        line = line.replace(/\s*=\s*/g, spaceAroundEquals ? " = " : "=");

        // Format line breaks before println if specified
        if (line.trim().startsWith("println") && i > 0) {
            const printlnLineBreaks = typeof ruleMap['line-breaks-before-println'] === 'number'
                ? ruleMap['line-breaks-before-println']
                : parseInt(<string>ruleMap['line-breaks-before-println'] || '1', 10);

            if (printlnLineBreaks > 1 && formattedLines.length > 0 && formattedLines[formattedLines.length - 1].trim() !== "") {
                formattedLines.push("");
            }
        }

        formattedLines.push(line);
    }

    return formattedLines.join('\n');
}
