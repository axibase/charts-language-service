import { generate, attachComments } from "escodegen";
import { parseScript } from "esprima";
import { LanguageFormatter, LanguageFormattingOptions } from "./nestedCodeFormatter";

export class JSFormatter implements LanguageFormatter {
    public language: string;

    public format(unformattedCode: string, formattingOptions: LanguageFormattingOptions): string {
        try {
            /** Parse and format JavaScript */
            let parsedCode = parseScript(unformattedCode, { range: true, tokens: true, comment: true });
            parsedCode = attachComments(parsedCode, parsedCode.comments, parsedCode.tokens);
            const formattedCode = generate(parsedCode, {
                format: {
                    indent: formattingOptions
                },
                comment: true
            });

            return formattedCode;
        } catch (error) {
            /** If we didn't manage to format script add base indent to it */
            const codeIndent = " ".repeat(formattingOptions.base) + formattingOptions.style;
            return unformattedCode.split("\n").map(
                line => line.replace(/^\s*/, codeIndent)
            ).join("\n");
        }
    }
}