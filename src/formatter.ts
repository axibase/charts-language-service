import { FormattingOptions } from "vscode-languageserver-types";
import { LanguageFormattingOptions, NestedCodeFormatter } from "./nestedCodeFormatter";
import {
    BLOCK_COMMENT_END, BLOCK_COMMENT_START,
    BLOCK_SCRIPT_END, BLOCK_SCRIPT_START,
    ELSE_ELSEIF_REGEX, ENDKEYWORDS_WITH_LF,
    ONE_LINE_COMMENT, OUTDENTED_SECTIONS,
    OUTDENTED_STRUCTURES, RELATIONS_REGEXP,
    SETTING_DECLARATION, SPACES_AT_START
} from "./regExpressions";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { TextRange } from "./textRange";
import { isEmpty } from "./util";

interface Section {
    indent?: string;
    name?: string;
}

/**
 * Describes sections inside control structure
 */
interface InnerSection extends Section {
    hasSettingBefore?: boolean;
}

/** Document formatting options */
export const FORMATTING_OPTIONS: FormattingOptions = {
    insertSpaces: true,
    tabSize: 2
};

interface CommentData {
    lines: string[];
    minIndent: number;
}

/**
 * Language formatting configuration
 * languageId - language id
 * endRegex - regex specifying that language code block finished
 * getOptions - function computing language formatting options based on current indent
 */
interface LanguageConfiguration {
    languageId: string;
    endRegex: RegExp;
    getOptions(indent: string, tabSize: number): LanguageFormattingOptions;
}

/**
 * Dictionary used in languages syntax formatting
 */
