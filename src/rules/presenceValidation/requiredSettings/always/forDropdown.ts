import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../../../configTree/section";
import { requiredIsMissed } from "../../../../messageUtil";
import { createDiagnostic } from "../../../../util";
import { Rule } from "../../../utils/interfaces";

const dropDownRequirements = ["onchange", "changefield"];
const rule: Rule = {
    name: "Check [dropdown] contains either `on-change` or `change-field`",
    check(section: Section): Diagnostic | void {
        for (const req of dropDownRequirements) {
            const setting = section.getSetting(req);
            if (setting != null) {
                return;
            }
        }
        return createDiagnostic(section.range.range, requiredIsMissed("on-change or change-field"));
    }
};

export default rule;
