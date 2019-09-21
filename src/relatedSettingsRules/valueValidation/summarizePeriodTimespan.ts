import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { parseIntervalValue } from "../../time";
import { createDiagnostic } from "../../util";
import { requiredCondition } from "../utils/condition";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "summarize-period should not be greater than timespan",
    check(section: Section): Diagnostic | void {

        if (!section.matchesConditions([
            requiredCondition("type", ["calendar"])
        ])) {
            return;
        }

        const summarizePeriod: Setting = section.getSettingFromTree("summarize-period");
        const timespan: Setting = section.getSettingFromTree("timespan");

        const summarizePeriodValue = parseIntervalValue(summarizePeriod);
        const timespanValue = parseIntervalValue(timespan);

        if (!summarizePeriodValue || !timespanValue) {
            return;
        }

        if (summarizePeriodValue > timespanValue) {
            return createDiagnostic(
                summarizePeriod.textRange,
                `The 'summarize-period' must be less than the selection interval.`,
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
