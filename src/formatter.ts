import { generate } from "escodegen";
import { parseScript } from "esprima";
import { FormattingOptions, Range, TextEdit, Position } from "vscode-languageserver-types";
import { BLOCK_SCRIPT_END, BLOCK_SCRIPT_START, RELATIONS_REGEXP } from "./regExpressions";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { TextRange } from "./textRange";
import { createRange, isEmpty } from "./util";

interface Section {
    indent?: string;
    name?: string;
}

/** Extended formatting options, supporting blank lines formatting possibility */
export interface ExtendedFormattingOptions extends FormattingOptions {
    blankLinesAtEnd?: number;
}

/** Document formatting options */
export const FORMATTING_OPTIONS = (blankLinesAtEnd: number = 0): ExtendedFormattingOptions => {
    const TAB_SIZE: number = 2;
    const INSERT_SPACES: boolean = true;

    return Object.assign(FormattingOptions.create(TAB_SIZE, INSERT_SPACES), { blankLinesAtEnd });
};

/**
 * Formats the document
 */
export class Formatter {
    /**
     * Number of spaces between parent and child indents
     */
    private static readonly BASE_INDENT_SIZE: number = 2;
    /**
     * Currently used indent
     */
    private currentIndent: string = "";
    /**
     * Current line number
     */
    private currentLine: number = 0;
    /**
     * Created TextEdits
     */
    private readonly edits: TextEdit[] = [];
    /**
     * A flag used to determine are we inside of a keyword or not
     */
    private insideKeyword: boolean = false;
    /**
     * Array containing indents at start of keywords to restore them later
     */
    private readonly keywordsLevels: number[] = [];
    /**
     * Caches last line returned by getLine() to avoid several calls to `removeExtraSpaces`
     * and improve performance
     */
    private lastLine?: string;
    /**
     * Contains the number of last returned by getLine() line.
     */
    private lastLineNumber?: number;
    /**
     * Contains all lines of the current text document
     */
    private readonly lines: string[];
    /**
     * Contains the result of the last executed regular expression
     */
    private match: RegExpExecArray | null | undefined;
    /**
     * Contains options from user's settings which are used to format document
     */
    private readonly options: ExtendedFormattingOptions;

    private formattedText: string[] = [];
    /**
     * Indent of last keyword.
     */
    private lastKeywordIndent: string = "";

    private lastAddedParent: Section = {};
    private previousSection: Section = {};
    private currentSection: Section = {};

    public constructor(text: string, formattingOptions: ExtendedFormattingOptions) {
        this.options = formattingOptions;
        this.lines = text.split("\n");
    }

    /**
     * Reads the document line by line and calls corresponding formatting functions
     * @returns array of text edits to properly format document
     */
    public lineByLine(): TextEdit[] {
        for (let line = this.getLine(this.currentLine); line !== void 0; line = this.nextLine()) {
            if (isEmpty(line)) {
                if (this.currentSection.name === "tags" && this.previousSection.name !== "widget") {
                    Object.assign(this.currentSection, this.previousSection);
                    this.decreaseIndent();
                }
                continue;
            } else if (this.isSectionDeclaration(line)) {
                this.handleSectionDeclaration();
                continue;
            } else if (BLOCK_SCRIPT_START.test(line)) {
                this.handleScriptBlock();
                continue;
            } else {
                this.checkSign();
            }
            if (TextRange.isClosing(line)) {
                const stackHead: number | undefined = this.keywordsLevels.pop();
                this.setIndent(stackHead);
                this.insideKeyword = false;
                this.lastKeywordIndent = "";
            }
            this.indentLine();
            if (TextRange.isCloseAble(line) && this.shouldBeClosed()) {
                this.keywordsLevels.push(this.currentIndent.length / Formatter.BASE_INDENT_SIZE);
                this.lastKeywordIndent = this.currentIndent;
                this.increaseIndent();
                this.insideKeyword = true;
            }
        }

        this.handleEndLines();

        this.edits.length = 0;
        this.edits.push(
            TextEdit.replace(
                Range.create(
                    Position.create(0, 0),
                    Position.create(this.lines.length - 1, this.lines[this.lines.length - 1].length)
                ),
                this.formattedText.join("\n")
            )
        );

        console.log(this.edits)

        return this.edits;
    }

