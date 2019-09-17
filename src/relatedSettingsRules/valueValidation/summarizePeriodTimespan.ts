import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { parseTimeValue } from "../../time";
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

        if (summarizePeriod === undefined || timespan === undefined) {
            return;
        }

        const summarizePeriodDate = parseTimeValue(summarizePeriod, section, []);
        const timespanDate = parseTimeValue(timespan, section, []);

        if (summarizePeriodDate.getTime() > timespanDate.getTime()) {
            return createDiagnostic(
                summarizePeriod.textRange,
                `For calendar summarize-period should not be greater than timespan`,
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
