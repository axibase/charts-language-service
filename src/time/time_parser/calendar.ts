/**
 * @module calendar
 */
import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { DateFunction, daysInMonth, isWorkingDay } from "./utils";

/**
 * Returns {@link DateFunction}, corresponding to keyword.
 */
export function parseCalendarKeyword(keyword: string): DateFunction {
    return calendarKeywords[keyword] || daysOfWeek[keyword];
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
    "current_working_day": (d) => {
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
    return new DateWithTZ(undefined, d.zone);
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
