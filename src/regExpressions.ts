import { BOOLEAN_KEYWORDS, CONTROL_KEYWORDS, INTERVAL_UNITS, RELATIONS } from "./constants";

/** Regular expressions for CSV syntax checking */
//  csv <name> =
//  <header1>, <header2>
export const CSV_NEXT_LINE_HEADER_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(=)/m;

// csv <name> = <header1>, <header2>
export const CSV_INLINE_HEADER_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(=)[ \t]*$/m;

// csv <name> from <url>
export const CSV_FROM_URL_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(from)/m;

// blank line
export const BLANK_LINE_PATTERN = /^[ \t]*$/m;

// csv
export const CSV_KEYWORD_PATTERN = /\b(csv)\b/i;

// csv from <url>
export const CSV_FROM_URL_MISSING_NAME_PATTERN = /(^[ \t]*csv[ \t]+)[ \t]*(from)/;

/** Regular expressions to match SQL */

// sql = SELECT time, entity, value FROM cpu_busy
export const ONE_LINE_SQL = /^\s*sql\s*=.*$/m;

// sql SELECT 1
export const BLOCK_SQL_START_WITHOUT_LF = /(^\s*)sql\s*\S/;

// sql
export const BLOCK_SQL_START = /^\s*sql(?!([\s\S]*=))/;

// endsql
export const BLOCK_SQL_END = /^\s*endsql\s*$/;

/** Regular expressions to match script */

// script = console.log()
export const ONE_LINE_SCRIPT = /^\s*script\s*=\s*(.*)/;

// script alert("Hello, world!")
export const BLOCK_SCRIPT_START_WITHOUT_LF = /(^\s*)script\s*\S/;

// script
export const BLOCK_SCRIPT_START = /(?:^\s*)script(?!([\s\S]*=))/;

// endscript
export const BLOCK_SCRIPT_END = /^\s*endscript\s*$/;

/** Regular expressions to match expr */

// expr expr_1;
export const EXPR_START_WITHOUT_LF = /(^\s*)expr\s*\S/;

// expr
export const EXPR_START = /^\s*expr\s*$/;

// endexpr
export const EXPR_END = /^\s*endexpr\s*$/;

/** Various regular expressions */

// false, no, null, none, 0, off, true, yes, on, 1
export const BOOLEAN_REGEXP: RegExp = new RegExp(`^(?:${BOOLEAN_KEYWORDS.join("|")})$`);

// 07, +3, -81
export const INTEGER_REGEXP: RegExp = /^[-+]?\d+$/;

export const INTERVAL_REGEXP: RegExp = new RegExp(
    // -5 month, +3 day, .3 year, 2.3 week, all
    `^(?:(?:[-+]?(?:(?:\\d+|(?:\\d+)?\\.\\d+)|@\\{.+\\})[ \\t]*(?:${INTERVAL_UNITS.join("|")}))|all)$`,
);

// 1, 5.2, 0.3, .9, -8, -0.5, +1.4
export const NUMBER_REGEXP: RegExp = /^(?:\-|\+)?(?:\.\d+|\d+(?:\.\d+)?)$/;

// ${server}, @{example}
export const CALCULATED_REGEXP: RegExp = /[@$]\{.+\}/;

// @{server}
export const VAR_TEMPLATE_REGEX: RegExp = /@\{(\w+)\}/;

// =, ==, !=, >=, <=, >, <
export const RELATIONS_REGEXP: RegExp = new RegExp(`(^\\s*.+?)(\\s*?)(${RELATIONS.join("|")})(\\s*)`);

// tag(s)|key(s) — sections, whose settings are handled in different way
export const SECTIONS_EXCEPTIONS_REGEXP: RegExp = /(?:tag|key)s?/;

// tag(s) section regex
export const TAG_REGEXP: RegExp = /tag/;

// start of block comment - /*
export const BLOCK_COMMENT_START: RegExp = /^(.*)(\/\*+)(.*)/;

// end of block comment - */
export const BLOCK_COMMENT_END: RegExp = /(.*)(\*\/)(.*)$/;

// block comment - /* some-text */
export const ONE_LINE_COMMENT: RegExp = /\/\*([\s\S]*?)(?=\*\/)/;

// number of spaces until first non-space character -  "   hello" // 3
export const SPACES_AT_START: RegExp = /[^\s+]/;

// matches 1+ consequent spaces not surrounded by quotes
export const UNQUOTED_CONSEQUENT_SPACES: RegExp = /((['"])(?:\\.|[^\2])*?\2)|(\s\s+)/;

// extract if condition — if a == 2 // condition:  a == 2
export const IF_CONDITION_REGEX: RegExp = /^[\s]*if\s*(.*)/;

// if|csv|script|sql|for|list|var|expr - keywords separated with line feed
export const KEYWORDS_WITH_LF: RegExp = new RegExp(`\\b(${CONTROL_KEYWORDS.join("|")})\\b`);

// else|elseif - do not need line feed before these keywords
export const ELSE_ELSEIF_REGEX: RegExp = /\b(else|elseif)\b/;

// endif|endcsv|endscript|endsql|endfor|endlist|endvar|endexpr - endkeywords separated with line feed
export const ENDKEYWORDS_WITH_LF: RegExp = new RegExp(
    `\\b(${CONTROL_KEYWORDS.map(word => "end" + word).join("|")})\\b`
);

// width-units = 6.2
export const SETTING_DECLARATION: RegExp = /(^\s*)([a-z].*?[a-z])\s*=\s*(.*?)\s*$/;
// var test = [ <- open bracket
//
// OR
//
// var test =
// [ <- open bracket
export const VAR_OPEN_BRACKET: RegExp = /(=)?\s*[\[\{\(](|.*,)\s*$/;

// var test = [
//     ...
// ]  <- close bracket
export const VAR_CLOSE_BRACKET: RegExp = /\s*[\]\}\)]\s*/;

// sort = value ASC, sort = value DESCENDING, etc
export const SORT_REGEX: RegExp = /^(\w+)(?:\s+)?((?:asc|desc)(?:ending)?)?$/;

// sql|script|if|for|var|list|csv|expr
export const KEYWORDS_REGEX: RegExp = new RegExp(`^[ \t]*(?:${CONTROL_KEYWORDS.join("|")})[ \t]*`, "g");

// stat_name('count unit'), for example: sum(5 minute), avg(10 second)
export const STAT_COUNT_UNIT = /([a-z_\$]+)\((['"])?(.+)\2\)\s*((?:asc|desc)(?:ending)?)?$/;

// [section -> true
// [section] -> false
export const OPENING_BRACKET: RegExp = /\[[^\]]*$/;

// Some alpha characters at the beginnig of the line
export const WORD_START: RegExp = /^\s*(\w)*\s*$/;

// name [ASC|DESC]ENDING
export const CALENDAR_SORT_BY_NAME: RegExp = /^\s*(name)\s*((?:asc|desc)(?:ending)?)?$/;

// Matches setting value after '=' sign
export const VALUE_MATCH: RegExp = /^\s*(\S+)\s*=\s*/;