    /**
     * Apply formatting rules for section declaration
     */
    private handleSectionDeclaration(): void {
        this.calculateSectionIndent();
        this.indentLine();
        this.increaseIndent();
        this.insertLineBeforeSection();
    }

    /**
     * Apply formatting rules for script-endscript block
     */
    private handleScriptBlock(): void {
        this.indentLine();
        this.formatScript();
        this.indentLine();
    }

    private handleEndLines(): void {
        if (this.options.blankLinesAtEnd) {
            this.formattedText.push("\n".repeat(this.options.blankLinesAtEnd))
        }
    }

    /**
     * Formats JavaScript content inside script tags
     */
    private formatScript(): void {
        let line = this.nextLine();
        const startLine = this.currentLine;

        // Get content between script tags
        const buffer = [];
        while (line !== undefined && !BLOCK_SCRIPT_END.test(line)) {
            buffer.push(line);
            line = this.nextLine();
        }

        if (!buffer.length) {
            return;
        }
        const content = buffer.join("\n");

        try {
            /** Parse and format JavaScript */
            const parsedCode = parseScript(content);
            const formattedCode = generate(parsedCode, {
                format: {
                    indent: {
                        base: (this.currentIndent.length / this.options.tabSize) + 1,
                        style: " ".repeat(this.options.tabSize)
                    }
                }
            });

            this.formattedText.push(formattedCode);
        } catch (error) {
            /** If we didn't manage to format script just continue */
            this.formattedText.push(content);
        }
    }

    /**
     * Checks how many spaces are between the sign and setting name
     */
    private checkSign(): void {
        const line: string = this.getCurrentLine();
        const match: RegExpExecArray | null = RELATIONS_REGEXP.exec(line);
        if (match === null) {
            return;
        }
        const [, declaration, spacesBefore, sign, spacesAfter] = match;
        if (spacesBefore !== " ") {
            this.edits.push(
                TextEdit.replace(
                    createRange(declaration.length, spacesBefore.length, this.currentLine),
                    " ",
                ),
            );
        }
        if (spacesAfter !== " ") {
            const start = line.indexOf(sign) + sign.length;
            this.edits.push(
                TextEdit.replace(
                    createRange(start, spacesAfter.length, this.currentLine),
                    " ",
                ),
            );
        }
    }

    /**
     * Calculates current indent based on current state
     */
    private calculateSectionIndent(): void {
        if (!this.match) {
            throw new Error("this.match or/and this.current is not defined in calculateIndent");
        }
        Object.assign(this.previousSection, this.currentSection);
        this.currentSection.name = this.match[2];
        const depth: number = ResourcesProviderBase.sectionDepthMap[this.currentSection.name];
        switch (depth) {
            case 0: // [configuration]
            case 1: // [group]
            case 2: { // [widget]
                this.setIndent(depth - 1);
                this.lastAddedParent = { name: this.currentSection.name, indent: this.currentIndent };
                break;
            }
            case 3: { // [series], [dropdown], [column], ...
                if (ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                    this.currentIndent = this.previousSection.indent;
                    this.increaseIndent();
                } else {
                    /**
                     *     [tags]
                     *       ...
                     *  [series]
                     *    ...
                     */
                    this.setIndent(depth - 1);
                }
                if (this.insideKeyword && this.currentIndent.length <= this.lastKeywordIndent.length) {
                    this.currentIndent = this.lastKeywordIndent;
                }
                if (["series", "dropdown"].includes(this.currentSection.name)) {
                    /**
                     * Change parent only if current is [series] or [dropdown],
                     * because only they could have child sections ([tag/tags] or [option]).
                     */
                    this.lastAddedParent = { name: this.currentSection.name, indent: this.currentIndent };
                }
                break;
            }
            case 4: { // [option], [properties], [tags]
                if (ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                    this.currentIndent = this.previousSection.indent;
                } else {
                    this.currentIndent = this.lastAddedParent.indent;
                }
                this.increaseIndent();
                break;
            }
        }
        this.currentSection.indent = this.currentIndent;
        if (this.insideKeyword) {
            this.increaseIndent();
        }
    }

