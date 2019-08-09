(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "escodegen", "esprima", "vscode-languageserver-types", "./regExpressions", "./textRange", "./util", "./resourcesProviderBase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const escodegen_1 = require("escodegen");
    const esprima_1 = require("esprima");
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const regExpressions_1 = require("./regExpressions");
    const textRange_1 = require("./textRange");
    const util_1 = require("./util");
    const resourcesProviderBase_1 = require("./resourcesProviderBase");
    /**
     * Formats the document
     */
    class Formatter {
        constructor(text, formattingOptions) {
            /**
             * Currently used indent
             */
            this.currentIndent = "";
            /**
             * Current line number
             */
            this.currentLine = 0;
            /**
             * Created TextEdits
             */
            this.edits = [];
            /**
             * A flag used to determine are we inside of a keyword or not
             */
            this.insideKeyword = false;
            /**
             * Array containing indents at start of keywords to restore them later
             */
            this.keywordsLevels = [];
            /**
             * Indent of last keyword.
             */
            this.lastKeywordIndent = "";
            this.lastAddedParent = {};
            this.previousSection = {};
            this.currentSection = {};
            this.options = formattingOptions;
            this.lines = text.split("\n");
        }
        /**
         * Reads the document line by line and calls corresponding formatting functions
         * @returns array of text edits to properly format document
         */
        lineByLine() {
            for (let line = this.getLine(this.currentLine); line !== void 0; line = this.nextLine()) {
                if (util_1.isEmpty(line)) {
                    if (this.currentSection.name === "tags" && this.previousSection.name !== "widget") {
                        Object.assign(this.currentSection, this.previousSection);
                        this.decreaseIndent();
                    }
                    continue;
                }
                else if (this.isSectionDeclaration()) {
                    this.calculateSectionIndent();
                    this.checkIndent();
                    this.increaseIndent();
                    continue;
                }
                else if (regExpressions_1.BLOCK_SCRIPT_START.test(line)) {
                    this.checkIndent();
                    this.formatScript();
                    this.checkIndent();
                    continue;
                }
                else {
                    this.checkSign();
                }
                if (textRange_1.TextRange.isClosing(line)) {
                    const stackHead = this.keywordsLevels.pop();
                    this.setIndent(stackHead);
                    this.insideKeyword = false;
                    this.lastKeywordIndent = "";
                }
                this.checkIndent();
                if (textRange_1.TextRange.isCloseAble(line) && this.shouldBeClosed()) {
                    this.keywordsLevels.push(this.currentIndent.length / Formatter.BASE_INDENT_SIZE);
                    this.lastKeywordIndent = this.currentIndent;
                    this.increaseIndent();
                    this.insideKeyword = true;
                }
            }
            return this.edits;
        }
        /**
         * Formats JavaScript content inside script tags
         */
        formatScript() {
            let line = this.nextLine();
            const startLine = this.currentLine;
            // Get content between script tags
            const buffer = [];
            while (line !== undefined && !regExpressions_1.BLOCK_SCRIPT_END.test(line)) {
                buffer.push(line);
                line = this.nextLine();
            }
            if (!buffer.length) {
                return;
            }
            const content = buffer.join("\n");
            try {
                /** Parse and format JavaScript */
                const parsedCode = esprima_1.parseScript(content);
                const formattedCode = escodegen_1.generate(parsedCode, {
                    format: {
                        indent: {
                            base: (this.currentIndent.length / this.options.tabSize) + 1,
                            style: " ".repeat(this.options.tabSize)
                        }
                    }
                });
                const endLine = this.currentLine - 1;
                const endCharacter = this.getLine(endLine).length;
                this.edits.push(vscode_languageserver_types_1.TextEdit.replace(vscode_languageserver_types_1.Range.create(startLine, 0, endLine, endCharacter), formattedCode));
            }
            catch (error) {
                /** If we didn't manage to format script just continue */
            }
        }
        /**
         * Checks how many spaces are between the sign and setting name
         */
        checkSign() {
            const line = this.getCurrentLine();
            const match = regExpressions_1.RELATIONS_REGEXP.exec(line);
            if (match === null) {
                return;
            }
            const [, declaration, spacesBefore, sign, spacesAfter] = match;
            if (spacesBefore !== " ") {
                this.edits.push(vscode_languageserver_types_1.TextEdit.replace(util_1.createRange(declaration.length, spacesBefore.length, this.currentLine), " "));
            }
            if (spacesAfter !== " ") {
                const start = line.indexOf(sign) + sign.length;
                this.edits.push(vscode_languageserver_types_1.TextEdit.replace(util_1.createRange(start, spacesAfter.length, this.currentLine), " "));
            }
        }
        /**
         * Calculates current indent based on current state
         */
        calculateSectionIndent() {
            if (!this.match) {
                throw new Error("this.match or/and this.current is not defined in calculateIndent");
            }
            Object.assign(this.previousSection, this.currentSection);
            this.currentSection.name = this.match[2];
            const depth = resourcesProviderBase_1.ResourcesProviderBase.sectionDepthMap[this.currentSection.name];
            switch (depth) {
                case 0: // [configuration]
                case 1: // [group]
                case 2: { // [widget]
                    this.setIndent(depth - 1);
                    this.lastAddedParent = { name: this.currentSection.name, indent: this.currentIndent };
                    break;
                }
                case 3: { // [series], [dropdown], [column], ...
                    if (resourcesProviderBase_1.ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                        this.currentIndent = this.previousSection.indent;
                        this.increaseIndent();
                    }
                    else {
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
                    if (resourcesProviderBase_1.ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                        this.currentIndent = this.previousSection.indent;
                    }
                    else {
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
         * Creates a text edit if the current indent is incorrect
         */
        checkIndent() {
            this.match = /(^\s*)\S/.exec(this.getCurrentLine());
            if (this.match && this.match[1] !== this.currentIndent) {
                const indent = this.match[1];
                this.edits.push(vscode_languageserver_types_1.TextEdit.replace(vscode_languageserver_types_1.Range.create(this.currentLine, 0, this.currentLine, indent.length), this.currentIndent));
            }
        }
        /**
         * Decreases the current indent by one
         */
        decreaseIndent() {
            if (this.currentIndent.length === 0) {
                return;
            }
            let newLength = this.currentIndent.length;
            if (this.options.insertSpaces) {
                newLength -= this.options.tabSize;
            }
            else {
                newLength--;
            }
            this.currentIndent = this.currentIndent.substring(0, newLength);
        }
        /**
         * @returns current line
         */
        getCurrentLine() {
            const line = this.getLine(this.currentLine);
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
        getLine(i) {
            if (!this.lastLine || this.lastLineNumber !== i) {
                let line = this.lines[i];
                if (line === undefined) {
                    return undefined;
                }
                this.removeExtraSpaces(line);
                this.lastLine = line;
                this.lastLineNumber = i;
            }
            return this.lastLine;
        }
        /**
         * Gets next line of text document
         */
        nextLine() {
            return this.getLine(++this.currentLine);
        }
        /**
         * Increases current indent by one
         */
        increaseIndent() {
            let addition = "\t";
            if (this.options.insertSpaces) {
                addition = Array(this.options.tabSize)
                    .fill(" ")
                    .join("");
            }
            this.currentIndent += addition;
        }
        /**
         * @returns true, if current line is section declaration
         */
        isSectionDeclaration() {
            this.match = /(^\s*)\[([a-z]+)\]/.exec(this.getCurrentLine());
            return this.match !== null;
        }
        /**
         * Removes trailing spaces (at the end and at the beginning)
         * @param line the target line
         */
        removeExtraSpaces(line) {
            const match = / (\s +) $ /.exec(line);
            if (match) {
                this.edits.push(vscode_languageserver_types_1.TextEdit.replace(vscode_languageserver_types_1.Range.create(this.currentLine, line.length - match[1].length, this.currentLine, line.length), ""));
            }
        }
        /**
         * Sets current indent to the provided
         * @param newIndentLength the new indent
         */
        setIndent(newIndentLength = 0) {
            let newIndent = "";
            for (; newIndentLength > 0; newIndentLength--) {
                newIndent += "  ";
            }
            this.currentIndent = newIndent;
        }
        /**
         * @returns true if current keyword should be closed
         */
        shouldBeClosed() {
            let line = this.getCurrentLine();
            // If keyword supports unclosed syntax no need to check further
            if (textRange_1.TextRange.canBeUnclosed(line)) {
                return false;
            }
            this.match = /^[ \t]*((?:var|list|sql)|script[\s\t]*$)/.exec(line);
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
                default: return true;
            }
            return false;
        }
    }
    /**
     * Number of spaces between parent and child indents
     */
    Formatter.BASE_INDENT_SIZE = 2;
    exports.Formatter = Formatter;
});
