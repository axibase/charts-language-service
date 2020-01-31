import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const THRESHOLD_FUN = /^threshold_(count|duration|percent)$/;
const rule: Rule = {
    name: "Either min or max-threshold is required if 'statistic' is threshold_*",
    check(section: Section): Diagnostic | void {
        const statistic = section.getSettingFromTree("statistic");
        if (!statistic || !THRESHOLD_FUN.test(statistic.value)) {
            return;
        }
        const min = section.getSettingFromTree("min-threshold");
        const max = section.getSettingFromTree("max-threshold");
        if (!min && !max) {
            createDiagnostic(
                    statistic.textRange, "Either min or max-threshold is required if statistic is threshold_*",
                    DiagnosticSeverity.Error);
        }
    }
};

export default rule;
