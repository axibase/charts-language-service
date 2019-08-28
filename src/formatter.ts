import { FormattingOptions } from "vscode-languageserver-types";
import { BLOCK_SCRIPT_END, BLOCK_SCRIPT_START, RELATIONS_REGEXP, MULTILINE_COMMENT_START_REGEX, MULTILINE_COMMENT_END_REGEX, MULTILINE_COMMENT_REGEX } from "./regExpressions";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { TextRange } from "./textRange";
import { isEmpty } from "./util";
import { LanguageFormattingOptions, NestedCodeFormatter } from "./nestedCodeFormatter";

interface Section {
    indent?: string;
    name?: string;
}

/** Document formatting options */
export const FORMATTING_OPTIONS: FormattingOptions = {
    insertSpaces: true,
    tabSize: 2
};

/**
 * Language formatting configuration
 * languageId - language id
 * endRegex - regex specifying that language code block finished
 * getOptions - function computing language formatting options based on current indent
 */
interface LanguageConfiguration {
    languageId: string,
    endRegex: RegExp,
    getOptions(indent: string, tabSize: number): LanguageFormattingOptions
}

/**
 * Dictionary used in languages syntax formatting
 */
const NestedLanguages = new Map<RegExp, LanguageConfiguration>([
    [BLOCK_SCRIPT_START, {
        languageId: "js",
        endRegex: BLOCK_SCRIPT_END,
        getOptions: (indent: string, tabSize: number) => {
            return {
                base: (indent.length / tabSize) + 1,
                style: " ".repeat(tabSize),
                adjustMultilineComment: true
            }
        }
    }]
]);

