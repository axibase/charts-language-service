"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const util_1 = require("../../util");
const rule = {
    name: "Checks start-time is greater than end-time",
    check(section) {
        const end = section.getSettingFromTree("end-time");
        const start = section.getSettingFromTree("start-time");
        if (end === undefined || start === undefined) {
            return;
        }
        if (start.value >= end.value) {
            return util_1.Util.createDiagnostic(end.textRange, `${end.displayName} must be greater than ${start.displayName}`, vscode_languageserver_types_1.DiagnosticSeverity.Error);
        }
    }
};
exports.default = rule;
