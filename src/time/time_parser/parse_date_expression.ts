import { parseCalendarKeyword } from "./calendar";
import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { parseDateTemplate } from "./iso";

/**
 * Matches part of expression in format:
 * <[+,-] count [*] unit>, e.g. -0.5*hour + 1 day
 */
const MATCH_SPAN_SYNTAX = /\s*(([-+])\s*\d+(\.\d+)?\s*\*?\s*[A-Za-z]+\s*)*$/;

/**
 * Returns date, corresponding to date expression.
 * Returns null, if expression can not be parsed.
 *
 * @param expression - Date arithmetic expression
 * @param zone - Zone ID, in which expression is need to be processed, @see {@link DateWithTZ.zone}
 * @example parseDateExpression("current_day", "UTC")
 * @example parseDateExpression("2019-11-01", "UTC")
 * @example parseDateExpression("current_day + 9 hour + 50*minute", "local")
 * @example parseDateExpression("2019-11-01 + 9 hour + 50*minute", "local")
 */
export function parseDateExpression(expression: string, zone: string): DateWithTZ {
    // start-time = 2019-11-01 + 9 hour + 50 minute
    // start-time = current_day + 9 hour + 50 minute
    const match = expression.match(MATCH_SPAN_SYNTAX);
    const base = (match ? expression.substring(0, match.index) : expression); // 2019-11-01
    const baseTrimmed = base.trim();
    if (baseTrimmed === "") {
        return null;
    }
    const baseAsDate: DateWithTZ = parseCalendarKeyword(baseTrimmed, zone) || parseDateTemplate(baseTrimmed, zone);
    if (!baseAsDate) {
        return null;
    }
    const span = expression.substring(base.length).trim(); // + 9 hour + 50 minute
    return span.length === 0 ? baseAsDate : parseIntervalExpression(span, baseAsDate);
}

/**
 * The whole timespan must be in format:
 * <[+,-] count [*] unit>, e.g. -0.5*hour + 1 day
 */
const CHECK_SPAN_SYNTAX = /^\s*(([-+])\s*\d+(\.\d+)?\s*\*?\s*[A-Za-z]+\s*)*$/;

/**
 * Parses span part of date arithmetic expression and applies it to parsed base part. For example,
 * for expression "current_day + 9 hour + 50 minute", base part is "current_day"
 * and timespan is "+ 9 hour + 50 minute".
 *
 * @param timespan - Span part of arithmetic expression in `<[+,-] count [*] unit>` format, e.g. "8 hour", "1 day";
 *                   to review additional restrictions,
 *                   @see DateWithTZ.shift()
 * @param baseDate - Parsed base part of arithmetic expression
 * @returns Date object, corresponding to parsed date arithmetic expression.
 */
function parseIntervalExpression(timespan: string, baseDate: DateWithTZ): DateWithTZ {
    if (!CHECK_SPAN_SYNTAX.test(timespan)) {
        return null;
    }
    const PARSE_SPAN_SYNTAX = /\s*([-+])\s*(\d+(?:\.\d+)?)\s*\*?\s*([A-Za-z]+)\s*/g;
    let m = PARSE_SPAN_SYNTAX.exec(timespan);
    while (m) {
        baseDate.shift(m[2], m[3], m[1]);
        m = PARSE_SPAN_SYNTAX.exec(timespan);
    }
    return baseDate;
}
