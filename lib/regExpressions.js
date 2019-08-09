(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("./constants");
    /** Regular expressions for CSV syntax checking */
    //  csv <name> =
    //  <header1>, <header2>
    exports.CSV_NEXT_LINE_HEADER_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(=)/m;
    // csv <name> = <header1>, <header2>
    exports.CSV_INLINE_HEADER_PATTERN = /=[ \t]*$/m;
    // csv <name> from <url>
    exports.CSV_FROM_URL_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(from)/m;
    // blank line
    exports.BLANK_LINE_PATTERN = /^[ \t]*$/m;
    // csv
    exports.CSV_KEYWORD_PATTERN = /\b(csv)\b/i;
    // csv from <url>
    exports.CSV_FROM_URL_MISSING_NAME_PATTERN = /(^[ \t]*csv[ \t]+)[ \t]*(from)/;
    /** Regular expressions to match SQL */
    // sql = SELECT time, entity, value FROM cpu_busy
    exports.ONE_LINE_SQL = /^\s*sql\s*=.*$/m;
    // sql SELECT 1
    exports.BLOCK_SQL_START_WITHOUT_LF = /(^\s*)sql\s*\S/;
    // sql
    exports.BLOCK_SQL_START = /sql(?!([\s\S]*=))/;
    // endsql
    exports.BLOCK_SQL_END = /^\s*endsql\s*$/;
    /** Regular expressions to match script */
    // script = console.log()
    exports.ONE_LINE_SCRIPT = /^\s*script\s*=.*$/m;
    // script alert("Hello, world!")
    exports.BLOCK_SCRIPT_START_WITHOUT_LF = /(^\s*)script\s*\S/;
    // script
    exports.BLOCK_SCRIPT_START = /(?:^\s*)script(?!([\s\S]*=))/;
    // endscript
    exports.BLOCK_SCRIPT_END = /^\s*endscript\s*$/;
    /** Various regular expressions */
    // false, no, null, none, 0, off, true, yes, on, 1
    exports.BOOLEAN_REGEXP = new RegExp(`^(?:${constants_1.BOOLEAN_KEYWORDS.join("|")})$`);
    // 07, +3, -81
    exports.INTEGER_REGEXP = /^[-+]?\d+$/;
    exports.INTERVAL_REGEXP = new RegExp(
    // -5 month, +3 day, .3 year, 2.3 week, all
    `^(?:(?:[-+]?(?:(?:\\d+|(?:\\d+)?\\.\\d+)|@\\{.+\\})[ \\t]*(?:${constants_1.INTERVAL_UNITS.join("|")}))|all)$`);
    // 1, 5.2, 0.3, .9, -8, -0.5, +1.4
    exports.NUMBER_REGEXP = /^(?:\-|\+)?(?:\.\d+|\d+(?:\.\d+)?)$/;
    // ${server}, ${example}
    exports.CALCULATED_REGEXP = /[@$]\{.+\}/;
    // =, ==, !=, >=, <=, >, <
    exports.RELATIONS_REGEXP = new RegExp(`(^\\s*.+?)(\\s*?)(${constants_1.RELATIONS.join("|")})(\\s*)`);
});
