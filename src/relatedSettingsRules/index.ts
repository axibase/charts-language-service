import groupPlaceSettings from "./presenceValidation/groupPlaceSettings";
import iconSettings from "./presenceValidation/iconSettings";
import metricsAndEvaluateExpr from "./presenceValidation/metricsAndEvaluateExpr";
import { noUselessSettingsForSeries, noUselessSettingsForWidget } from "./presenceValidation/noUselessSettings";
import simultaneousTimeSettings from "./presenceValidation/noUselessSettings/simultaneousTimeSettings";
import widgetsDimensions from "./presenceValidation/noUselessSettings/widgetsDimensions";
import requiredSettings from "./presenceValidation/requiredSettings";
import { Rule } from "./utils/interfaces";
import addMetaAndLabelFormat from "./valueValidation/addMetaAndLabelFormat";
import calendarTimespan from "./valueValidation/calendarTimespan";
import colorsThresholds from "./valueValidation/colorsThresholds";
import forecastAutoCountAndEigentripleLimit from "./valueValidation/forecastAutoCountAndEigentripleLimit";
import forecastEndTime from "./valueValidation/forecastEndTime";
import forecastSsaGroupAutoUnion from "./valueValidation/forecastSsaGroupAutoUnion";
import forecastSsaGroupManualGroups from "./valueValidation/forecastSsaGroupManualGroups";
import forecastStartTime from "./valueValidation/forecastStartTime";
import paletteTicks from "./valueValidation/paletteTicks";
import sort from "./valueValidation/sort";
import startEndTime from "./valueValidation/startEndTime";
import summarizePeriodTimespan from "./valueValidation/summarizePeriodTimespan";
import widgetsGridOverflow from "./valueValidation/widgetsGridOverflow";
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
            groupPlaceSettings,
            iconSettings,
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
            sort,
            summarizePeriodTimespan,
            widgetsDimensions,
            addMetaAndLabelFormat
        ]
    ],
    [
        "group", [
            widgetsGridOverflow,
            widgetsPerRow
        ]
    ]
]);

export default rulesBySection;
