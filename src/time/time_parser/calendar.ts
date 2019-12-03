import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { daysInMonth, isWorkingDay } from "./utils";

/**
 * @param d - Date object, used as base to construct target date object
 * @param next - @see {@link dayOfWeek}
 */
type DateFunction = (d: DateWithTZ, next?: boolean) => DateWithTZ;

/**
 * Timestamp of DateWithTZ, which corresponds to first {@link now} call.
 * Used to ensure the same "now" for different time settings,
 * @see parse_timespan.test.js > returns (end-time - start-time) in milliseconds...
 * TODO: is it correct to cache it?
 * It would be better to pass some general "now" DateWithTZ to {@link now} instead.
 * For example, via {@link evalTime} (it seems that it was created for this purpose).
 */
let cachedNow: number;

/**
 * Parses base part of calendar expression to DateWithTZ .
 *
 * @param keyword - Calendar keyword, @see {@link calendarKeywords} and {@link daysOfWeek}
 * @param zone - Zone ID, in which keyword is need to be processed, @see {@link DateWithTZ.zone}
 * @returns Date object, corresponding to `keyword`.
 */
export function parseCalendarKeyword(keyword: string, zone: string): DateWithTZ {
    const v: string = keyword.trim();
    const parse: DateFunction = calendarKeywords[v] || daysOfWeek[v];
    if (parse == null) {
        return null;
    }
    const now = new DateWithTZ(undefined, zone);
    return parse(now);
}

const calendarKeywords = {
    "time": now,
    "now": now,
    "date": now,
    "current_minute": (d) => {
        d.roundToCurrentMinute();
        return d;
    },
    "current_hour": (d) => {
        d.roundToCurrentHour();
        return d;
    },
    "current_day": getToday,
    "today": getToday,
    "current_week": cw,
    "current_month": cm,
    "first_day": cm,
    "current_quarter": (d) => {
        d.month = Math.floor(d.month / 3) * 3;
        return cm(d);
    },
    "current_year": (d) => {
        d.month = 0;
        return cm(d);
    },
    "current_working_day": function (d) {
        const cwd = isWorkingDay(d.dayOfWeek) ? d : pwd(d);
        cwd.setMidnight();
        return cwd;
    },
    "previous_minute": (d) => {
        d.roundToCurrentMinute();
        d.shiftMinute(-1);
        return d;
    },
    "previous_hour": (d) => {
        d.roundToCurrentHour();
        d.shiftHour(-1);
        return d;
    },
    "previous_day": pd,
    "yesterday": pd,
    "previous_week": (d) => {
        d.shiftDay(-7); // This day a week ago.
        return cw(d);
    },
    "previous_month": (d) => {
        d.month = d.month - 1;
        return cm(d);
    },
    "previous_quarter": (d) => {
        d.month = (Math.floor(d.month / 3) - 1) * 3;
        return cm(d);
    },
    "previous_year": (d) => {
        d.month = -12;
        return cm(d);
    },
    "previous_working_day": pwd,
    "previous_vacation_day": pvd,
    "next_minute": (d) => {
        d.roundToCurrentMinute();
        d.shiftMinute(1);
        return d;
    },
    "next_hour": (d) => {
        d.roundToCurrentHour();
        d.shiftHour(1);
        return d;
    },
    "next_day": nd,
    "tomorrow": nd,
    "next_week": (d) => {
        d.shiftDay(7); // This day at next week.
        return cw(d);
    },
    "next_month": (d) => {
        d.month += 1;
        return cm(d);
    },
    "next_quarter": (d) => {
        d.month = (Math.floor(d.month / 3) + 1) * 3;
        return cm(d);
    },
    "next_year": (d) => {
        d.month = 12;
        return cm(d);
    },
    "next_working_day": nwd,
    "next_vacation_day": nvd,
    "last_day": ld,
    "last_working_day": (d) => {
        const lastDay = ld(d);
        return isWorkingDay(lastDay.dayOfWeek) ? lastDay : pwd(d);
    },
    "last_vacation_day": (d) => {
        const lastDay = ld(d);
        return isWorkingDay(lastDay.dayOfWeek) ? pvd(lastDay) : lastDay;
    },
    "first_working_day": (d) => {
        const firstDay = cm(d);
        return isWorkingDay(firstDay.dayOfWeek) ? firstDay : nwd(firstDay);
    },
    "first_vacation_day": (d) => {
        const firstDay = cm(d);
        return isWorkingDay(firstDay.dayOfWeek) ? nvd(firstDay) : firstDay;
    }
};

const daysOfWeek = {
    "sunday": dayOfWeek(0),
    "sun": dayOfWeek(0),
    "monday": dayOfWeek(1),
    "mon": dayOfWeek(1),
    "tuesday": dayOfWeek(2),
    "tue": dayOfWeek(2),
    "wednesday": dayOfWeek(3),
    "wed": dayOfWeek(3),
    "thursday": dayOfWeek(4),
    "thu": dayOfWeek(4),
    "friday": dayOfWeek(5),
    "fri": dayOfWeek(5),
    "saturday": dayOfWeek(6),
    "sat": dayOfWeek(6)
};

function now(d: DateWithTZ) {
    if (!cachedNow) {
        cachedNow = +d;
    }
    return new DateWithTZ(cachedNow, d.zone);
}

function getToday(d: DateWithTZ) {
    d.setMidnight();
    return d;
}

function cw(d: DateWithTZ) {
    return daysOfWeek["mon"](d);
}

function cm(d: DateWithTZ) {
    d.shiftDay(1 - d.day); // First day in month.
    d.setMidnight();
    return d;
}

function pd(d: DateWithTZ) {
    d.shiftDay(-1); // Previous day.
    d.setMidnight();
    return d;
}

function pwd(d: DateWithTZ) {
    return isWorkingDay(d.dayOfWeek - 1) ? pd(d) : daysOfWeek["fri"](d);
}

function pvd(d: DateWithTZ) {
    return isWorkingDay(d.dayOfWeek - 1) ? daysOfWeek["sun"](d) : pd(d);
}

function nd(d: DateWithTZ) {
    d.shiftDay(1); // Next day.
    d.setMidnight();
    return d;
}

function nwd(d: DateWithTZ) {
    return isWorkingDay(d.dayOfWeek + 1) ? nd(d) : daysOfWeek["mon"](d, true);
}

function nvd(d: DateWithTZ) {
    return isWorkingDay(d.dayOfWeek + 1) ? daysOfWeek["sat"](d, true) : nd(d);
}

function ld(d: DateWithTZ) {
    d.shiftDay(daysInMonth(d) - d.day); // Last day in month.
    d.setMidnight();
    return d;
}

/**
 * @param day - Index of day
 * @returns Function, which constructs date object corresponding to `day`.
 */
function dayOfWeek(day: number): DateFunction {
    /**
     * Returns date, corresponding to specified day of week, with time set to midnight.
     * @param d - Date object, corresponding to current moment in target TZ.
     * @param next - If true, returns the future day of week in relation to `d`,
     *               otherwise returns most recent in the past.
     */
    return (d: DateWithTZ, next: boolean = false): DateWithTZ => {
        d.shiftDay((day - d.dayOfWeek + (next ? 7 : -7)) % 7);
        d.setMidnight();
        return d;
    };
}

/** Used by {@link https://github.com/axibase/charts-language-service charts-language-service}. */
export const calendarKeywordsList = Object.keys(calendarKeywords).concat(Object.keys(daysOfWeek));