const NestedLanguages = new Map<RegExp, LanguageConfiguration>([
    [BLOCK_SCRIPT_START, {
        endRegex: BLOCK_SCRIPT_END,
        getOptions: (indent: string, tabSize: number) => {
            return {
                adjustMultilineComment: true,
                base: (indent.length / tabSize) + 1,
                style: " ".repeat(tabSize)
            };
        },
        languageId: "js",
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

    /**
     * Collects sections inside keyword structure
     */
    private keywordSections: InnerSection[] = [];

    /**
     * Comment block lines and their minimal commmon indent
     */
    private commentsBuffer: CommentData = {
        lines: [],
        minIndent: Infinity
    };

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
            if (this.isCommentBlockStart(line)) {
                this.handleCommentBlock(line);
                continue;
            } else if (isEmpty(line)) {
                if (this.currentSection.name === "tags" && this.previousSection.name !== "widget") {
                    Object.assign(this.currentSection, this.previousSection);
                    if (this.shouldInsertBlankLineAfterTags()) {
                        this.insertBlankLineAfter();
                    }
                    this.decreaseIndent();
                }
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
                this.keywordSections = [];
            }
            this.formatControlStructure();
            this.alignControlStructure();
            this.indentLine();
            if (TextRange.isCloseAble(line) && this.shouldBeClosed()) {
                this.keywordsLevels.push(this.currentIndent.length / Formatter.BASE_INDENT_SIZE);
                this.lastKeywordIndent = this.currentIndent;
                this.increaseIndent();
                this.insideKeyword = true;
                /**
                 * We don't need blank line before else|elseif
                 */
                if (!ELSE_ELSEIF_REGEX.test(line)) {
                    this.insertBlankLineBefore();
                }
            }
        }

        this.handleEndLines();

        return this.formattedText.join("\n");
    }

    /**
     * Control structures (for|list|if|var|csv) will be aligned to parent section if possible
     */
    private alignControlStructure(line: string = this.getCurrentLine()): void {
        /**
         * It isn't block control structure or it has no parent section
         */
        if (!TextRange.isCloseAble(line) || !this.shouldBeClosed() || !this.lastAddedParent.indent) {
            return;
        }

        /**
         * If control structure is nested, only first level will be aligned to parent
         */
        const outdentCondition = OUTDENTED_STRUCTURES.test(line) && OUTDENTED_SECTIONS.test(this.currentSection.name);
        if (outdentCondition && !this.insideKeyword) {
            const depth: number = ResourcesProviderBase.sectionDepthMap[this.currentSection.name];
            this.setIndent(depth - 1);
        }
    }

    /**
     * Inserts blank line after keyword end if needed
     */
    private formatControlStructure(): void {
        const currentLine = this.getCurrentLine();
        /**
         * If `current` line is regular setting, then we need to check `previous formatted` line
         * Otherwise do nothing
         */
        if (currentLine === undefined || !SETTING_DECLARATION.test(currentLine)) {
            return;
        }

        /**
         * Check `previous formatted` line.
         * If it is keyword end, blank line should inserted between it and current line
         */
        const previousFormattedLine = this.formattedText[this.formattedText.length - 1];

        if (ENDKEYWORDS_WITH_LF.test(previousFormattedLine)) {
            this.insertBlankLineAfter();
        }
    }

    /**
     * Checks that line formatted before current exists and not empty
     */
    private get shouldInsertLineBefore(): boolean {
        const previousFormattedLine: string = this.formattedText[this.formattedText.length - 2];
        return previousFormattedLine !== undefined && !isEmpty(previousFormattedLine);
    }

    /**
     * We met a multiline block comment.
     * Single-line comments are formatted as regular settings
     */
    private isCommentBlockStart(line: string): boolean {
        return line.indexOf("/*") > -1 && !ONE_LINE_COMMENT.test(line);
    }

    /**
     * Determines if blank line after tags should be inserted
     */
    private shouldInsertBlankLineAfterTags(): boolean {
        const nextLine = this.lines[this.currentLine + 1];
        /** Next line is not empty OR undefined */
        return nextLine && !this.isSectionDeclaration(nextLine);
    }

    /**
     * Apply formatting rules for section declaration
     */
    private handleSectionDeclaration(): void {
        this.calculateSectionIndent();
        this.indentLine();
        this.increaseIndent();
        this.handleSectionInsideKeyword();
        this.insertLineBeforeSection();
    }

    /**
     * If section is inside keyword structure, push it to collection
     */
    private handleSectionInsideKeyword(): void {
        if (this.insideKeyword) {
            const previousFormattedLine = this.formattedText[this.formattedText.length - 2];
            const hasSettingBefore = SETTING_DECLARATION.test(previousFormattedLine);
            this.keywordSections.push(Object.assign(this.currentSection, { hasSettingBefore }));
        }
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
        const previousLine: string = this.lines[this.currentLine - 1];

        if (previousLine === undefined || !this.shouldInsertLineBefore) {
            return;
        }

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
            line = line.substring(0, start) + " " + line.substring(start).trimLeft();
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
        this.formattedText.push(this.currentIndent + this.checkSign(line.trim()));
    }

    /**
     * Format multiline block comment
     */
    private handleCommentBlock(line: string): void {
        const [, commentStart, setting] = line.match(BLOCK_COMMENT_START);

        /** Write comment start symbol */
        this.indentLine(commentStart);
        /** Push setting after comment start to line stream */
        if (!isEmpty(setting)) {
            this.lineStreamPush(setting);
        }
        line = this.nextLine();
        while (line !== undefined) {
            const commentEndMatch = line.match(BLOCK_COMMENT_END);
            if (commentEndMatch !== null) {
                let [, configSetting, commentEnd] = commentEndMatch;
                if (!isEmpty(configSetting)) {
                    this.pushCommentBuffer(configSetting);
                }
                this.dumpCommentBuffer();
                this.lineStreamPush(commentEnd);
                return;
            } else {
                this.pushCommentBuffer(line);
            }
            line = this.nextLine();
        }
    }

    /** Push line of comment block to buffer and calculate indent */
    private pushCommentBuffer(line: string): void {
        const indent = line.search(SPACES_AT_START);
        if (indent >= 0 && indent < this.commentsBuffer.minIndent) {
            this.commentsBuffer.minIndent = indent;
        }
        this.commentsBuffer.lines.push(line);
    }

    /** Write block comment data */
    private dumpCommentBuffer() {
        const { lines, minIndent } = this.commentsBuffer;
        this.increaseIndent();

        for (let line of lines) {
            this.formattedText.push(
                this.currentIndent + line.substring(minIndent).trimRight()
            );
        }
        this.decreaseIndent();

        /** Comment block finished */
        this.commentsBuffer = {
            lines: [],
            minIndent: Infinity
        };
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
     * Insert line to the config
     */
    private lineStreamPush(line: string): void {
        this.lines.splice(this.currentLine + 1, 0, line);
    }

    /**
     * Determines whether blank line should be inserted before setting inside control structure
     */
    private get noBlankLineBeforeSectionInKeyword(): boolean {
        return this.insideKeyword && this.keywordSections.length === 1 && !this.keywordSections[0].hasSettingBefore;
    }

    /**
     * Inserts blank line before section except for configuration
     */
    private insertLineBeforeSection(): void {
        if (this.currentSection.name === "configuration" || this.noBlankLineBeforeSectionInKeyword) {
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
