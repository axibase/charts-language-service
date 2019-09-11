import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../../../configTree/section";
import { requiredIsMissed } from "../../../../messageUtil";
import { createDiagnostic } from "../../../../util";
import { Rule } from "../../../utils/interfaces";

const entitySettings = ["entity", "entities", "entitygroup", "entityexpression"];
const metricSettings = ["metric", "table", "attribute"];
const METRIC: RegExp = /metric/;

const rule: Rule = {
    name: "Check all settings, required for [series] are declared",
    check(section: Section): Diagnostic[] | void {
        const value = section.getSetting("value");
        if (value != null) {
            /**
             * [series] is derived (calculated), no other settings are required.
             */
            return;
        }
        const isDeclared = (settingName) => section.getSettingFromTree(settingName) != null;
        const isEntityDeclared = entitySettings.some(isDeclared);
        const isMetricDeclared = metricSettings.some(isDeclared);
        const diagnostics: Diagnostic[] = [];
        if (!isEntityDeclared) {
            diagnostics.push(createDiagnostic(section.range.range, requiredIsMissed("entity")));
        }
        if (!isMetricDeclared) {
            const changeField = section.getSettingFromNeighbours("changefield", "dropdown");
            /**
             * [dropdown]
             *   change-field = metric
             * @see {@link https://apps.axibase.com/chartlab/7c6ada72}
             */
            const switchMetric = changeField && METRIC.test(changeField.value);
            if (!switchMetric) {
                diagnostics.push(createDiagnostic(section.range.range, requiredIsMissed("metric")));
            }
        }
        return diagnostics;
    }
};

export default rule;
