"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const messageUtil_1 = require("../../../messageUtil");
const util_1 = require("../../../util");
const rule = {
    name: "Start-time, end-time and timespan mustn't be declared sumultaneously",
    check(section) {
        const startTime = section.getSettingFromTree("start-time");
        const endTime = section.getSettingFromTree("end-time");
        const timespan = section.getSettingFromTree("timespan");
        if (startTime && endTime && timespan) {
            return util_1.createDiagnostic(section.range.range, messageUtil_1.simultaneousTimeSettingsWarning(), vscode_languageserver_types_1.DiagnosticSeverity.Warning);
        }
    }
};
exports.default = rule;