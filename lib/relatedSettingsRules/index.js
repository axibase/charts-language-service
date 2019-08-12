"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./presenceValidation/noUselessSettings/index");
const simultaneousTimeSettings_1 = require("./presenceValidation/noUselessSettings/simultaneousTimeSettings");
const requiredSettings_1 = require("./presenceValidation/requiredSettings");
const colorsThresholds_1 = require("./valueValidation/colorsThresholds");
const forecastAutoCountAndEigentripleLimit_1 = require("./valueValidation/forecastAutoCountAndEigentripleLimit");
const forecastEndTime_1 = require("./valueValidation/forecastEndTime");
const forecastSsaGroupAutoUnion_1 = require("./valueValidation/forecastSsaGroupAutoUnion");
const forecastSsaGroupManualGroups_1 = require("./valueValidation/forecastSsaGroupManualGroups");
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
            index_1.noUselessSettingsForSeries,
            forecastSsaGroupAutoUnion_1.default,
            forecastSsaGroupManualGroups_1.default
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
