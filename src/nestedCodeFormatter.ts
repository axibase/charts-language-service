import { JSFormatter } from "./jsFormatter";

export interface LanguageFormatter {
    language: string;
    format(text: string, options: LanguageFormattingOptions): string;
}

export interface LanguageFormattingOptions {
    base?: number;
    style?: string;
}

export class NestedCodeFormatter {

    public static forLanguage(language: string): LanguageFormatter {
        switch (language) {
            case "js":
                return new JSFormatter();
        }
    }
}