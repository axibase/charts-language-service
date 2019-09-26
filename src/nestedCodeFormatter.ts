import { FormatOptions } from "escodegen";
import { JSFormatter } from "./jsFormatter";

export interface LanguageFormatter {
    language: string;
    format(text: string, options: FormatOptions): string;
}

export const DEFAULT_CODE_FORMATTING_OPTIONS: FormatOptions = {
    indent: {
        adjustMultilineComment: false,
        base: 0,
        style: "    "
    },
    newline: "\n",
    semicolons: true,
};

export class NestedCodeFormatter {

    public static forLanguage(language: string): LanguageFormatter {
        switch (language) {
            case "js":
                return new JSFormatter();
        }
    }
}
