import { noUselessSettingsForSeries, noUselessSettingsForWidget } from "./presenceValidation/noUselessSettings";
import simultaneousTimeSettings from "./presenceValidation/noUselessSettings/noSimultaneousTimeSettings";
import requiredForDropdown from "./presenceValidation/requiredSettings/always/forDropdown";
import requiredForNode from "./presenceValidation/requiredSettings/always/forNode";
import requiredForSeries from "./presenceValidation/requiredSettings/always/forSeries";
import requiredForWidget from "./presenceValidation/requiredSettings/always/forWidget";
import metricsAndEvaluateExpr from "./presenceValidation/requiredSettings/onConditions/metricsAndEvaluateExpr";
import requiredForSeriesOnConditions from "./presenceValidation/requiredSettings/onConditions/otherSettings";
import { Rule } from "./utils/interfaces";
import colorsThresholds from "./valueValidation/colorsThresholds";
import forecastAutoCountAndEigentripleLimit from "./valueValidation/forecastAutoCountAndEigentripleLimit";
import forecastEndTime from "./valueValidation/forecastEndTime";
import forecastSsaGroupAutoUnion from "./valueValidation/forecastSsaGroupAutoUnion";
import forecastSsaGroupManualGroups from "./valueValidation/forecastSsaGroupManualGroups";
import forecastStartTime from "./valueValidation/forecastStartTime";
import startEndTime from "./valueValidation/startEndTime";

const rulesBySection: Map<string, Rule[]> = new Map<string, Rule[]>([
    [
        "dropdown", [
            requiredForDropdown
        ]
    ],
    [
        "node", [
            requiredForNode
        ]
    ],
    [
        "series", [
            colorsThresholds,
            forecastAutoCountAndEigentripleLimit,
            forecastEndTime,
            forecastSsaGroupAutoUnion,
            forecastSsaGroupManualGroups,
            forecastStartTime,
            metricsAndEvaluateExpr,
            noUselessSettingsForSeries,
            requiredForSeries,
            requiredForSeriesOnConditions
        ]
    ],
    [
        "widget", [
            noUselessSettingsForWidget,
            requiredForWidget,
            simultaneousTimeSettings,
            startEndTime
        ]
    ]
]);

export default rulesBySection;
