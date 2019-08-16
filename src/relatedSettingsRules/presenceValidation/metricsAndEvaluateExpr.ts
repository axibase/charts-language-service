import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "If metrics is specified, either evaluate-expression or expr block is required",
    check(section: Section): Diagnostic | void {
        const metrics = section.getSettingFromTree("metrics");
        if (metrics == null) {
            return;
        }
        if (!expressionIsDeclared(section)) {
            return createDiagnostic(section.range.range,
                "If metrics is specified, either evaluate-expression or expr block is required");
        }
    }
};

export default rule;

function expressionIsDeclared(currentSection: Section): boolean {
    while (currentSection) {
        if (!currentSection.hasExprBlock) {
            const value = currentSection.getSetting("evaluateexpression");
            if (value != null) {
                return true;
            }
        } else {
            return true;
        }
        currentSection = currentSection.parent;
    }
    return false;
}
