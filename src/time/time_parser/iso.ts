import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { UtilZone } from "./date_with_tz/util";
import { TimeParseError } from "./time_parse_error";
import { DateFunction, daysInMonth } from "./utils";

// yyyy-MM-dd hh:mm:ss
const ISO_LIKE_DATE_TEMPLATE: RegExp =
        /^\s*((?:[0-9]{1,4}-)*[0-9]{1,4})?(?:\s+|^|$)([0-9]{1,2}:[0-9]{2}(?::[0-9]{2}(?:\.[0-9]*)?)?)?\s*$/;
// <time>Z
// <time>±hh:mm
// <time>±hhmm
// <time>±hh
const OFFSET = /Z|[-+]\d{2}(?::?\d{2})?$/;
const TIME_SEPARATOR = "T";

/**
 * Parses date template string and returns corresponding {@link DateFunction}.
 * Returns null, if the template can not be parsed.
 *
 * @param template - Date template string
 * @returns Date function, that builds {@link DateWithTZ}, corresponding to `template`.
 * Acceptable formats are listed in corresponding parsers, also it's useful to review iso tests.
 * @see parseIsoLikeTemplate
 * @see parseDateFunction
 */
export function parseDateTemplate(template: string): DateFunction {
    /** Try to parse as {@link ISO_LIKE_DATE_TEMPLATE}. */
    let result = parseIsoLikeTemplate(template);
    if (result === undefined) {
        /** No success, try to parse as {@link DATE_FUNCTION}, legacy. */
        result = parseDateFunction(template);
    }
    if (result === undefined) {
        /** No success, template can not be parsed as date string. */
        return null;
    }
    return result;
}

interface DateComponents {
    year: number;
    month: number;
    day: number;
}

interface TimeComponents {
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}

/**
 * Parses {@link ISO_LIKE_DATE_TEMPLATE} template string and returns corresponding {@link DateFunction}.
 * Acceptable formats are listed below, also it's useful to review iso tests.
 *
 * @param template - Date template string
 * @returns Date function, that builds {@link DateWithTZ}, corresponding to `template`.
 * @example yyyy-MM-ddThh:mm:ss[.S]Z
 * @example yyyy-MM-ddThh:mm:ss[.S]±hh:mm
 * @example yyyy-MM-ddThh:mm:ss[.S]±hhmm
 * @example yyyy-MM-dd hh:mm:ss[.S]Z
 * @example yyyy-MM-dd hh:mm:ss[.S]±hh:mm
 * @example yyyy-MM-dd hh:mm:ss[.S]±hhmm
 * @example yyyy-MM-dd hh:mm:ss[.S]±hh
 * @example yyyy-MM-dd hh:mm:ss[.S]
 * @example yyyy-MM-dd
 * @example yyyy-M-d
 * @example MM-dd
 * @example dd
 * @example yyyy
 * @example yyyy-MM
 * @example hh:mm
 * @example hh:mm:ss
 * @example hh:mm:ss.S
 */
