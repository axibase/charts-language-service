import { attachComments, FormatOptions, generate } from "escodegen";
import { parseScript } from "esprima";
import { DEFAULT_CODE_FORMATTING_OPTIONS, LanguageFormatter } from "./nestedCodeFormatter";

export class JSFormatter implements LanguageFormatter {
    public language: string;

    public format(unformattedCode: string, options: FormatOptions): string {
        const { indent, newline, semicolons } = Object.assign({}, DEFAULT_CODE_FORMATTING_OPTIONS, options);
        try {
            /** Parse and format JavaScript */
            let parsedCode = parseScript(unformattedCode, { range: true, tokens: true, comment: true });
            parsedCode = attachComments(parsedCode, parsedCode.comments, parsedCode.tokens);

            const formattedCode = generate(parsedCode, {
                comment: true,
                format: {
                    indent,
                    newline,
                    semicolons
                }
            });

            return formattedCode;
        } catch (error) {
            /** If we didn't manage to format script add base indent to it */
            const codeIndent = " ".repeat(indent.base) + indent.style;
            return unformattedCode.split("\n").map(
                line => line.replace(/^\s*/, codeIndent)
            ).join("\n");
        }
    }
}
