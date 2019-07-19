import { ResourcesProviderBase, CompletionProvider, Validator, Formatter } from ".";
import { TextDocument, Position, FormattingOptions } from "vscode-languageserver-types";
import { HoverProvider } from "./hoverProvider";

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

    public static getHoverProvider(document: TextDocument) {
        return new HoverProvider(document);
    }

    public static getFormatter(text: string, formattingOptions: FormattingOptions) {
        return new Formatter(text, formattingOptions);
    }
}
