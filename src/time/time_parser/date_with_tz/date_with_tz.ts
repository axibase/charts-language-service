import { TimeParseError } from "../time_parse_error";
import { objToTS, offset, tsToObj } from "./offset";
import { CalendarObject, UtilZone } from "./util";

/**
 * Allows to use both +/- and 1/-1 as sign, to improve readability.
 */
export enum Coefficient {
    "+" = 1,
    "-" = -1
}

export namespace Coefficient {
    export function parse(k: string | number): Coefficient {
        return typeof k === "string" ? Coefficient[k] : k;
    }
}

/**
 * Provides functionality to process the Date in any timezone, not only local and UTC.
 * Object is mutable.
 * @example new DateWithTZ() - date, corresponding to "now" in local TZ
 * @example new DateWIthTZ(void 0, "America/Toronto") - date, corresponding to "now" in America/Toronto
 * @example new DateWIthTZ("2019-06-04 10:00:00", "America/Toronto") - date, corresponding to "2019-06-04 10:00:00"
 *                                                                     in America/Toronto
 * @example new DateWIthTZ("2019-06-04 10:00:00", "local") - date, corresponding to "2019-06-04 10:00:00"
 *                                                           in local TZ
 * @example new DateWIthTZ("2019-06-04 10:00:00-04:00", "fixed") - date, corresponding to "2019-06-04 10:00:00" with
 *                                                                 fixed offset; no offset check is performed
 *                                                                 @see parseIsoLikeTemplate
 * @example new DateWIthTZ("2019-06-04 10:00:00", "UTC")
 *              .shift("1", "year", "+")
 *              .toISOString() => "2020-06-04T10:00:00.000Z"
 * @example DateWithTZ.now("UTC") - millis, corresponding to "now" in "UTC"
 */
export class DateWithTZ {
    /**
     * Difference between target TZ and UTC in minutes.
     * This field is need to be stored to catch offset change, for example, in case of DST time movements.
     * @see objToTS
     */
    private offset: number;
    /**
     * [IANA timezone name]{@link https://axibase.com/docs/atsd/shared/timezone-list.html#time-zones}, "local" or
     * "fixed" (date is created from template with offset, use "fixed" to prevent extra offset recalculations).
     */
    public readonly zone: string;
    /**
     * Timestamp with the offset taken into account.
     */
    private _timestamp: number;
    /** Date components in target time zone. */
    private _millisecond: number;
    private _second: number;
    private _minute: number;
    private _hour: number;
    private _day: number;
    private _month: number;
    private _year: number;

    /**
     * @param dateTemplate - String or timestamp, from which date is need to be built
     * @param [tz='local'] - Zone ID, @see {@link zone}
     * @throws TimeParseError The following restrictions are applied to `dateTemplate`:
     *                          1) it must be a string, if tz is "fixed";
     *                          2) it must be parsable by standard Date constructor.
     */
    constructor(dateTemplate?: string | number, tz: string = UtilZone.LOCAL) {
        tz = tz.toLowerCase();
        if (tz === UtilZone.FIXED && typeof dateTemplate !== "string") {
            throw new TimeParseError(
                "Incorrect date template: date with fixed offset can be built only from string",
                dateTemplate);
        }
        this.zone = tz;
        if (typeof dateTemplate === "number") {
            this.constructFromMillis(dateTemplate);
        } else {
            const date = dateTemplate !== undefined ? new Date(dateTemplate) :
                /** Use Date.now() instead of empty argument to provide the way to mock current moment in tests. */
                new Date(Date.now());
            if (date == null || !isFinite(+date)) {
                throw new TimeParseError("Incorrect date template", dateTemplate);
            }
            if (tz === UtilZone.FIXED) {
                /**
                 * No DST and etc. adjustments are required if initial `dateTemplate` contains tz offset.
                 * Components are set in parseDate and parseTime,
                 * i.e. "fixed" is used only in {@link parseIsoLikeTemplate}.
                 */
                this.timestamp = date.getTime();
            } else {
                this.setComponents(date);
                this.guaranteeCorrectOffset();
            }
        }
    }

