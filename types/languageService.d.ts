import { CompletionProvider } from "./completionProvider";
import { Formatter } from "./formatter";
import { HoverProvider } from "./hoverProvider";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { Validator } from "./validator";
import { TextDocument, FormattingOptions, Position } from "vscode-languageserver-types";
export declare class LanguageService {
    private static resourcesProvider;
    static initialize(resourcesProvider: ResourcesProviderBase): void;
    static getResourcesProvider(): ResourcesProviderBase;
    static getCompletionProvider(textDocument: TextDocument, position: Position): CompletionProvider;
    static getValidator(text: string): Validator;
    static getHoverProvider(document: TextDocument): HoverProvider;
    static getFormatter(text: string, formattingOptions: FormattingOptions): Formatter;
}
