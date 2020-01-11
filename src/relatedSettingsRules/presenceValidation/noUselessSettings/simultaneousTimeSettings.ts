import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../../configTree/section";
import { simultaneousTimeSettingsWarning } from "../../../messageUtil";
import { createDiagnostic } from "../../../util";
import { Rule } from "../../utils/interfaces";

const rule: Rule = {
    name: "Start-time, end-time and timespan mustn't be declared simultaneously",
    check(section: Section): Diagnostic | void {
        const startTime = section.getSettingFromTree("start-time");
        const endTime = section.getSettingFromTree("end-time");
        const timespan = section.getSettingFromTree("timespan");

        if (startTime && endTime && timespan) {
            return createDiagnostic(
                section.range.range,
                simultaneousTimeSettingsWarning(),
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
