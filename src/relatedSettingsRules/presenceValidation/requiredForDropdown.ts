import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { requiredIsMissed } from "../../messageUtil";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const dropDownRequirements = ["onchange", "changefield"];
const rule: Rule = {
    name: "Check [dropdown] contains either `on-change` or `change-field`",
    check(section: Section): Diagnostic | void {
        const isDeclared = (settingName) => section.getSettingFromTree(settingName) != null;
        const isAnyDeclared = dropDownRequirements.some(isDeclared);
        if (!isAnyDeclared) {
            return createDiagnostic(section.range.range, requiredIsMissed("on-change or change-field"));
        }
    }
};

export default rule;