    /**
     * Sets line current indent
     */
    private indentLine(): void {
        this.formattedText.push(this.currentIndent + this.getCurrentLine().trim())
    }

    /**
     * Decreases the current indent by one
     */
    private decreaseIndent(): void {
        if (this.currentIndent.length === 0) {
            return;
        }
        let newLength: number = this.currentIndent.length;
        if (this.options.insertSpaces) {
            newLength -= this.options.tabSize;
        } else {
            newLength--;
        }
        this.currentIndent = this.currentIndent.substring(0, newLength);
    }

    /**
     * @returns current line
     */
    private getCurrentLine(): string {
        const line: string | undefined = this.getLine(this.currentLine);
        if (line === undefined) {
            throw new Error("this.currentLine points to nowhere");
        }

        return line;
    }

    /**
     * Caches last returned line in this.lastLineNumber
     * To prevent several calls of removeExtraSpaces
     * @param i the required line number
     * @returns the required line
     */
    private getLine(i: number): string | undefined {
        if (!this.lastLine || this.lastLineNumber !== i) {
            let line: string | undefined = this.lines[i];
            if (line === undefined) {
                return undefined;
            }
            this.lastLine = line;
            this.lastLineNumber = i;
        }

        return this.lastLine;
    }

    /**
     * Gets next line of text document
     */
    private nextLine(): string | undefined {
        return this.getLine(++this.currentLine);
    }

    /**
     * Inserts blank line before section except for configuration
     */
    private insertLineBeforeSection(): void {
        if (this.currentSection.name === "configuration") {
            return;
        }

        this.formattedText.splice(this.formattedText.length - 1, 0, "");
    }

    /**
     * Increases current indent by one
     */
    private increaseIndent(): void {
        let addition: string = "\t";
        if (this.options.insertSpaces) {
            addition = Array(this.options.tabSize)
                .fill(" ")
                .join("");
        }
        this.currentIndent += addition;
    }

    /**
     * @returns true, if line is section declaration
     */
    private isSectionDeclaration(line: string): boolean {
        this.match = /(^\s*)\[([a-z]+)\]/.exec(line);

        return this.match !== null;
    }

    /**
     * Sets current indent to the provided
     * @param newIndentLength the new indent
     */
    private setIndent(newIndentLength: number = 0): void {
        let newIndent = "";
        for (; newIndentLength > 0; newIndentLength--) {
            newIndent += "  ";
        }
        this.currentIndent = newIndent;
    }

    /**
     * @returns true if current keyword should be closed
     */
    private shouldBeClosed(): boolean {
        let line: string | undefined = this.getCurrentLine();
        // If keyword supports unclosed syntax no need to check further
        if (TextRange.canBeUnclosed(line)) {
            return false;
        }
        this.match = /^[ \t]*((?:var|list|sql|expr)|script[\s\t]*$)/.exec(line);
        if (!this.match) {
            return true;
        }
        switch (this.match[1]) {
            case "var": {
                if (/=\s*(\[|\{)(|.*,)\s*$/m.test(line)) {
                    return true;
                }
                break;
            }
            case "list": {
                if (/(=|,)[ \t]*$/m.test(line)) {
                    return true;
                }
                break;
            }
            default:
                return true;
        }
    }
}
