export declare type DateFunction = (t?: Date, next?: boolean) => Date | number | null;
export declare const ISO_LIKE_DATE_TEMPLATE: RegExp;
/**
 * Returns 00:00:00 of the current day.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to 00:00:00 of the current day.
 */
export declare function getToday(d: Date, isUTC: boolean): Date;
/**
 * Returns current time rounded to the beginning of the current hour.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to 00 minutes and 00 seconds of the current hour.
 */
export declare function getCurrentHour(d: Date, isUTC: boolean): Date;
/**
 * Returns current time rounded to the beginning of the current minute.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to 00 seconds and 00 milliseconds of the current minute.
 */
export declare function getCurrentMinute(d: Date, isUTC: boolean): Date;
/**
 * Returns day, shifted to specified offset.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param offset - Shift value
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to shifted day.
 */
export declare function shiftDay(d: Date, offset: number, isUTC: boolean): Date;
/**
 * Returns hour, shifted to specified offset.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param offset - Shift value
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to shifted hour.
 */
export declare function shiftHour(d: Date, offset: number, isUTC: boolean): Date;
/**
 * Returns minute, shifted to specified offset.
 *
 * @param d - Date object, which is used as base to construct target Date object
 * @param offset - Shift value
 * @param isUTC - If true, constructs target object as UTC date
 * @returns Date object, corresponding to shifted minute.
 */
export declare function shiftMinute(d: Date, offset: number, isUTC: boolean): Date;
/**
 * Returns number of days in current month.
 *
 * @param d - Date object, which is used as base to calculate days
 * @param isUTC - If true, evaluates d object as UTC date
 * @returns Number of days in month, corresponding to `d`.
 */
export declare function daysInMonth(d: Date, isUTC: boolean): any;
/**
 * Returns true if day is sat or sun.
 *
 * @param n - Index of day to be checked
 * @returns True if `n` is 6 or 0.
 */
export declare function isWorkingDay(n: number): number;