    /**
     * Constructs object in given timezone using milliseconds.
     *
     * @param millis - Milliseconds
     * @param [calculateOffset=true] - If true, calculates offset:
     *                                  - true used by {@link constructor}
     *                                  - false used by {@link shift}
     */
    private constructFromMillis(millis: number, calculateOffset = true) {
        if (calculateOffset) {
            this.offset = offset(millis, this.zone);
        }
        this._timestamp = millis;
        const calendarObj = tsToObj(millis, this.offset);
        this.setComponents(calendarObj);
    }

    /**
     * Returns milliseconds with offset, corresponding to current moment in specified zone.
     *  - Date.now() - returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
     *  - DateWithTZ.now() - returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC ± offset
     *
     * @param [zone] - Zone ID, @see {@link zone}
     */
    public static now(zone?: string) {
        return zone && zone.toLowerCase() === UtilZone.LOCAL ? Date.now() :
            new DateWithTZ(undefined, zone).getTime();
    }

    private componentsAsObject(): CalendarObject {
        return {
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.hour,
            minute: this.minute,
            second: this.second,
            millisecond: this.millisecond
        };
    }

    private setComponents(src: Date | CalendarObject) {
        if (src instanceof Date) {
            this._year = src.getFullYear();
            this._month = src.getMonth();
            this._day = src.getDate();
            this._hour = src.getHours();
            this._minute = src.getMinutes();
            this._second = src.getSeconds();
            this._millisecond = src.getMilliseconds();
        } else {
            this._year = src.year;
            this._month = src.month;
            this._day = src.day;
            this._hour = src.hour;
            this._minute = src.minute;
            this._second = src.second;
            this._millisecond = src.millisecond;
        }
    }

    /**
     * Checks offset and adjusts it if necessary (i.e. DST movement).
     */
    private guaranteeCorrectOffset() {
        if (this.zone === UtilZone.FIXED) {
            return;
        }
        const [ts, o] = objToTS(this.componentsAsObject(), this.offset || 0, this.zone);
        this.offset = o;
        this._timestamp = ts;
    }

    /**
     * Adds (sign=1) or subtracts (sign=-1) value of `sign*c*u`.
     *
     * @param c - Count
     * @param u - Unit
     * @param sign - "+" or  1, interval is added to date,
     *               "-" or -1, interval is subtracted from date
     * @throws TimeParseError The following restrictions are applied to parameters:
     *                          1) sign must be one of "+", "-", "1", "-1"
     *                          2) count must be a number, i.e. 5, 1.8 and etc.
     *                          3) unit must be one of
     *                             year, quarter, month, week, day, hour, minute, min, second, sec, millisecond
     * @example new DateWIthTZ("UTC", "2019-06-04 10:00:00")
     *              .shift("1", "year", "+")
     *              .toISOString() => "2020-06-04T10:00:00.000Z"
     */
    public shift(c: string, u: string, sign: string | number) {
        const k = Coefficient.parse(sign);
        if (k === undefined || k !== 1 && k !== -1) {
            throw new TimeParseError("Incorrect sign", sign);
        }
        let count = parseFloat(c);
        if (!isFinite(count)) {
            throw new TimeParseError("Count must be a number", c);
        }
        count = k * count;
        const unit = u.toLowerCase();
        /** Update corresponding component and adjust timestamp and offset (under the hood, see getters). */
        switch (unit) {
            case "year":
                this.year += count;
                break;
            case "quarter":
                this.month += 3 * count; // 1 quarter = 3 month
                break;
            case "month":
                this.month += count;
                break;
            case "week":
                this.day += 7 * count; // 1 week = 7 day
                break;
            case "day":
                this.day += count;
                break;
            case "hour":
                this.hour += count;
                break;
            case "minute":
            case "min":
                this.minute += count;
                break;
            case "second":
            case "sec":
                this.second += count;
                break;
            case "millisecond":
                this.millisecond += count;
                break;
            default:
                throw new TimeParseError("Incorrect interval unit", unit);
        }
        /**
         * Guarantee correct components.
         * For example, c = 25, unit = hour => at least this.day must be increased.
         */
        this.constructFromMillis(this._timestamp, false);
    }

