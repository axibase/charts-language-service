import { Diagnostic } from "vscode-languageserver-types";
import { Config } from "./config";
import { lineFeedRequired, noMatching } from "./messageUtil";
import {
    BLOCK_SCRIPT_END,
    BLOCK_SCRIPT_START,
    BLOCK_SCRIPT_START_WITHOUT_LF,
    BLOCK_SQL_END,
    BLOCK_SQL_START,
    BLOCK_SQL_START_WITHOUT_LF,
    EXPR_END,
    EXPR_START,
    EXPR_START_WITHOUT_LF,
    IF_CONDITION_REGEX,
    ONE_LINE_SCRIPT,
    ONE_LINE_SQL
} from "./regExpressions";
import { TextRange } from "./textRange";
import { createDiagnostic, createRange } from "./util";

// TODO: move processing of other keywords here.
export class KeywordHandler {
    public diagnostics: Diagnostic[] = [];
    public keywordsStack: TextRange[];
    /**
     * True if section contains expr block.
     */
    public exprBlockIsDeclared: boolean = false;
    /**
     * Last if statement. Used to get/set settings in ifSettings.
     */
    public lastCondition?: string;
    private config: Config;
    private iterator: { next(): { value: string; done: boolean; }; };
    private foundKeyword: TextRange;

    constructor(config: Config, keywordsStack: TextRange[]) {
        this.keywordsStack = keywordsStack;
        this.config = config;
        this.iterator = config.iterator();
    }

    /**
     * Checks keyword for correctness: calls corresponding handler,
     * which adds diagnostic to `this.diagnostics` if necessary.
     * @param foundKeyword - Keyword to be processed.
     */
    public handle(foundKeyword: TextRange) {
        this.foundKeyword = foundKeyword;
        switch (foundKeyword.text) {
            case "expr": {
                this.blockHandler(EXPR_START, EXPR_END, EXPR_START_WITHOUT_LF);
                break;
            }
            case "if": {
                this.handleIf();
                break;
            }
            case "script": {
                this.blockHandler(BLOCK_SCRIPT_START, BLOCK_SCRIPT_END, BLOCK_SCRIPT_START_WITHOUT_LF, ONE_LINE_SCRIPT);
                break;
            }
            case "sql": {
                this.blockHandler(BLOCK_SQL_START, BLOCK_SQL_END, BLOCK_SQL_START_WITHOUT_LF, ONE_LINE_SQL);
                break;
            }
            default:
                throw new Error(`${foundKeyword.text} is not handled`);
        }

    }

    /**
     * Checks `if` condition syntax
     */
    public handleIf(): void {
        const line = this.config.getCurrentLine();
        const ifCondition = IF_CONDITION_REGEX.exec(line)[1];

        if (ifCondition.trim() === "") {
            this.diagnostics.push(
                createDiagnostic(this.foundKeyword.range, "If condition can not be empty")
            );
            return;
        }

        try {
            Function(`return ${ifCondition}`);
            this.setLastCondition();
        } catch (err) {
            this.diagnostics.push(createDiagnostic(createRange(
                line.indexOf(ifCondition),
                ifCondition.length,
                this.foundKeyword.range.start.line
            ), err.message));
        }
    }

    public setLastCondition() {
        this.lastCondition = `${this.config.currentLineNumber}${this.config.getCurrentLine()}`;
    }

    /**
     * Validates blocks, for example, `sql/endsql`, adds diagnostic to `this.diagnostics`, if:
     *  - there is no LF after block start;
     *  - there is no closing keyword.
     *
     * @param blockStart - Expression to match start of block.
     * @param blockEnd - Expression to match end of block.
     * @param blockStartWithoutLf - Expression to match start of block without LF character.
     * @param oneLineExpression - Expression to match the same setting in one line mode.
     */
    private blockHandler(blockStart: RegExp, blockEnd: RegExp,
                         blockStartWithoutLf: RegExp, oneLineExpression?: RegExp): void {
        const line = this.config.getCurrentLine();
        if (oneLineExpression && oneLineExpression.test(line)) {
            /**
             * The setting is one line, for example, `script = var a = 1;`.
             */
            return;
        }

        const keywordName = this.foundKeyword.text;
        const match = blockStartWithoutLf.exec(line);
        if (match !== null) {
            /**
             * LF is missed.
             */
            this.diagnostics.push(createDiagnostic(this.foundKeyword.range, lineFeedRequired(keywordName)));
            return;
        }

        let next = this.iterator.next();
        while (!next.done) {
            const currentLine = next.value;
            const blockStartWord = blockStart.exec(currentLine);
            if (blockStartWord) {
                /**
                 * There is a start of new block, but previous has not ended, blocks can not be nested.
                 */
                const nextFoundKeyword = new TextRange(keywordName,
                    createRange(blockStartWord.index, keywordName.length, this.config.currentLineNumber));
                this.keywordsStack.push(nextFoundKeyword);
                break;
            } else if (blockEnd.test(currentLine)) {
                /**
                 * Block is correct.
                 */
                if (keywordName === "expr") {
                    this.exprBlockIsDeclared = true;
                }
                return;
            }
            next = this.iterator.next();
        }
        this.diagnostics.push(createDiagnostic(this.foundKeyword.range, noMatching(keywordName, "end" + keywordName)));
    }

}
