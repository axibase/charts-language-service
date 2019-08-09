"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = require("../../time");
const rule = {
    name: "Validates forecast-horizon-start-time value",
    check(section) {
        let forecast = section.getSettingFromTree("forecast-horizon-start-time");
        if (forecast === undefined) {
            return;
        }
        const errors = [];
        time_1.parseTimeValue(forecast, section, errors);
        if (errors.length > 0) {
            return errors[0];
        }
    }
};
exports.default = rule;