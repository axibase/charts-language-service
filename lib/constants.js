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
    exports.INTERVAL_UNITS = [
        "nanosecond", "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year",
    ];
    exports.CALENDAR_KEYWORDS = [
        "current_day", "current_hour", "current_minute", "current_month", "current_quarter", "current_week",
        "current_year", "first_day", "first_vacation_day", "first_working_day", "friday", "last_vacation_day",
        "last_working_day", "monday", "next_day", "next_hour", "next_minute", "next_month", "next_quarter",
        "next_vacation_day", "next_week", "next_working_day", "next_year", "now", "previous_day", "previous_hour",
        "previous_minute", "previous_month", "previous_quarter", "previous_vacation_day", "previous_week",
        "previous_working_day", "previous_year", "saturday", "sunday", "thursday", "tuesday", "wednesday",
    ];
    exports.CONTROL_KEYWORDS = ["sql", "script", "if", "for", "var", "list", "csv"];
    exports.RELATIONS = [
        "!=",
        "==",
        "=",
        ">=",
        "<=",
        ">",
        "<"
    ];
    exports.BOOLEAN_KEYWORDS = [
        "false", "no", "null", "none", "0", "off", "true", "yes", "on", "1",
    ];
});
