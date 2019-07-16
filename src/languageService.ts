import { CompletionProvider, ResourcesProviderBase, Validator, Formatter } from ".";

import { Position, TextDocument, FormattingOptions } from "vscode-languageserver-types";

export class LanguageService {
    private static resourcesProvider: ResourcesProviderBase;

    public static initialize(resourcesProvider: ResourcesProviderBase) {
        LanguageService.resourcesProvider = resourcesProvider;
    }

    public static getResourcesProvider() {
        if (LanguageService.resourcesProvider === undefined) {
            throw new Error("LanguageService wasn't properly initialized with ResourcesProvider");
        }
        return LanguageService.resourcesProvider;
    }

    public static getCompletionProvider(textDocument: TextDocument, position: Position) {
        return new CompletionProvider(textDocument, position);
    }

    public static getValidator(text: string) {
        return new Validator(text);
    }

    public static getFormatter(text: string, formattingOptions: FormattingOptions) {
        return new Formatter(text, formattingOptions);
    }
}
