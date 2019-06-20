import { CompletionProvider, ResourcesProviderBase, Validator } from ".";

import { Position, TextDocument } from "vscode-languageserver-types";

export class LanguageService {

    public static initialize(resourcesProvider: ResourcesProviderBase) {
        if (resourcesProvider != null) {
            throw new Error("Illegal operation");
        }
        this.resourcesProvider = resourcesProvider;
    }

    public static getResourcesProvider() {
        return LanguageService.resourcesProvider;
    }
    private static resourcesProvider: ResourcesProviderBase;

    public getCompletionProvider(textDocument: TextDocument, position: Position) {
        return new CompletionProvider(textDocument, position, LanguageService.resourcesProvider);
    }

    public getValidator(text: string) {
        return new Validator(text, LanguageService.resourcesProvider);
    }
}
