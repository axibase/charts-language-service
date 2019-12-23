import { DateWithTZ } from "./date_with_tz/date_with_tz";

/**
 * Returns number of days in current month, taking into account year type (leap or not).
 *
 * @param d - Date object, containing month, for which number of days is need to be calculated
 * @returns Number of days in month, corresponding to `d`.
 */
export function daysInMonth(d: DateWithTZ): number {
    return new Date(d.year, d.month + 1, 0).getDate();
}

/**
 * Returns false if day is sat or sun, true otherwise.
 *
 * @param n - Index of day to be checked
 */
export function isWorkingDay(n: number): boolean {
    return (n + 7) % 7 % 6 !== 0;
}

/**
 * Constructs {@link DateWithTZ} using `d` as base.
 *
 * @param d - Date object, used as base to construct target date object
 * @param [next] - Used by {@link calendar.dayOfWeek}
 */
export type DateFunction = (d: DateWithTZ, next?: boolean) => DateWithTZ;
