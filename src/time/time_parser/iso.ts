import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { UtilZone } from "./date_with_tz/util";
import { TimeParseError } from "./time_parse_error";
import { daysInMonth } from "./utils";

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
 * Parses date template string and builds corresponding date object.
 * Returns undefined, if the template can not be parsed.
 *
 * @param template - Date template string
 * @param zone - Zone ID, in which template is need to be processed. It will be ignored if template contains offset
 *               @see DateWithTZ.zone
 * @returns Date object, corresponding to `template`.
 * @see parseDateFunction
 * @see parseIsoLikeTemplate
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Syntax}
 */
export function parseDateTemplate(template: string, zone: string): DateWithTZ {
    /** Try to parse as {@link ISO_LIKE_DATE_TEMPLATE}. */
    let result = parseIsoLikeTemplate(template, zone);
    if (result === undefined) {
        /** No success, try to parse as {@link DATE_FUNCTION}, legacy. */
        result = parseDateFunction(template, zone);
    }
    if (result === undefined) {
        /**
         * No success, try to parse using standard Date (in DateWithTZ under the hood).
         * @example "2019 08 14" - August 14th.
         */
        try {
            result = new DateWithTZ(template, zone);
        } catch (err) {
            return;
        }
    }
    return result;
}

/**
 * Parses {@link ISO_LIKE_DATE_TEMPLATE} template string and builds corresponding date object.
 * In addition to formats, accepted by Date constructor, there are some others, see examples below and iso tests.
 *
 * @param template - Date template string
 * @param zone - Zone ID, in which template is need to be processed. It will be ignored, if template contains offset
 *               @see DateWithTZ.zone
 * @returns Date object, corresponding to `template`.
 * @throws TimeParseError Date must be greater than start of Unix epoch.
 * @example yyyy-MM-ddThh:mm:ss[.S]Z
 * @example yyyy-MM-ddThh:mm:ss[.S]±hh:mm
 * @example yyyy-MM-ddThh:mm:ss[.S]±hhmm
 * @example yyyy-MM-ddThh:mm:ss[.S]
 * @example yyyy-MM-dd hh:mm:ss[.S]Z
 * @example yyyy-MM-dd hh:mm:ss[.S]±hh:mm
 * @example yyyy-MM-dd hh:mm:ss[.S]±hhmm
 * @example yyyy-MM-dd hh:mm:ss[.S]±hh
 * @example yyyy-MM-dd hh:mm:ss[.S]
 * @example yyyy-MM-dd
 * @example yyyy MM dd
 * @example yyyy-M-d
 * @example MM-dd
 * @example dd
 * @example yyyy
 * @example yyyy-MM
 * @example hh:mm
 * @example hh:mm:ss
 * @example hh:mm:ss.S
 */
function parseIsoLikeTemplate(template: string, zone: string): DateWithTZ {
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
                 * No success, for example, "2015-01-01T00:00:00".
                 * Try to split by {@link TIME_SEPARATOR}.
                 */
                [date, time] = template.split(TIME_SEPARATOR);
            }
        } else {
            /** No, template can not be parsed as ISO-like at all. */
            return;
        }
    } else {
        /** Success, there is ISO-like template without offset, create base date with specified zone. */
        d = new DateWithTZ(void 0, zone);
        [, date, time] = match;
    }
    if (date != null || time != null) {
        if (date != null) {
            d = parseDate(date, d);
        }
        if (time != null) {
            d = parseTime(time, d);
        } else {
            /** Drop time to 00:00:00.000. */
            d.roundToDay();
        }
        return d;
    }
}

/**
 * Parses date part and sets it to `d`.
 *
 * @param dateTemplate - Date template string in format yyyy-MM-dd
 * @param d - Date object, used as base to construct target date
 * @returns Date object with year, month and day corresponding to `dateTemplate`.
 */
function parseDate(dateTemplate: string, d: DateWithTZ): DateWithTZ {
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
        // In JavaScript month are counted from 0.
        month = +month - 1;
    }
    // Set only year and month, because number of days depends on the specified month and year.
    if (year != null) {
        d.setDate(+year, +month, 1);
    } else if (month != null) {
        d.setDate(d.year, +month, 1);
    }
    day = (day <= 0) ? 1 : Math.min(+day, daysInMonth(d));
    d.day = day;
    return d;
}

const TIME_COMPONENTS_SEPARATOR = /[:.]/;

/**
 * Parses time part and sets it to `d`.
 *
 * @param timeTemplate - Time template string in format HH:mm:ss[.S]
 * @param d - Date object, used as base to construct target date
 * @returns Date object with hours, minutes, seconds and milliseconds corresponding to `timeTemplate`.
 */
function parseTime(timeTemplate: string, d: DateWithTZ): DateWithTZ {
    const timeComponents: string[] = timeTemplate.split(TIME_COMPONENTS_SEPARATOR);
    const hour = +timeComponents[0];
    const minute = +timeComponents[1];
    const second = +timeComponents[2] || 0;
    const millisecond = timeComponents[3] ? Math.round(+(`0.${timeComponents[3]}`) * 1000) : 0;
    d.setTime(hour, minute, second, millisecond);
    return d;
}

// date("2016-06-09"), legacy
const DATE_FUNCTION = /^\s*date\s*\(\s*(.*)\s*\)\s*$/;
// "2016-06-09"
const QUOTED_DATE = /^(["'])(.*)\1$/;

/**
 * Parses {@link DATE_FUNCTION} and builds corresponding date object.
 * It's legacy, that's why it's not covered with tests properly.
 * @param template - Date template string
 * @param zone - Zone ID, in which template is need to be processed. It will be ignored, if template contains offset
 *               @see DateWithTZ.zone
 * @example date("yyyy-MM-dd")
 */
function parseDateFunction(template: string, zone: string): DateWithTZ {
    let match = template.match(DATE_FUNCTION);
    if (match != null) {
        const argument = match[1];
        match = argument.match(QUOTED_DATE); // "2016-06-09"
        if (!match) {
            throw new TimeParseError("date() argument is unquoted", template);
        }
        const templateCropped = match[2]; // 2016-06-09
        return parseIsoLikeTemplate(templateCropped, zone);
    }
}
