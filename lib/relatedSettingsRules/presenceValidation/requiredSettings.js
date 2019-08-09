(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../messageUtil", "../../util", "../utils/condition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const messageUtil_1 = require("../../messageUtil");
    const util_1 = require("../../util");
    const condition_1 = require("../utils/condition");
    /**
     * If key (dependent) is declared in the section and the section matches all of conditions, then:
     *   a) setting, specified in `requiredSetting` is required for this section;
     *      or
     *   b) required at least one setting from `requiredSetting` array.
     * If `conditions` are null, suppose the section matches conditions.
     */
    const checks = new Map([
        [
            "colors", {
                /**
                 * If "colors" is specified:
                 *  1) check that:
                 *      1) "type" is "calendar", "treemap " or "gauge";
                 *      2) "mode" is "half" or "default";
                 *  2) require "thresholds" (try to search in tree and create Diagnostic if neccessary).
                 */
                conditions: [
                    condition_1.requiredCondition("type", ["calendar", "treemap", "gauge"]),
                    condition_1.requiredCondition("mode", ["half", "default"])
                ],
                requiredSetting: "thresholds"
            }
        ],
        [
            "forecast-horizon-start-time", {
                /**
                 * If "forecast-horizon-start-time" is specified:
                 *  1) check that "type" is "chart";
                 *  2) require any of "forecast-horizon-end-time", "forecast-horizon-interval", "forecast-horizon-length".
                 */
                conditions: [
                    condition_1.requiredCondition("type", ["chart"])
                ],
                requiredSetting: ["forecast-horizon-end-time", "forecast-horizon-interval", "forecast-horizon-length"]
            }
        ],
        [
            "table", {
                /**
                 * If "table" is specified, require "attribute".
                 */
                requiredSetting: "attribute"
            }
        ],
        [
            "attribute", {
                requiredSetting: "table"
            }
        ],
        [
            "column-alert-style", {
                conditions: [
                    condition_1.requiredCondition("type", ["bar"])
                ],
                requiredSetting: "column-alert-expression"
            }
        ],
        [
            "alert-style", {
                requiredSetting: "alert-expression"
            }
        ],
        [
            "link-alert-style", {
                conditions: [
                    condition_1.requiredCondition("type", ["graph"])
                ],
                requiredSetting: "alert-expression"
            }
        ],
        [
            "node-alert-style", {
                conditions: [
                    condition_1.requiredCondition("type", ["graph"])
                ],
                requiredSetting: "alert-expression"
            }
        ],
        [
            "icon-alert-style", {
                conditions: [
                    condition_1.requiredCondition("type", ["pie", "text"])
                ],
                requiredSetting: "icon-alert-expression"
            }
        ],
        [
            "icon-alert-expression", {
                conditions: [
                    condition_1.requiredCondition("type", ["pie"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-color", {
                conditions: [
                    condition_1.requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-position", {
                conditions: [
                    condition_1.requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-size", {
                conditions: [
                    condition_1.requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "caption-style", {
                conditions: [
                    condition_1.requiredCondition("type", ["pie", "gauge"])
                ],
                requiredSetting: "caption"
            }
        ]
    ]);
    const rule = {
        name: "Checks presence of required setting if dependent is specified",
        check(section) {
            const diagnostics = [];
            checks.forEach((requirement, dependent) => {
                if (!section.matchesConditions(requirement.conditions)) {
                    return;
                }
                const dependentSetting = section.getSettingFromTree(dependent);
                if (dependentSetting === undefined) {
                    return;
                }
                const reqNames = requirement.requiredSetting;
                let required;
                let msg;
                if (Array.isArray(reqNames)) {
                    for (const displayName of reqNames) {
                        required = section.getSettingFromTree(displayName);
                        if (required) {
                            break;
                        }
                    }
                    msg = messageUtil_1.noRequiredSettings(dependent, reqNames);
                }
                else {
                    required = section.getSettingFromTree(reqNames);
                    msg = messageUtil_1.noRequiredSetting(dependent, reqNames);
                }
                if (required === undefined) {
                    diagnostics.push(util_1.createDiagnostic(section.range.range, msg));
                }
            });
            return diagnostics;
        }
    };
    exports.default = rule;
});
