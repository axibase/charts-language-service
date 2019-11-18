/**
 * This module contains functions, which help:
 * 1) calculate offset from UTC in minutes given a target timezone ID;
 * 2) check passed offset and adjust it if necessary (for example, in case of DST movements).
 * The main idea was taken from [Luxon]{@link https://moment.github.io/luxon/docs/manual/install.html}.
 * @module offset
 */
/**
 * Copyright 2019 JS Foundation and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { CalendarObject, UtilZone } from "./util";

const MILLIS_IN_SECOND = 1000;
const MILLIS_IN_MINUTE = 60 * MILLIS_IN_SECOND;

/**
 * Returns offset from UTC in minutes. If zone is UTC, returns 0; if zone is local, calls standard getTimezoneOffset.
 * Simplified algorithm:
 *  1) constructs Date from specified millis in local;
 *  2) formats it using Intl.DateTimeFormat and specified zone, @see {@link getTSWithOffset};
 *  3) parses string, representing date in specified zone, to {@link DATE_COMPONENTS}, @see {@link getTSWithOffset};
 *  4) builds timestamp(=shiftedMillis) using Date.UTC and components - it's a millis with the offset
 *     under the hood @see {@link getTSWithOffset};
 *  5) returns `(shiftedMillis - ts) / MILLIS_IN_MINUTE`.
 *
 * @param ts - Unix millis
 * @param tz - [IANA timezone name]{@link https://axibase.com/docs/atsd/shared/timezone-list.html#time-zones}
 */
export function offset(ts: number, tz: string): number {
    if (tz === UtilZone.UTC) {
        return 0;
    }
    const date = new Date(ts);
    if (tz === UtilZone.LOCAL) {
        return -date.getTimezoneOffset();
    }
    const asUTC = getTSWithOffset(date, tz);
    // Round to millis.
    const asTS = Math.floor(ts / MILLIS_IN_SECOND) * MILLIS_IN_SECOND;
    return (asUTC - asTS) / MILLIS_IN_MINUTE;
}

const LEFT_TO_RIGHT_MARK = "\\u200E";
// MM dd yyyy HH:mm:ss
const DATE_COMPONENTS = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/;

/**
 * Returns millis, corresponding to date in target timezone.
 * Simplified algorithm:
 *  1) formats specified date in specified timezone using cached Intl.DateTimeFormat;
 *  2) parses string, representing date in specified zone, to {@link DATE_COMPONENTS};
 *  3) constructs timestamp using Date.UTC and parsed components.
 *
 * @param date - Date object, which is need to be formatted in specified timezone
 * @param tz - IANA timezone name. @see {@link https://axibase.com/docs/atsd/shared/timezone-list.html#time-zones}
 * @returns Timestamp with `tz` offset, taken into account inside.
 */
function getTSWithOffset(date: Date, tz: string): number {
    const dtf = getDateFormatter(tz);
    const regex = new RegExp(LEFT_TO_RIGHT_MARK, "g");
    const formatted = dtf.format(date).replace(regex, "");
    const parsed = DATE_COMPONENTS.exec(formatted);
    const [, month, day, year, hour, minute, second] = parsed;
    const jsMonth = +month - 1;
    return objToLocalTS({year, month: jsMonth, day, hour, minute, second, millisecond: 0});
}

const dtfCache = {};

/**
 * Creates and adds to cache formatting object, corresponding to specified timezone.
 *
 * @param zone - [IANA timezone name]{@link https://axibase.com/docs/atsd/shared/timezone-list.html#time-zones}.
 * @returns Intl.DateTimeFormat, corresponding to `zone`.
 */
export function getDateFormatter(zone: string): Intl.DateTimeFormat {
    if (!dtfCache[zone]) {
        dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
            hour12: false,
            timeZone: zone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
    return dtfCache[zone];
}

/**
 * Find the right offset given a local time. The `o` input is our guess, which determines which
 * offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST).
 */
export function objToTS(obj: CalendarObject, o: number, zone: string): number[] {
    const localTS = objToLocalTS(obj);
    // Our UTC time is just a guess because our offset is just a guess
    let utcGuess = localTS - o * MILLIS_IN_MINUTE;

    // Test whether the zone matches the offset for this ts
    const o2 = offset(utcGuess, zone);

    // If so, offset didn't change and we're done
    if (o === o2) {
        return [utcGuess, o];
    }

    // If not, change the ts by the difference in the offset
    utcGuess -= (o2 - o) * MILLIS_IN_MINUTE;

    // If that gives us the local time we want, we're done
    const o3 = offset(utcGuess, zone);
    if (o2 === o3) {
        return [utcGuess, o2];
    }

    // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time
    return [localTS - Math.min(o2, o3) * MILLIS_IN_MINUTE, Math.max(o2, o3)];
}

/**
 * Converts an epoch timestamp into a calendar object with the given offset.
 */
export function tsToObj(ts: number, o: number): CalendarObject {
    ts += o * MILLIS_IN_MINUTE;
    const d = new Date(ts);

    return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth(),
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
        second: d.getUTCSeconds(),
        millisecond: d.getUTCMilliseconds()
    };
}

/**
 * Converts a calendar object to a local timestamp (epoch, but with the offset baked in).
 */
function objToLocalTS(obj: CalendarObject): number {
    return Date.UTC(
        obj.year,
        obj.month,
        obj.day,
        obj.hour,
        obj.minute,
        obj.second,
        obj.millisecond
    );
}
