"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const languageService_1 = require("../../languageService");
const rule = {
    name: "Checks forecast-ssa-group-auto-count is greater than forecast-ssa-decompose-eigentriple-limit",
    check(section) {
        const groupAutoCount = section.getSettingFromTree("forecast-ssa-group-auto-count");
        if (groupAutoCount === undefined) {
            return;
        }
        const forecastLimit = section.getSettingFromTree("forecast-ssa-decompose-eigentriple-limit");
        const eigentripleLimitValue = forecastLimit ?
            forecastLimit.value : languageService_1.LanguageService.getResourcesProvider().getSetting("forecast-ssa-decompose-eigentriple-limit").defaultValue;
        if (eigentripleLimitValue <= groupAutoCount.value) {
            return util_1.Util.createDiagnostic(groupAutoCount.textRange, `forecast-ssa-group-auto-count ` +
                `must be less than forecast-ssa-decompose-eigentriple-limit (default 0)`);
        }
    }
};
exports.default = rule;
