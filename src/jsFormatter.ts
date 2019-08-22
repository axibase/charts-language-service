import { generate } from "escodegen";
import { parseScript } from "esprima";
import { LanguageFormatter, LanguageFormattingOptions } from "./nestedCodeFormatter";

export class JSFormatter implements LanguageFormatter {
    public language: string;

    public format(unformattedCode: string, formattingOptions: LanguageFormattingOptions): string {
        try {
            /** Parse and format JavaScript */
            const parsedCode = parseScript(unformattedCode);
            const formattedCode = generate(parsedCode, {
                format: {
                    indent: formattingOptions
                }
            });

            return formattedCode;
        } catch (error) {
            /** If we didn't manage to format script just return unformatted code and continue */
            return unformattedCode;
        }
    }
}