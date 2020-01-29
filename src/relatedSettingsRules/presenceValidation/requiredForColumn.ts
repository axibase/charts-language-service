import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { noRequiredSetting } from "../../messageUtil";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "If summary-text is specified and type is console, collapsible is required",
    check(section: Section): Diagnostic | void {
        const type = section.getSettingFromTree("type");
        if (type.value !== "console") {
            return;
        }
        const summaryText = section.getSettingFromTree("summary-text");
        if (!summaryText) {
            return;
        }
        const collapsible = section.getSettingFromTree("collapsible");
        if (!collapsible) {
            return createDiagnostic(section.range.range, noRequiredSetting("collapsible", "summary-text"));
        }
    }
};

export default rule;
