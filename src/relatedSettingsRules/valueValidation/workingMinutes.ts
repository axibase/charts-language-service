import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const THRESHOLD_FUN = /^threshold_(count|duration|percent)$/;
const rule: Rule = {
    name: "start and end-working-minutes are applied only if statistic is one of THRESHOLD_* functions",
    check(section: Section): Diagnostic | void {
        const start = section.getSettingFromTree("start-working-minutes");
        const end = section.getSettingFromTree("end-working-minutes");
        if (!start && !end) {
            return;
        }
        const statistic = section.getSettingFromTree("statistic");
        if (!statistic || !THRESHOLD_FUN.test(statistic.value)) {
            createDiagnostic(
                    (statistic || start || end).textRange, "Working minutes are applied only to thresholds.\n" +
                    "Use one of threshold_count, threshold_duration or threshold_percent in 'statistic' setting",
                    DiagnosticSeverity.Error);
        }
    }
};

export default rule;
