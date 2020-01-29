import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { requiredIsMissed } from "../../messageUtil";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Check [widget] contains `type` setting",
    check(section: Section): Diagnostic | void {
        // Type is not inherited.
        const type = section.getSetting("type");
        if (type == null) {
            return createDiagnostic(section.range.range, requiredIsMissed("type"));
        }
    }
};

export default rule;
