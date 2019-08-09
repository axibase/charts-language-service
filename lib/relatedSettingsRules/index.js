(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./presenceValidation/noUselessSettings/index", "./presenceValidation/noUselessSettings/simultaneousTimeSettings", "./presenceValidation/requiredSettings", "./valueValidation/colorsThresholds", "./valueValidation/forecastAutoCountAndEigentripleLimit", "./valueValidation/forecastEndTime", "./valueValidation/forecastStartTime", "./valueValidation/startEndTime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const index_1 = require("./presenceValidation/noUselessSettings/index");
    const simultaneousTimeSettings_1 = require("./presenceValidation/noUselessSettings/simultaneousTimeSettings");
    const requiredSettings_1 = require("./presenceValidation/requiredSettings");
    const colorsThresholds_1 = require("./valueValidation/colorsThresholds");
    const forecastAutoCountAndEigentripleLimit_1 = require("./valueValidation/forecastAutoCountAndEigentripleLimit");
    const forecastEndTime_1 = require("./valueValidation/forecastEndTime");
    const forecastStartTime_1 = require("./valueValidation/forecastStartTime");
    const startEndTime_1 = require("./valueValidation/startEndTime");
    const rulesBySection = new Map([
        [
            "series", [
                colorsThresholds_1.default,
                forecastEndTime_1.default,
                forecastStartTime_1.default,
                forecastAutoCountAndEigentripleLimit_1.default,
                requiredSettings_1.default,
                index_1.noUselessSettingsForSeries
            ]
        ],
        [
            "widget", [
                startEndTime_1.default,
                index_1.noUselessSettingsForWidget,
                simultaneousTimeSettings_1.default
            ]
        ]
    ]);
    exports.default = rulesBySection;
});
