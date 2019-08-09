import { Diagnostic, FormattingOptions, Hover, Position, TextEdit } from "vscode-languageserver-types";
/**
 * Contains a test case and executes the test
 */
export declare class Test {
    /**
     * The expected result of the target function
     */
    private readonly expected;
    /**
     * The name of the test. Displayed in tests list after the execution
     */
    private readonly name;
    /**
     * Formatting options used in Formatter tests
     */
    private readonly options?;
    /**
     * Position of Hover used in hover tests
     */
    private readonly position?;
    /**
     * Text of the test document
     */
    private readonly text;
    private readonly document;
    constructor(name: string, text: string, expected: Diagnostic[] | TextEdit[] | Hover | string[], options?: FormattingOptions, position?: Position);
    /**
     * Tests Formatter
     */
    formatTest(): void;
    /**
     * Tests Validator
     */
    validationTest(): void;
    /**
     * Tests Hover
     */
    hoverTest(): void;
    /**
     * Tests CompletionProvider
     */
    completionTest(): void;
}
