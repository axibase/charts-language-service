(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // yyyy-mm-dd hh:mm:ss
    exports.ISO_LIKE_DATE_TEMPLATE = 
    // tslint:disable-next-line:max-line-length
    /^\s*(([0-9]{1,4}-)*[0-9]{1,4})?(\s+|^|$)([0-9]{1,2}:[0-9]{2}(:[0-9]{2}(\.[0-9]*)?)?)?(\s+([+\-])([0-9]{2})([0-9]{2}))?\s*$/;
    /**
     * Returns 00:00:00 of the current day.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to 00:00:00 of the current day.
     */
    function getToday(d, isUTC) {
        const target = getCurrentHour(d, isUTC);
        (isUTC ? target.setUTCHours : target.setHours).call(target, 0);
        return target;
    }
    exports.getToday = getToday;
    /**
     * Returns current time rounded to the beginning of the current hour.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to 00 minutes and 00 seconds of the current hour.
     */
    function getCurrentHour(d, isUTC) {
        (isUTC ? d.setUTCMinutes : d.setMinutes).call(getCurrentMinute(d, isUTC), 0);
        return d;
    }
    exports.getCurrentHour = getCurrentHour;
    /**
     * Returns current time rounded to the beginning of the current minute.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to 00 seconds and 00 milliseconds of the current minute.
     */
    function getCurrentMinute(d, isUTC) {
        (isUTC ? d.setUTCSeconds : d.setSeconds).call(d, 0);
        (isUTC ? d.setUTCMilliseconds : d.setMilliseconds).call(d, 0);
        return d;
    }
    exports.getCurrentMinute = getCurrentMinute;
    /**
     * Returns day, shifted to specified offset.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param offset - Shift value
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to shifted day.
     */
    function shiftDay(d, offset, isUTC) {
        if (offset) {
            (isUTC ? d.setUTCDate : d.setDate).call(d, (isUTC ? d.getUTCDate() : d.getDate()) + offset);
        }
        return d;
    }
    exports.shiftDay = shiftDay;
    /**
     * Returns hour, shifted to specified offset.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param offset - Shift value
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to shifted hour.
     */
    function shiftHour(d, offset, isUTC) {
        if (offset) {
            (isUTC ? d.setUTCHours : d.setHours).call(d, (isUTC ? d.getUTCHours() : d.getHours()) + offset);
        }
        return d;
    }
    exports.shiftHour = shiftHour;
    /**
     * Returns minute, shifted to specified offset.
     *
     * @param d - Date object, which is used as base to construct target Date object
     * @param offset - Shift value
     * @param isUTC - If true, constructs target object as UTC date
     * @returns Date object, corresponding to shifted minute.
     */
    function shiftMinute(d, offset, isUTC) {
        if (offset) {
            (isUTC ? d.setUTCMinutes : d.setMinutes).call(d, (isUTC ? d.getUTCMinutes() : d.getMinutes()) + offset);
        }
        return d;
    }
    exports.shiftMinute = shiftMinute;
    /**
     * Returns number of days in current month.
     *
     * @param d - Date object, which is used as base to calculate days
     * @param isUTC - If true, evaluates d object as UTC date
     * @returns Number of days in month, corresponding to `d`.
     */
    function daysInMonth(d, isUTC) {
        const copy = new Date(d);
        (isUTC ? d.setUTCDate : d.setDate).call(copy, 32);
        (isUTC ? d.setUTCDate : d.setDate).call(copy, 0);
        return (isUTC ? d.getUTCDate : d.getDate).call(copy);
    }
    exports.daysInMonth = daysInMonth;
    /**
     * Returns true if day is sat or sun.
     *
     * @param n - Index of day to be checked
     * @returns True if `n` is 6 or 0.
     */
    function isWorkingDay(n) {
        return (n + 7) % 7 % 6;
    }
    exports.isWorkingDay = isWorkingDay;
});
