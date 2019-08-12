"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const rule = {
    name: "Validates forecast-ssa-group-manual-groups value syntax",
    check(section) {
        const setting = section.getSettingFromTree("forecast-ssa-group-manual-groups");
        if (setting === void 0) {
            return;
        }
        if (!/^[\d\s,;-]+$/.test(setting.value)) {
            return util_1.createDiagnostic(setting.textRange, "Incorrect group syntax");
        }
    }
};
exports.default = rule;
