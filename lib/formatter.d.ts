import { FormattingOptions, TextEdit } from "vscode-languageserver-types";
/**
 * Formats the document
 */
export declare class Formatter {
    /**
     * Number of spaces between parent and child indents
     */
    private static readonly BASE_INDENT_SIZE;
    /**
     * Currently used indent
     */
    private currentIndent;
    /**
     * Current line number
     */
    private currentLine;
    /**
     * Created TextEdits
     */
    private readonly edits;
    /**
     * A flag used to determine are we inside of a keyword or not
     */
    private insideKeyword;
    /**
     * Array containing indents at start of keywords to restore them later
     */
    private readonly keywordsLevels;
    /**
     * Caches last line returned by getLine() to avoid several calls to `removeExtraSpaces`
     * and improve performance
     */
    private lastLine?;
    /**
     * Contains the number of last returned by getLine() line.
     */
    private lastLineNumber?;
    /**
     * Contains all lines of the current text document
     */
    private readonly lines;
    /**
     * Contains the result of the last executed regular expression
     */
    private match;
    /**
     * Contains options from user's settings which are used to format document
     */
    private readonly options;
    /**
     * Indent of last keyword.
     */
    private lastKeywordIndent;
    private lastAddedParent;
    private previousSection;
    private currentSection;
    constructor(text: string, formattingOptions: FormattingOptions);
    /**
     * Reads the document line by line and calls corresponding formatting functions
     * @returns array of text edits to properly format document
     */
    lineByLine(): TextEdit[];
    /**
     * Formats JavaScript content inside script tags
     */
    private formatScript;
    /**
     * Checks how many spaces are between the sign and setting name
     */
    private checkSign;
    /**
     * Calculates current indent based on current state
     */
    private calculateSectionIndent;
    /**
     * Creates a text edit if the current indent is incorrect
     */
    private checkIndent;
    /**
     * Decreases the current indent by one
     */
    private decreaseIndent;
    /**
     * @returns current line
     */
    private getCurrentLine;
    /**
     * Caches last returned line in this.lastLineNumber
     * To prevent several calls of removeExtraSpaces
     * @param i the required line number
     * @returns the required line
     */
    private getLine;
    /**
     * Gets next line of text document
     */
    private nextLine;
    /**
     * Increases current indent by one
     */
    private increaseIndent;
    /**
     * @returns true, if current line is section declaration
     */
    private isSectionDeclaration;
    /**
     * Removes trailing spaces (at the end and at the beginning)
     * @param line the target line
     */
    private removeExtraSpaces;
    /**
     * Sets current indent to the provided
     * @param newIndentLenth the new indent
     */
    private setIndent;
    /**
     * @returns true if current keyword should be closed
     */
    private shouldBeClosed;
}
