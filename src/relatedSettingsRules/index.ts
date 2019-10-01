import metricsAndEvaluateExpr from "./presenceValidation/metricsAndEvaluateExpr";
import { noUselessSettingsForSeries, noUselessSettingsForWidget } from "./presenceValidation/noUselessSettings/index";
import simultaneousTimeSettings from "./presenceValidation/noUselessSettings/simultaneousTimeSettings";
import requiredSettings from "./presenceValidation/requiredSettings";
import { Rule } from "./utils/interfaces";
import calendarTimespan from "./valueValidation/calendarTimespan";
import colorsThresholds from "./valueValidation/colorsThresholds";
import forecastAutoCountAndEigentripleLimit from "./valueValidation/forecastAutoCountAndEigentripleLimit";
import forecastEndTime from "./valueValidation/forecastEndTime";
import forecastSsaGroupAutoUnion from "./valueValidation/forecastSsaGroupAutoUnion";
import forecastSsaGroupManualGroups from "./valueValidation/forecastSsaGroupManualGroups";
import forecastStartTime from "./valueValidation/forecastStartTime";
import paletteTicks from "./valueValidation/paletteTicks";
import startEndTime from "./valueValidation/startEndTime";
import summarizePeriodTimespan from "./valueValidation/summarizePeriodTimespan";
import widgetsPerRow from "./valueValidation/widgetsPerRow";

const rulesBySection: Map<string, Rule[]> = new Map<string, Rule[]>([
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
            requiredSettings
        ]
    ],
    [
        "widget", [
            calendarTimespan,
            noUselessSettingsForWidget,
            paletteTicks,
            simultaneousTimeSettings,
            startEndTime,
            summarizePeriodTimespan
        ]
    ],
    [
        "group", [
            widgetsPerRow
        ]
    ]
]);

export default rulesBySection;
