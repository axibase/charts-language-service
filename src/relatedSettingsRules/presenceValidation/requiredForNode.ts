import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { requiredIsMissed } from "../../messageUtil";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Check [node] contains `id` setting",
    check(section: Section): Diagnostic | void {
        const id = section.getSetting("id");
        if (id == null) {
            return createDiagnostic(section.range.range, requiredIsMissed("id"));
        }
    }
};

export default rule;
