"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const messageUtil_1 = require("../../../messageUtil");
const util_1 = require("../../../util");
const forSeries_1 = require("./forSeries");
const forWidget_1 = require("./forWidget");
function getRule(checksMap) {
    return (section) => {
        const diagnostics = [];
        checksMap.forEach((conditions, dependent) => {
            const dependentSetting = section.getSettingFromTree(dependent);
            if (dependentSetting === undefined) {
                return;
            }
            const msg = conditions.map(condition => condition(section)).filter(m => m);
            if (msg.length > 0) {
                diagnostics.push(util_1.Util.createDiagnostic(dependentSetting.textRange, messageUtil_1.uselessScope(dependentSetting.displayName, `${msg.join(", ")}`), vscode_languageserver_types_1.DiagnosticSeverity.Warning));
            }
        });
        return diagnostics;
    };
}
exports.noUselessSettingsForWidget = {
    check: getRule(forWidget_1.default),
    name: "Checks absence of useless settings in [widget]"
};
exports.noUselessSettingsForSeries = {
    check: getRule(forSeries_1.default),
    name: "Checks absence of useless settings in [series]"
};
