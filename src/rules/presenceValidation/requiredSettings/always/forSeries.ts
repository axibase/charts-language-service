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

        let entityIsDeclared = false;
        for (const req of entitySettings) {
            const entity = section.getSettingFromTree(req);
            entityIsDeclared = entity != null;
            if (entityIsDeclared) {
                break;
            }
        }
        let metricIsDeclared = false;
        for (const req of metricSettings) {
            const metric = section.getSettingFromTree(req);
            metricIsDeclared = metric != null;
            if (metricIsDeclared) {
                break;
            }
        }
        const diagnostics: Diagnostic[] = [];
        if (!entityIsDeclared) {
            diagnostics.push(createDiagnostic(section.range.range, requiredIsMissed("entity")));
        }
        if (!metricIsDeclared) {
            const changeField = section.getSettingFromNeighbours("changefield", "dropdown");
            /**
             * [dropdown]
             *   change-field = metric
             * @see https://apps.axibase.com/chartlab/7c6ada72
             */
            const switchMetric = changeField && METRIC.test(changeField.value);
            if (!switchMetric) {
                diagnostics.push(createDiagnostic(section.range.range, requiredIsMissed("metric")));
            }
        }
        if (diagnostics.length > 0) {
            return diagnostics;
        }
    }
};

export default rule;
