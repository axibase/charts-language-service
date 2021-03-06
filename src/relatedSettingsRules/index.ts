import groupPlaceSettings from "./presenceValidation/groupPlaceSettings";
import iconSettings from "./presenceValidation/iconSettings";
import metricsAndEvaluateExpr from "./presenceValidation/metricsAndEvaluateExpr";
import { noUselessSettingsForSeries, noUselessSettingsForWidget } from "./presenceValidation/noUselessSettings";
import simultaneousTimeSettings from "./presenceValidation/noUselessSettings/simultaneousTimeSettings";
import widgetsDimensions from "./presenceValidation/noUselessSettings/widgetsDimensions";
import requiredForColumn from "./presenceValidation/requiredForColumn";
import requiredForDropdown from "./presenceValidation/requiredForDropdown";
import requiredForNode from "./presenceValidation/requiredForNode";
import requiredForSeriesAlways from "./presenceValidation/requiredForSeriesAlways";
import requiredForSeriesOnConditions from "./presenceValidation/requiredForSeriesOnConditions";
import requiredForWidget from  "./presenceValidation/requiredForWidget";
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
import workingMinutes from "./valueValidation/workingMinutes";

const rulesBySection: Map<string, Rule[]> = new Map<string, Rule[]>([
    [
        "column", [
            requiredForColumn
        ]
    ],
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
            groupPlaceSettings,
            iconSettings,
            metricsAndEvaluateExpr,
            noUselessSettingsForSeries,
            requiredForSeriesAlways,
            requiredForSeriesOnConditions,
            workingMinutes
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
            addMetaAndLabelFormat,
            requiredForWidget
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
