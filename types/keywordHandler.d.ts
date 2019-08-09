import { Diagnostic } from "vscode-languageserver-types";
import { TextRange } from "./textRange";
export declare class KeywordHandler {
    diagnostics: Diagnostic[];
    keywordsStack: TextRange[];
    constructor(keywordsStack: TextRange[]);
    handleSql(line: string, foundKeyword: TextRange): void;
    /**
     * Checks `if` condition syntax
     */
    handleIf(line: string, foundKeyword: TextRange): void;
    handleScript(line: string, foundKeyword: TextRange): void;
}