    public toISOString() {
        return new Date(this._timestamp).toISOString();
    }

    /** @override */
    public toString() {
        return this.toISOString();
    }

    /** @override */
    public valueOf() {
        return this._timestamp;
    }

    /**
     * Sets date part, i.e. year, month, day, and drops time to 00:00:00.000.
     * Used to help to reduce number of offset checks: check is performed after all components are set; in case of
     * ordinary setters, check is performed on each component change.
     */
    public setDate(year: number, month: number, day: number) {
        this._year = year;
        this._month = month;
        this._day = day;
        this.setTime(0, 0, 0, 0);
    }

    /**
     * Sets time part, i.e. hour, minute, second, millisecond, and checks offset.
     * Used to help to reduce number of offset checks: check is performed after all components are set; in case of
     * ordinary setters, check is performed on each component change.
     */
    public setTime(h: number, min: number, sec: number, millis: number) {
        this._hour = h;
        this._minute = min;
        this._second = sec;
        this._millisecond = millis;
        this.guaranteeCorrectOffset();
    }

    /**
     * Alias for setMidnight.
     * @see setMidnight
     */
    public roundToDay() {
        this.setMidnight();
    }

    /**
     * Alias for roundToCurrentHour.
     * @see roundToCurrentHour
     */
    public roundToHour() {
        this.roundToCurrentHour();
    }

    /**
     * Sets 00:00:00.
     */
    public setMidnight() {
        this.setTime(0, 0, 0, 0);
    }

    /**
     * Rounds to the beginning of the current hour: sets 00 minutes, 00 seconds and 000 milliseconds.
     */
    public roundToCurrentHour() {
        this.setTime(this._hour, 0, 0, 0);
    }

    /**
     * Rounds to the beginning of the current minute: sets 00 seconds and 00 milliseconds.
     */
    public roundToCurrentMinute() {
        this.setTime(this._hour, this._minute, 0, 0);
    }

    public shiftDay(offset: number) {
        if (offset !== 0) {
            this.day += offset;
        }
    }

    public shiftHour(offset: number) {
        if (offset !== 0) {
            this.hour += offset;
        }
    }

    public shiftMinute(offset: number) {
        if (offset !== 0) {
            this.minute += offset;
        }
    }

    /**
     * Setters and getters.
     */
    public get dayOfWeek() {
        return new Date(Date.UTC(this.year, this.month, this.day)).getUTCDay();
    }

    public set timestamp(ts: number) { this._timestamp = ts; }

    public get timestamp() { return this._timestamp; }

    public set year(year: number) {
        this._year = year;
        this.guaranteeCorrectOffset();
    }

    public get year() { return this._year; }

    public set month(month: number) {
        this._month = month;
        this.guaranteeCorrectOffset();
    }

    public get month() { return this._month; }

    /** Day of month. */
    public set day(day: number) {
        this._day = day;
        this.guaranteeCorrectOffset();
    }

    public get day() { return this._day; }

    public set hour(hour: number) {
        this._hour = hour;
        this.guaranteeCorrectOffset();
    }

    public get hour() { return this._hour; }

    public set minute(min: number) {
        this._minute = min;
        this.guaranteeCorrectOffset();
    }

    public get minute() { return this._minute; }

    public set second(sec: number) {
        this._second = sec;
        this.guaranteeCorrectOffset();
    }

    public get second() { return this._second; }

    public set millisecond(ms: number) {
        this._millisecond = ms;
        this.guaranteeCorrectOffset();
    }

    public get millisecond() { return this._millisecond; }

    /**
     * Getters from Date (for back compatibility).
     */
    public getFullYear() { return this._year; }

    public getMonth() { return this._month; }

    public getDate() { return this._day; }

    public getDay() { return this.dayOfWeek; }

    public getHours() { return this._hour; }

    public getMinutes() { return this._minute; }

    public getSeconds() { return this._second; }

    public getMilliseconds() { return this._millisecond; }

    public getTime() { return this._timestamp; }
}
