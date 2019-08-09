import { Diagnostic } from "vscode-languageserver-types";
import { lineFeedRequired } from "./messageUtil";
import {
    BLOCK_SCRIPT_START_WITHOUT_LF,
    BLOCK_SQL_START_WITHOUT_LF,
    ONE_LINE_SCRIPT,
    ONE_LINE_SQL
} from "./regExpressions";
import { TextRange } from "./textRange";
import { createDiagnostic, createRange } from "./util";

export class KeywordHandler {
    public diagnostics: Diagnostic[] = [];
    public keywordsStack: TextRange[];

    constructor(keywordsStack: TextRange[]) {
        this.keywordsStack = keywordsStack;
    }

    public handleSql(line: string, foundKeyword: TextRange): void {
        if (ONE_LINE_SQL.test(line)) {
            return;
        }
        this.keywordsStack.push(foundKeyword);
        const match = BLOCK_SQL_START_WITHOUT_LF.exec(line);
        if (match !== null) {
            this.diagnostics.push(
                createDiagnostic(
                    createRange(match[1].length, "sql".length, foundKeyword.range.start.line),
                    lineFeedRequired("sql")
                ));
        }
    }

    /**
     * Checks `if` condition syntax
     */
    public handleIf(line: string, foundKeyword: TextRange): void {
        const ifConditionRegex: RegExp = /^[\s].*if\s*(.*)/;
        const ifCondition = ifConditionRegex.exec(line)[1];

        if (ifCondition.trim() === "") {
            this.diagnostics.push(
                createDiagnostic(foundKeyword.range, "If condition can not be empty")
            );
            return;
        }

        try {
            Function(`return ${ifCondition}`);
        } catch (err) {
            this.diagnostics.push(createDiagnostic(createRange(
                line.indexOf(ifCondition),
                ifCondition.length,
                foundKeyword.range.start.line
            ), err.message));
        }
    }

    public handleScript(line: string, foundKeyword: TextRange): void {
        if (ONE_LINE_SCRIPT.test(line)) {
            return;
        }
        this.keywordsStack.push(foundKeyword);
        const match = BLOCK_SCRIPT_START_WITHOUT_LF.exec(line);
        if (match !== null) {
            this.diagnostics.push(createDiagnostic(
                createRange(match[1].length, "script".length, foundKeyword.range.start.line),
                lineFeedRequired("script")
            ));
        }
    }
}
