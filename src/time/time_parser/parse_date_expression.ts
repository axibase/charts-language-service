import { parseCalendarKeyword } from "./calendar";
import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { parseDateTemplate } from "./iso";
import { ParsedExpression, Summand } from "./parsed_expression";

/** Matches part of expression in format: <[+,-] count [*] unit>, e.g. -0.5*hour + 1 day. */
const MATCH_SPAN_SYNTAX = /\s*(([-+])\s*\d+(\.\d+)?\s*\*?\s*[A-Za-z]+\s*)*$/;

/** Stores <expression as string = {@link ParsedExpression}> pairs. */
const peCache = {};

/**
 * Main parsing method. Returns date, corresponding to date expression.
 * Returns null, if expression can not be parsed.
 * Uses {@link peCache} to prevent from extra re-parsing.
 *
 * @param expression - Date arithmetic expression
 * @param zone - Zone ID, in which expression is need to be processed,
 *               @see DateWithTZ.zone
 * @example parseDateExpression("current_day", "UTC")
 * @example parseDateExpression("2019-11-01", "UTC")
 * @example parseDateExpression("current_day + 9 hour + 50*minute", "local")
 * @example parseDateExpression("2019-11-01 + 9 hour + 50*minute", "local")
 */
export function parseDateExpression(expression: string, zone: string): DateWithTZ {
    // start-time = 2019-11-01 + 9 hour + 50 minute
    if (!peCache[expression]) {
        const match = expression.match(MATCH_SPAN_SYNTAX);
        const base = (match ? expression.substring(0, match.index) : expression); // 2019-11-01
        const baseTrimmed = base.trim();
        const baseFun = baseTrimmed === "" ? null : parseCalendarKeyword(baseTrimmed) || parseDateTemplate(baseTrimmed);
        if (!baseFun) {
            peCache[expression] = null;
            return null;
        }
        const span = expression.substring(base.length).trim(); // + 9 hour + 50 minute
        const summands: Summand[] = parseIntervalExpression(span);
        peCache[expression] = new ParsedExpression(baseFun, summands);
    }
    const parsedExpression = peCache[expression];
    return parsedExpression ? parsedExpression.getDate(zone) : null;
}

/**
 * Parses span part of date arithmetic to array of {@link Summand}.
 *
 * @param timespan - Span part of arithmetic expression in `<[+,-] count [*] unit>` format, e.g. "8 hour", "1 day";
 *                   to review additional restrictions,
 *                   @see DateWithTZ.shift()
 */
function parseIntervalExpression(timespan: string): Summand[] {
    const components = [];
    const PARSE_SPAN_SYNTAX = /\s*([-+])\s*(\d+(?:\.\d+)?)\s*\*?\s*([A-Za-z]+)\s*/g;
    let m = PARSE_SPAN_SYNTAX.exec(timespan);
    while (m) {
        components.push({count: m[2], unit: m[3], sign: m[1]});
        m = PARSE_SPAN_SYNTAX.exec(timespan);
    }
    return components;
}
