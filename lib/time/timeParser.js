(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./timeParseError", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const timeParseError_1 = require("./timeParseError");
    const utils_1 = require("./utils");
    class TimeParser {
        constructor(timezoneValue = "") {
            /**
             * If true, {@link parseDateTemplate} constructs target Date object as UTC date.
             */
            this.isUTC = false;
            this.calendarKeywords = new Map([
                ["time", () => {
                        return Date.now();
                    }],
                ["now", () => {
                        return Date.now();
                    }],
                ["date", () => {
                        return new Date();
                    }],
                ["sec", () => {
                        return 1000;
                    }],
                ["second", () => {
                        return 1000;
                    }],
                ["min", () => {
                        return 60000;
                    }],
                ["minute", () => {
                        return 60000;
                    }],
                ["hour", () => {
                        return 3600000;
                    }],
                ["day", () => {
                        return 86400000;
                    }],
                ["week", () => {
                        return 604800000;
                    }],
                ["month", () => {
                        return 2592000000;
                    }],
                ["year", () => {
                        return 31536000000;
                    }],
                ["current_minute", (d) => {
                        return utils_1.getCurrentMinute(d, this.isUTC);
                    }],
                ["current_hour", (d) => {
                        return utils_1.getCurrentHour(d, this.isUTC);
                    }],
                ["current_day", (d) => {
                        return utils_1.getToday(d, this.isUTC);
                    }],
                ["today", (d) => {
                        return utils_1.getToday(d, this.isUTC);
                    }],
                ["current_week", this.cw],
                ["current_month", this.cm],
                ["first_day", this.cm],
                ["current_quarter", (d) => {
                        return this._setMonth(this.cm(d), Math.floor(this._getMonth(d) / 3) * 3);
                    }],
                ["current_year", (d) => {
                        return this._setMonth(this.cm(d), 0);
                    }],
                ["previous_minute", (d) => {
                        utils_1.getCurrentMinute(d, this.isUTC);
                        return utils_1.shiftMinute(d, -1, this.isUTC);
                    }],
                ["previous_hour", (d) => {
                        utils_1.getCurrentHour(d, this.isUTC);
                        return utils_1.shiftHour(d, -1, this.isUTC);
                    }],
                ["previous_day", this.pd],
                ["yesterday", this.pd],
                ["previous_week", (d) => {
                        utils_1.shiftDay(d, -7, this.isUTC);
                        return this.cw(d);
                    }],
                ["previous_month", (d) => {
                        return this._setMonth(this.cm(d), this._getMonth(d) - 1);
                    }],
                ["previous_quarter", (d) => {
                        return this._setMonth(this.cm(d), (Math.floor(this._getMonth(d) / 3) - 1) * 3);
                    }],
                ["previous_year", (d) => {
                        return this._setMonth(this.cm(d), -12);
                    }],
                ["previous_working_day", this.pwd],
                ["previous_vacation_day", this.pvd],
                ["next_minute", (d) => {
                        utils_1.getCurrentMinute(d, this.isUTC);
                        return utils_1.shiftMinute(d, 1, this.isUTC);
                    }],
                ["next_hour", (d) => {
                        utils_1.getCurrentHour(d, this.isUTC);
                        return utils_1.shiftHour(d, 1, this.isUTC);
                    }],
                ["next_day", this.nd],
                ["tomorrow", this.nd],
                ["next_week", (d) => {
                        utils_1.shiftDay(d, 7, this.isUTC);
                        return this.cw(d);
                    }],
                ["next_month", (d) => {
                        return this._setMonth(this.cm(d), this._getMonth(d) + 1);
                    }],
                ["next_quarter", (d) => {
                        return this._setMonth(this.cm(d), (Math.floor(this._getMonth(d) / 3) + 1) * 3);
                    }],
                ["next_year", (d) => {
                        return this._setMonth(this.cm(d), 12);
                    }],
                ["next_working_day", this.nwd],
                ["next_vacation_day", this.nvd],
                ["last_day", this.ld],
                ["last_working_day", (d) => {
                        const lastDay = this.ld(d);
                        return utils_1.isWorkingDay(this._getDay(lastDay)) ? lastDay : this.pwd(lastDay);
                    }],
                ["last_vacation_day", (d) => {
                        const lastDay = this.ld(d);
                        return utils_1.isWorkingDay(this._getDay(lastDay)) ? this.pvd(lastDay) : lastDay;
                    }],
                ["first_working_day", (d) => {
                        const firstDay = this.cm(d);
                        return utils_1.isWorkingDay(this._getDay(firstDay)) ? firstDay : this.nwd(firstDay);
                    }],
                ["first_vacation_day", (d) => {
                        const firstDay = this.cm(d);
                        return utils_1.isWorkingDay(this._getDay(firstDay)) ? this.nvd(firstDay) : firstDay;
                    }],
                ["sunday", this.dayOfWeek(0)],
                ["sun", this.dayOfWeek(0)],
                ["monday", this.dayOfWeek(1)],
                ["mon", this.dayOfWeek(1)],
                ["tuesday", this.dayOfWeek(2)],
                ["tue", this.dayOfWeek(2)],
                ["wednesday", this.dayOfWeek(3)],
                ["wed", this.dayOfWeek(3)],
                ["thursday", this.dayOfWeek(4)],
                ["thu", this.dayOfWeek(4)],
                ["friday", this.dayOfWeek(5)],
                ["fri", this.dayOfWeek(5)],
                ["saturday", this.dayOfWeek(6)],
                ["sat", this.dayOfWeek(6)]
            ]);
            this.isUTC = /^utc$/i.test(timezoneValue);
        }
        /**
         * Main parsing method. Parses time setting value to Date object in the following order:
         *  a) tries to parse as ISO-like string or Unix timestamp as string;
         *  b) if fails (null is produced), tries to parse as calendar expression.
         *
         * @param settingValue - Date template string, which need to be parsed.
         *                       Can be either ISO-like string or calendar expression
         * @returns Date object, corresponding to `settingValue` template.
         */
        parseDateTemplate(settingValue) {
            const v = settingValue.trim();
            const now = Date.now();
            const d = this.parseIsoLikeTemplate(v, now);
            if (d !== null) {
                return d;
            }
            // start-time = current_day + 9 hour + 50 minute
            const baseAndSpan = v.split(/([+\-])/);
            const base = baseAndSpan[0]; // current_day
            const parsedKeyword = this.parseCalendarKeyword(base, now);
            if (parsedKeyword == null) {
                throw new timeParseError_1.TimeParseError(settingValue, "Incorrect time template");
            }
            const baseTime = new Date(parsedKeyword);
            const span = v.substr(base.length); //  + 9 hour + 50 minute
            return span.length === 0 ? baseTime : this.parseIntervalExpression(span, baseTime);
        }
        /**
         * Parses span part of calendar expression and adds it to parsed base part. For example,
         * for expression "current_day + 9 hour + 50 minute", base part is "current_day"
         * and timespan is "+ 9 hour + 50 minute".
         *
         * @param timespan - Span part of calendar expression to be parsed and processed
         * @param baseTime - Parsed base part of calendar expression
         * @returns Date object, corresponding to parsed calendar expression.
         * @throws TimeParseError The following restrictions are applied to `timespan`:
         *                          1) must be in `<[+,-] count [*] unit>` format, e.g. "8 hour", "1 day";
         *                          2) unit must be one of
         *                            [year, quarter, month, week, day, hour, minute, min, second, sec, millisecond].
         */
        parseIntervalExpression(timespan, baseTime) {
            // <[+,-] count [*] unit>, e.g. -0.5*hour, + 1 day
            const CHECK_SPAN_SYNTAX = /^\s*(([+\-])\s*\d+(\.\d+)?\s*\*?\s*[A-Za-z]+\s*)*$/g;
            if (!CHECK_SPAN_SYNTAX.test(timespan)) {
                throw new timeParseError_1.TimeParseError(timespan, "Incorrect interval syntax");
            }
            const sign = 1;
            const PARSE_SPAN_SYNTAX = /\s*([+\-])\s*(\d+(?:\.\d+)?)\s*\*?\s*([A-Za-z]+)\s*/g;
            let m = PARSE_SPAN_SYNTAX.exec(timespan);
            while (m) {
                let count;
                let unit;
                let currentSign = m[1] === "-" ? -sign : sign;
                count = currentSign * +m[2];
                unit = m[3].toLowerCase();
                switch (unit) {
                    case "year":
                        baseTime.setFullYear(baseTime.getFullYear() + count);
                        break;
                    case "quarter":
                        baseTime.setMonth(baseTime.getMonth() + 3 * count);
                        break;
                    case "month":
                        baseTime.setMonth(baseTime.getMonth() + count);
                        break;
                    case "week":
                        baseTime.setTime(baseTime.getTime() + count * 604800000);
                        break;
                    case "day":
                        baseTime.setTime(baseTime.getTime() + count * 86400000);
                        break;
                    case "hour":
                        baseTime.setTime(baseTime.getTime() + count * 3600000);
                        break;
                    case "min": /* alias to 'minute' */
                    case "minute":
                        baseTime.setTime(baseTime.getTime() + count * 60000);
                        break;
                    case "sec": /* alias to 'second' */
                    case "second":
                        baseTime.setTime(baseTime.getTime() + count * 1000);
                        break;
                    case "millisecond":
                        baseTime.setTime(baseTime.getTime() + count);
                        break;
                    default:
                        throw new timeParseError_1.TimeParseError(unit, "Incorrect interval unit");
                }
                m = PARSE_SPAN_SYNTAX.exec(timespan);
            }
            return baseTime;
        }
        /**
         * Parses date part and returns Date object, corresponding to date template.
         *
         * @param dateTemplate - Date template string in format yyyy-mm-dd
         * @param d - Date object, which is used as base to construct target Date object
         * @returns Date object, corresponding to `dateTemplate`.
         */
        parseDate(dateTemplate, d) {
            const dateComponents = dateTemplate.split("-");
            let year;
            if (dateComponents[0].length > 2 || dateComponents.length === 3) {
                year = +dateComponents[0];
            }
            let month;
            if (year != null) {
                month = +dateComponents[1] || 1;
            }
            else if (dateComponents.length === 2) {
                month = +dateComponents[0];
            }
            let day;
            if (year != null) {
                day = +dateComponents[2] || 1;
            }
            else {
                day = month != null ? dateComponents[1] : dateComponents[0];
            }
            if (month != null) {
                month = (month <= 0) ? 1 : (month > 12) ? 12 : month;
                /* bound month number */
                month = +month - 1;
                /* in JavaScript month are counted from 0 */
            }
            // Set only year and month, because number of days depends on the specified month and year.
            if (year != null) {
                if (this.isUTC) {
                    d.setUTCFullYear(+year, +month, 1);
                }
                else {
                    d.setFullYear(+year, +month, 1);
                }
            }
            else {
                if (month != null) {
                    if (this.isUTC) {
                        d.setUTCMonth(+month, 1);
                    }
                    else {
                        d.setMonth(+month, 1);
                    }
                }
            }
            day = (day <= 0) ? 1 : Math.min(+day, utils_1.daysInMonth(d, this.isUTC));
            if (this.isUTC) {
                d.setUTCDate(day);
            }
            else {
                d.setDate(day);
            }
            return d;
        }
        /**
         * Parses time part and returns Date object, corresponding to time template.
         *
         * @param match - Date template string, parsed to RegExpMatchArray
         * @param d - Date object, which is used as base to construct target Date object
         * @returns Date object, corresponding to time part of `match`.
         */
        parseTime(match, d) {
            const timeComponents = match[4] ? match[4].split(/[:.]/) : null;
            if (timeComponents !== null) {
                (this.isUTC ? d.setUTCHours : d.setHours).call(d, +timeComponents[0]);
                (this.isUTC ? d.setUTCMinutes : d.setMinutes).call(d, +timeComponents[1]);
                (this.isUTC ? d.setUTCSeconds : d.setSeconds).call(d, +timeComponents[2] || 0);
                (this.isUTC ? d.setUTCMilliseconds : d.setMilliseconds)
                    .call(d, timeComponents[3] ? Math.round(+(`0.${timeComponents[3]}`) * 1000) : 0);
            }
            else {
                utils_1.getToday(d, this.isUTC);
            }
            if (match[7]) {
                let dm = +(match[8] + 1) * (+match[9] * 60 + +match[10]);
                if (isFinite(dm)) {
                    if (!this.isUTC) {
                        dm += d.getTimezoneOffset();
                    }
                    if (dm) {
                        d.setMinutes(d.getMinutes() - dm);
                    }
                }
            }
            return d;
        }
        /**
         * Parses template string to Date object. In addition to formats, accepted by Date constructor,
         * there are some others ISO-like yyyy-mm-dd hh:mm:ss,
         * see timeParser.parseDate.test.ts and timeParser.parseTime.test.ts.
         *
         * @param template - Date template string.
         * @param t - Unix timestamp, which is used as base to construct target Date object
         * @returns Date object, corresponding to `template`.
         * @throws TimeParseError Date must be greater than start of Unix epoch.
         */
        parseIsoLikeTemplate(template, t) {
            let d;
            /**
             * For example, "2016-06-09 12:15:04.005":
             * m[1] = 2016-06-09
             * m[4] = 12:15:04.005
             */
            let m = template.match(utils_1.ISO_LIKE_DATE_TEMPLATE);
            if (m != null && (m[1] != null || m[4] != null)) {
                d = new Date(t);
                if (m[1] != null) {
                    d = this.parseDate(m[1], d);
                }
                d = this.parseTime(m, d);
            }
            else {
                d = new Date(template);
                if (d == null || !isFinite(+d)) {
                    return null;
                }
            }
            const testDate = this.isUTC ? new Date("1970-01-01T00:00:00Z") : new Date("1970-01-01 00:00:00");
            if (d <= testDate) {
                throw new timeParseError_1.TimeParseError(template, "Date must be greater than 1970-01-01 00:00:00");
            }
            return d;
        }
        _getDay(d) {
            return this.isUTC ? d.getUTCDay() : d.getDay();
        }
        _getDate(d) {
            return this.isUTC ? d.getUTCDate() : d.getDate();
        }
        _getMonth(d) {
            return this.isUTC ? d.getUTCMonth() : d.getMonth();
        }
        _setMonth(d, v) {
            if (this.isUTC) {
                d.setUTCMonth(v);
            }
            else {
                d.setMonth(v);
            }
            return d;
        }
        cw(d) {
            return this.calendarKeywords.get("mon")(d);
        }
        cm(d) {
            const today = utils_1.getToday(d, this.isUTC);
            return utils_1.shiftDay(today, 1 - this._getDate(today), this.isUTC);
        }
        pd(d) {
            const today = utils_1.getToday(d, this.isUTC);
            return utils_1.shiftDay(today, -1, this.isUTC);
        }
        pwd(d) {
            return utils_1.isWorkingDay(this._getDay(d) - 1) ? this.pd(d) : this.calendarKeywords.get("fri")(d);
        }
        pvd(d) {
            return utils_1.isWorkingDay(this._getDay(d) - 1) ? this.calendarKeywords.get("sun")(d) : this.pd(d);
        }
        nd(d) {
            const today = utils_1.getToday(d, this.isUTC);
            return utils_1.shiftDay(today, 1, this.isUTC);
        }
        nwd(d) {
            return utils_1.isWorkingDay(this._getDay(d) + 1) ? this.nd(d) : this.calendarKeywords.get("mon")(d, true);
        }
        nvd(d) {
            return utils_1.isWorkingDay(this._getDay(d) + 1) ? this.calendarKeywords.get("sat")(d, true) : this.nd(d);
        }
        ld(d) {
            const today = utils_1.getToday(d, this.isUTC);
            return utils_1.shiftDay(today, utils_1.daysInMonth(today, this.isUTC) - this._getDate(today), this.isUTC);
        }
        /**
         * Returns function, which returns date corresponding to specified day of week.
         *
         * @param day - Index of day
         * @returns Function, which constructs date object corresponding to `day`.
         */
        dayOfWeek(day) {
            return (d, next = false) => {
                const today = utils_1.getToday(d, this.isUTC);
                return utils_1.shiftDay(today, (day - this._getDay(today) + (next ? 7 : -7)) % 7, this.isUTC);
            };
        }
        /**
         * Parses base part of calendar expression to Date or timestamp.
         *
         * @param value - Date template string, which need to be parsed
         * @param now - Unix timestamp, which is used as base to construct target Date object
         * @returns Date object or timestamp, corresponding to `value` template.
         * @see calendarKeywords
         */
        parseCalendarKeyword(value, now) {
            let v = value.trim();
            const parse = this.calendarKeywords.get(v);
            if (parse == null) {
                return null;
            }
            const boundParse = parse.bind(this);
            return boundParse(new Date(now));
        }
    }
    exports.TimeParser = TimeParser;
});
