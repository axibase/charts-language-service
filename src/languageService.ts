import { CompletionProvider, ResourcesProviderBase, Validator } from ".";

import { Position, TextDocument } from "vscode-languageserver-types";

export class LanguageService {
    private static resourcesProvider: ResourcesProviderBase;

    public static initialize(resourcesProvider: ResourcesProviderBase) {
        if (resourcesProvider === null) {
            throw new Error("Illegal operation");
        }
        LanguageService.resourcesProvider = resourcesProvider;
    }

    public static getResourcesProvider() {
        return LanguageService.resourcesProvider;
    }

    public static getCompletionProvider(textDocument: TextDocument, position: Position) {
        return new CompletionProvider(textDocument, position);
    }

    public static getValidator(text: string) {
        return new Validator(text);
    }
}
