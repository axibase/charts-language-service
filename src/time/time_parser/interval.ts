import { Coefficient, DateWithTZ } from "./date_with_tz/date_with_tz";
import { TimeParseError } from "./time_parse_error";

// <count unit>, e.g. 0.5 hour, 1 day
const CHECK_SPAN_SYNTAX = /^\s*(\d+(\.\d+)?\s*[A-Za-z]+\s*)*$/;
const PARSE_SPAN_SYNTAX = /\s*(\d+(?:\.\d+)?)\s*([A-Za-z]+)\s*/;

/**
 * Parses interval string to milliseconds using specified timestamp to construct base date.
 * Simplified algorithm:
 *  1) creates new DateWithTZ using `baseTime`;
 *  2) increases or decreases it's component corresponding to interval, @see {@link DateWithTZ.shift()};
 *  3) gets millis of modified date and returns
 *     `baseTime-modifiedMillis` or `modifiedMillis-baseTime` in depend on `sign`.
 * NOTE: `baseTime` can not be replaced with Date.now(), because number of millis in year, quarter and month differs,
 * for example, (2016-02-01 + 1 month - 2016-02-01) != (2017-02-01 + 1 month - 2017-02-01),
 * @see parse_timespan.test.js > Specific case: base time is February
 *
 * @param interval - Interval in <count unit> format
 * @param baseTime - Millis to construct base date, to which interval is need to be applied
 * @param [sign='+'] - "+" or  1, interval is added to base date,
 *                     "-" or -1, interval is subtracted from base date
 * @param [zone] - Zone ID, in which base date is need to be processed. TODO: is it suitable to always use "local"?
 *                 @see DateWithTZ.zone
 * @returns Milliseconds, corresponding to `interval`.
 * @throws TimeParseError `interval` must be in `<count unit>` format, e.g. "8 hour", "1 day";
 *                         to review additional restrictions,
 *                         @see DateWithTZ.shift()
 */
export function parseInterval(interval: string, baseTime: number, sign: number | string = "+", zone?: string): number {
    const baseDate = new DateWithTZ(baseTime, zone);
    if (!CHECK_SPAN_SYNTAX.test(interval)) {
        throw new TimeParseError("Incorrect interval syntax", interval);
    }
    const m = PARSE_SPAN_SYNTAX.exec(interval);
    const c = Coefficient.parse(sign);
    baseDate.shift(m[1], m[2], c);
    return c * (+baseDate - baseTime);
}
