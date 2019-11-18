import { calendarKeywordsList } from "./time/time_parser";

export const INTERVAL_UNITS: string[] = [
    "nanosecond", "millisecond", "second", "sec", "minute", "min", "hour", "day", "week", "month", "quarter", "year",
];

export const CALENDAR_KEYWORDS: string[] = calendarKeywordsList;

export const CONTROL_KEYWORDS = ["sql", "script", "if", "for", "var", "list", "csv", "expr"];
export const RELATIONS: string[] = [
    "!=",
    "==",
    "=",
    ">=",
    "<=",
    ">",
    "<"
];

export const BOOLEAN_KEYWORDS: string[] = [
    "false", "no", "null", "none", "0", "off", "true", "yes", "on", "1",
];

/**
 * Stat functions, supported by calendar sort
 */
export const STAT_FUNCTIONS: string[] = ["sum", "min", "max", "avg", "first", "last"];
