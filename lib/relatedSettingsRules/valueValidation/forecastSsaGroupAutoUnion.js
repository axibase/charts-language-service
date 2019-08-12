"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const rule = {
    name: "Validates forecast-ssa-group-auto-union value syntax",
    check(section) {
        const setting = section.getSettingFromTree("forecast-ssa-group-auto-union");
        if (setting === void 0) {
            return;
        }
        if (!/^[a-z\s,;-]+$/.test(setting.value)) {
            return util_1.createDiagnostic(setting.textRange, "Incorrect group union syntax");
        }
    }
};
exports.default = rule;
