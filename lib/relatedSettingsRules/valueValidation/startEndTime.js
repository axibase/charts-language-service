"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const time_1 = require("../../time");
const util_1 = require("../../util");
const rule = {
    name: "Validates start/end-time values and checks start-time is greater than end-time",
    check(section) {
        const end = section.getSettingFromTree("end-time");
        const start = section.getSettingFromTree("start-time");
        if (end === undefined && start === undefined) {
            return;
        }
        const errors = [];
        let parsedEnd = time_1.parseTimeValue(end, section, errors);
        let parsedStart = time_1.parseTimeValue(start, section, errors);
        if (parsedStart != null && parsedEnd != null) {
            if (parsedStart >= parsedEnd) {
                errors.push(util_1.createDiagnostic(end.textRange, `${end.displayName} must be greater than ${start.displayName}`, vscode_languageserver_types_1.DiagnosticSeverity.Error));
            }
        }
        if (errors.length > 0) {
            return errors;
        }
    }
};
exports.default = rule;