/**
 * Returns document formatted according to specified rules
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
     * Number of blank lines at the end of config
     */
    private readonly blankLinesAtEnd: number = 2;
    /**
     * Current line number
     */
    private currentLine: number = 0;

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
    private lines: string[];
    /**
     * Contains the result of the last executed regular expression
     */
    private match: RegExpExecArray | null | undefined;
    /**
     * Contains options from user's settings which are used to format document
     */
    private readonly options: FormattingOptions;

    /**
     * Recreated config text formatted according to rules
     */
    private formattedText: string[] = [];
    /**
     * Language of current code block
     */
    private currentLanguageConfiguration: LanguageConfiguration = null;
    /**
     * Indent of last keyword.
     */
    private lastKeywordIndent: string = "";

    private lastAddedParent: Section = {};
    private previousSection: Section = {};
    private currentSection: Section = {};

    private insideCommentBlock: boolean = false;

    public constructor(formattingOptions: FormattingOptions) {
        this.options = formattingOptions;
    }

    /**
     * Reads the document line by line and calls corresponding formatting functions
     * @returns whole formatted document
     */
    public format(text: string): string {
        this.lines = text.split("\n");
        for (let line = this.getLine(this.currentLine); line !== void 0; line = this.nextLine()) {
            if (isEmpty(line)) {
                if (this.insideSectionException()) {
                    Object.assign(this.currentSection, this.previousSection);
                    if (this.shouldInsertBlankLineInsideSection()) {
                        this.insertBlankLineAfter()
                    }
                    this.decreaseIndent();
                }
                continue;
            } else if (this.isCommentBlock(line) || this.insideCommentBlock) {
                this.handleCommentBlock(line);
                continue;
            } else if (this.isSectionDeclaration(line)) {
                this.handleSectionDeclaration();
                continue;
            } else if (this.isCodeBlock(line)) {
                this.handleCodeBlock();
                continue;
            }

            if (TextRange.isClosing(line)) {
                const stackHead: number | undefined = this.keywordsLevels.pop();
                this.setIndent(stackHead);
                this.insideKeyword = false;
                this.lastKeywordIndent = "";
            }
            this.indentLine(this.checkSign(line));
            if (TextRange.isCloseAble(line) && this.shouldBeClosed()) {
                this.keywordsLevels.push(this.currentIndent.length / Formatter.BASE_INDENT_SIZE);
                this.lastKeywordIndent = this.currentIndent;
                this.increaseIndent();
                this.insideKeyword = true;
            }
        }

        this.handleEndLines();

        return this.formattedText.join("\n");
    }

    /**
     * We are inside tags/column section
     * They may contain empty line between their own and parent-level settings
     */
    private insideSectionException(): boolean {
        return (this.currentSection.name === "tags" && this.previousSection.name !== "widget")
        || this.currentSection.name === "column";
    }

    /**
     * Determines if blank line after tags/column should be inserted
     */
    private shouldInsertBlankLineInsideSection(): boolean {
        const nextLine = this.lines[this.currentLine + 1];
        /** Next line is not empty OR undefined */
        return nextLine && !this.isSectionDeclaration(nextLine)
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
     * Apply formatting rules for code block
     */
    private handleCodeBlock(): void {
        this.indentLine();
        this.formatCode();
        this.indentLine();
    }

    /**
     * Determines by regex is line a start of code block
     * @param line 
     */
    private isCodeBlock(line: string): boolean {
        for (let [regex, configuration] of NestedLanguages.entries()) {
            if (regex.test(line)) {
                this.currentLanguageConfiguration = configuration;
                return true;
            }
        }

        return false;
    }

    /**
     * Format code of currently recognized language
     */
    private formatCode(): void {
        let line = this.nextLine();
        const { endRegex, languageId, getOptions } = this.currentLanguageConfiguration;

        // Get content between script tags
        const buffer = [];
        while (line !== undefined && !endRegex.test(line)) {
            buffer.push(line);
            line = this.nextLine();
        }

        if (!buffer.length) {
            return;
        }
        const unformattedCode = buffer.join("\n");

        this.formattedText.push(
            NestedCodeFormatter.forLanguage(languageId).format(
                unformattedCode, getOptions(this.currentIndent, this.options.tabSize)
            )
        );

        this.currentLanguageConfiguration = null;
    }

    /**
     * Append specified number of blank lines to the end of the document
     */
    private handleEndLines(): void {
        this.formattedText.push(...new Array(this.blankLinesAtEnd).fill(""));
    }

    /**
     * Inserts blank line after current line
     */
    private insertBlankLineAfter(): void {
        this.formattedText.push("");
    }

    /**
     * Inserts blank line before current line
     */
    private insertBlankLineBefore(): void {
        this.formattedText.splice(this.formattedText.length - 1, 0, "");
    }

    /**
     * Checks how many spaces are between the sign and setting name
     */
    private checkSign(line: string): string {
        const match: RegExpExecArray | null = RELATIONS_REGEXP.exec(line);
        if (match === null) {
            return line;
        }

        const [, declaration, spacesBefore, sign, spacesAfter] = match;
        if (spacesBefore !== " ") {
            line = line.substr(0, declaration.length) + " " + line.substr(line.indexOf(sign));
        }
        if (spacesAfter !== " ") {
            const start = line.indexOf(sign) + sign.length;
            line = line.substring(0, start) + " " + line.substring(start);
        }

        return line;
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
     * Sets correct indent to line
     * @param line to indent
     */
    private indentLine(line: string = this.getCurrentLine()): void {
        this.formattedText.push(this.currentIndent + line.trim())
    }

    private isCommentBlock(line): boolean {
        return MULTILINE_COMMENT_REGEX.test(line) || MULTILINE_COMMENT_END_REGEX.test(line) || MULTILINE_COMMENT_START_REGEX.test(line);
    }

    private handleCommentBlock(line: string):void {
        if (MULTILINE_COMMENT_REGEX.test(line)) {
            this.indentLine(line);
        } else if (MULTILINE_COMMENT_START_REGEX.test(line)) {
            const match = line.match(MULTILINE_COMMENT_START_REGEX);
            const comment = match[1];
            const setting = match[2];
            this.formattedText.push(this.currentIndent + comment.trim());
            this.increaseIndent();
            if (setting && !isEmpty(setting)) {
                this.formattedText.push(this.currentIndent + setting.trim());
            }
            this.insideCommentBlock = true;
        } else if (MULTILINE_COMMENT_END_REGEX.test(line)) {
            const match = line.match(MULTILINE_COMMENT_END_REGEX);
            const comment = match[2];
            const setting = match[1];
            if (setting && !isEmpty(setting)) {
                this.formattedText.push(this.currentIndent + setting.trim());
            }
            this.decreaseIndent();
            this.formattedText.push(this.currentIndent + comment.trim());
            this.insideCommentBlock = false;
        } else {
            this.indentLine(line);
        }
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

        this.insertBlankLineBefore();
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
