(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const util_1 = require("../../util");
    /**
     * Returns function, which validates value of specified setting.
     *
     * @param settingName - Name of the setting
     * @param possibleValues  - Values that can be assigned to the setting
     * @returns The function, which checks that value of setting with name `settingName` is any of `possibleValues`
     */
    function requiredCondition(settingName, possibleValues) {
        return (section) => {
            const value = util_1.getValueOfSetting(settingName, section);
            return value ? new RegExp(possibleValues.join("|")).test(value.toString()) : true;
        };
    }
    exports.requiredCondition = requiredCondition;
    /**
     * Returns function, which validates value of specified setting and generates string
     * with allowed values if check is not passed.
     *
     * @param settingName - Name of the setting
     * @param possibleValues - Values that can be assigned to the setting
     * @returns The function, which checks that value of setting with name `settingName` is any of `possibleValues`
     *          and generates info string if check is not passed
     */
    function isNotUselessIf(settingName, possibleValues) {
        return (section) => {
            const value = util_1.getValueOfSetting(settingName, section);
            const valueIsOk = value ? new RegExp(possibleValues.join("|")).test(value.toString()) : true;
            if (!valueIsOk) {
                if (possibleValues.length > 1) {
                    return `${settingName} is one of ${possibleValues.join(", ")}`;
                }
                else {
                    return `${settingName} is ${possibleValues[0]}`;
                }
            }
            return null;
        };
    }
    exports.isNotUselessIf = isNotUselessIf;
});