function parseIsoLikeTemplate(template: string): DateFunction {
    template = template.toUpperCase();
    let d;
    let date;
    let time;
    /** Try to parse as {@link ISO_LIKE_DATE_TEMPLATE}. */
    let match = template.match(ISO_LIKE_DATE_TEMPLATE);
    if (!match) {
        /** No success, check is there {@link OFFSET}. */
        const offset = template.match(OFFSET);
        if (offset) {
            /** Yes, offset is set, create base date from template with fixed TZ, to prevent offset checks. */
            d = new DateWithTZ(template, UtilZone.FIXED);
            template = template.substring(0, offset.index);
            /** Try to parse as {@link ISO_LIKE_DATE_TEMPLATE} part of template without offset. */
            match = template.match(ISO_LIKE_DATE_TEMPLATE);
            if (match) {
                /**
                 * Success. For example, "2016-06-09 12:15:04.005":
                 * date = 2016-06-09
                 * time = 12:15:04.005
                 */
                [, date, time] = match;
            } else {
                /**
                 * No success, for example, "2015-01-01T00:00:00Z".
                 * Try to split by {@link TIME_SEPARATOR}.
                 */
                [date, time] = template.split(TIME_SEPARATOR);
            }
        } else {
            /** No, template can not be parsed as ISO-like at all. */
            return;
        }
    } else {
        /** Success, there is ISO-like template without offset. */
        [, date, time] = match;
    }
    if (date != null || time != null) {
        let dateComponents: DateComponents;
        let timeComponents: TimeComponents;
        if (date != null) {
            dateComponents = parseDate(date);
        }
        if (time != null) {
            timeComponents = parseTime(time);
        }
        return function(now: DateWithTZ): DateWithTZ {
            const baseDate = d || now;
            if (dateComponents !== undefined) {
                let { year, month, day } = dateComponents;
                // Set only year and month, because number of days depends on the specified month and year.
                if (year != null) {
                    baseDate.setDate(+year, +month, 1);
                } else if (month != null) {
                    baseDate.setDate(baseDate.year, +month, 1);
                }
                day = (day <= 0) ? 1 : Math.min(+day, daysInMonth(baseDate));
                baseDate.day = day;
            }
            if (timeComponents !== undefined) {
                let { hour, minute, second, millisecond } = timeComponents;
                baseDate.setTime(hour, minute, second, millisecond);
            } else {
                /** Drop time to 00:00:00.000. */
                baseDate.roundToDay();
            }
            return baseDate;
        };
    }
}

/**
 * Parses date part to {@link DateComponents}.
 *
 * @param dateTemplate - Date template string in format yyyy-MM-dd, MM-dd or dd
 * @returns Object with components of date part.
 */
function parseDate(dateTemplate: string): DateComponents {
    const dateComponents = dateTemplate.split("-");
    let year;
    if (dateComponents[0].length > 2 || dateComponents.length === 3) {
        year = +dateComponents[0];
    }
    let month;
    if (year != null) {
        month = +dateComponents[1] || 1;
    } else if (dateComponents.length === 2) {
        month = +dateComponents[0];
    }
    let day;
    if (year != null) {
        day = +dateComponents[2] || 1;
    } else {
        day = month != null ? dateComponents[1] : dateComponents[0];
    }

    if (month != null) {
        month = (month <= 0) ? 1 : (month > 12) ? 12 : month;
        // In JavaScript months are counted from 0.
        month = +month - 1;
    }
    return { year, month, day };
}

const TIME_COMPONENTS_SEPARATOR = /[:.]/;

/**
 * Parses time part to {@link TimeComponents}.
 *
 * @param timeTemplate - Time template string in format HH:mm:ss[.S], HH:mm:ss or HH:mm
 * @returns Object with components of time part.
 */
function parseTime(timeTemplate: string): TimeComponents {
    const timeComponents: string[] = timeTemplate.split(TIME_COMPONENTS_SEPARATOR);
    const hour = +timeComponents[0];
    const minute = +timeComponents[1];
    const second = +timeComponents[2] || 0;
    const millisecond = timeComponents[3] ? Math.round(+(`0.${timeComponents[3]}`) * 1000) : 0;
    return { hour, minute, second, millisecond };
}

// date("2016-06-09"), legacy
const DATE_FUNCTION = /^\s*date\s*\(\s*(.*)\s*\)\s*$/;
// "2016-06-09"
const QUOTED_DATE = /^(["'])(.*)\1$/;

/**
 * Parses {@link DATE_FUNCTION} and builds corresponding date object.
 * It's legacy, that's why it's not covered with tests properly.
 *
 * @param template - Date template string
 * @example date("yyyy-MM-dd")
 */
function parseDateFunction(template: string): DateFunction {
    let match = template.match(DATE_FUNCTION);
    if (match != null) {
        const argument = match[1];
        match = argument.match(QUOTED_DATE); // "2016-06-09"
        if (!match) {
            throw new TimeParseError("date() argument is unquoted", template);
        }
        const templateCropped = match[2]; // 2016-06-09
        return parseIsoLikeTemplate(templateCropped);
    }
}
