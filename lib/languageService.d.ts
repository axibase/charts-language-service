import { ResourcesProviderBase, CompletionProvider, Validator, Formatter } from ".";
import { TextDocument, Position, FormattingOptions } from "vscode-languageserver-types";
import { HoverProvider } from "./hoverProvider";
export declare class LanguageService {
    private static resourcesProvider;
    static initialize(resourcesProvider: ResourcesProviderBase): void;
    static getResourcesProvider(): ResourcesProviderBase;
    static getCompletionProvider(textDocument: TextDocument, position: Position): CompletionProvider;
    static getValidator(text: string): Validator;
    static getHoverProvider(document: TextDocument): HoverProvider;
    static getFormatter(text: string, formattingOptions: FormattingOptions): Formatter;
}
