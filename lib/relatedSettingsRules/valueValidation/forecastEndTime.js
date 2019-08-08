"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const time_1 = require("../../time");
const util_1 = require("../../util");
const rule = {
    name: "Validates forecast-horizon/end-time values and checks forecast-horizon-end-time is greater than end-time",
    check(section) {
        let forecast = section.getSettingFromTree("forecast-horizon-end-time");
        let end = section.getSettingFromTree("end-time");
        if (forecast === undefined && end === undefined) {
            return;
        }
        const errors = [];
        let parsedEnd = time_1.parseTimeValue(end, section, errors);
        let parsedForecast = time_1.parseTimeValue(forecast, section, errors);
        if (parsedForecast != null && parsedEnd != null) {
            if (parsedEnd >= parsedForecast) {
                errors.push(util_1.createDiagnostic(end.textRange, `${forecast.displayName} must be greater than ${end.displayName}`, vscode_languageserver_types_1.DiagnosticSeverity.Error));
            }
        }
        if (errors.length > 0) {
            return errors;
        }
    }
};
exports.default = rule;
