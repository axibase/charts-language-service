import { FormattingOptions, Position, TextDocument } from "vscode-languageserver-types";
import { CompletionProvider } from "./completionProvider";
import { Formatter } from "./formatter";
import { HoverProvider } from "./hoverProvider";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { Validator } from "./validator";

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
        let externals = this.getResourcesProvider().getExternalValueCompleters();
        return new CompletionProvider(textDocument, position, externals);
    }

    public static getValidator(text: string) {
        return new Validator(text);
    }

    public static getHoverProvider(document: TextDocument) {
        return new HoverProvider(document);
    }

    public static getFormatter(formattingOptions: FormattingOptions) {
        return new Formatter(formattingOptions);
    }
}
