"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageUtil_1 = require("../../messageUtil");
const util_1 = require("../../util");
const condition_1 = require("../utils/condition");
const rule = {
    name: "Checks colors is less than thresholds by 1",
    check(section) {
        let colorsValues;
        let thresholdsValues;
        if (!section.matchesConditions([
            condition_1.requiredCondition("type", ["calendar", "treemap", "gauge"]),
            condition_1.requiredCondition("mode", ["half", "default"])
        ])) {
            return;
        }
        const colorsSetting = section.getSettingFromTree("colors");
        if (colorsSetting === undefined) {
            return;
        }
        const thresholdsSetting = section.getSettingFromTree("thresholds");
        if (thresholdsSetting === undefined) {
            return util_1.Util.createDiagnostic(section.range.range, `thresholds is required if colors is specified`);
        }
        if (colorsSetting.values.length > 0) {
            colorsSetting.values.push(colorsSetting.value);
            colorsValues = colorsSetting.values;
        }
        else {
            /**
             * Converts 1) -> 2):
             * 1) colors = rgb(247,251,255), rgb(222,235,247), rgb(198,219,239)
             * 2) colors = rgb, rgb, rgb
             */
            colorsValues = colorsSetting.value.replace(/(\s*\d{3}\s*,?)/g, "");
            colorsValues = colorsValues.split(",").filter(s => s.trim() !== "");
        }
        if (thresholdsSetting.values.length > 0) {
            thresholdsSetting.values.push(thresholdsSetting.value);
            thresholdsValues = thresholdsSetting.values;
        }
        else {
            thresholdsValues = thresholdsSetting.value.split(",").filter(s => s.trim() !== "");
        }
        const expected = thresholdsValues.length - 1;
        if (colorsValues.length !== expected) {
            return util_1.Util.createDiagnostic(colorsSetting.textRange, messageUtil_1.incorrectColors(`${colorsValues.length}`, `${expected}`));
        }
    }
};
exports.default = rule;
