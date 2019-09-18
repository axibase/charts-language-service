import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { requiredCondition } from "../utils/condition";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "calendar requires a definitive timespan (all is not allowed)",
    check(section: Section): Diagnostic | void {

        if (!section.matchesConditions([
            requiredCondition("type", ["calendar"])
        ])) {
            return;
        }

        const timespan: Setting = section.getSettingFromTree("timespan");

        if (timespan === undefined) {
            return;
        }

        if (timespan.value === "all") {
            return createDiagnostic(
                timespan.textRange,
                `calendar requires a definitive timespan (all is not allowed)`,
                DiagnosticSeverity.Error
            );
        }
    }
};

export default rule;
