(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./messageUtil", "./regExpressions", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const messageUtil_1 = require("./messageUtil");
    const regExpressions_1 = require("./regExpressions");
    const util_1 = require("./util");
    class KeywordHandler {
        constructor(keywordsStack) {
            this.diagnostics = [];
            this.keywordsStack = keywordsStack;
        }
        handleSql(line, foundKeyword) {
            if (regExpressions_1.ONE_LINE_SQL.test(line)) {
                return;
            }
            this.keywordsStack.push(foundKeyword);
            const match = regExpressions_1.BLOCK_SQL_START_WITHOUT_LF.exec(line);
            if (match !== null) {
                this.diagnostics.push(util_1.createDiagnostic(util_1.createRange(match[1].length, "sql".length, foundKeyword.range.start.line), messageUtil_1.lineFeedRequired("sql")));
            }
        }
        /**
         * Checks `if` condition syntax
         */
        handleIf(line, foundKeyword) {
            const ifConditionRegex = /^[\s].*if\s*(.*)/;
            const ifCondition = ifConditionRegex.exec(line)[1];
            if (ifCondition.trim() === "") {
                this.diagnostics.push(util_1.createDiagnostic(foundKeyword.range, "If condition can not be empty"));
                return;
            }
            try {
                Function(`return ${ifCondition}`);
            }
            catch (err) {
                this.diagnostics.push(util_1.createDiagnostic(util_1.createRange(line.indexOf(ifCondition), ifCondition.length, foundKeyword.range.start.line), err.message));
            }
        }
        handleScript(line, foundKeyword) {
            if (regExpressions_1.ONE_LINE_SCRIPT.test(line)) {
                return;
            }
            this.keywordsStack.push(foundKeyword);
            const match = regExpressions_1.BLOCK_SCRIPT_START_WITHOUT_LF.exec(line);
            if (match !== null) {
                this.diagnostics.push(util_1.createDiagnostic(util_1.createRange(match[1].length, "script".length, foundKeyword.range.start.line), messageUtil_1.lineFeedRequired("script")));
            }
        }
    }
    exports.KeywordHandler = KeywordHandler;
});
