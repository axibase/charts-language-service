import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { parseTimeValue } from "../../time";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Validates start/end-time values and checks start-time is greater than end-time",
    check(section: Section): Diagnostic[] | void {
        const end = section.getSettingFromTree("end-time");
        const start = section.getSettingFromTree("start-time");
        if (end === undefined && start === undefined) {
            return;
        }
        const errors: Diagnostic[] = [];
        let parsedEnd = parseTimeValue(end, section, errors);
        let parsedStart = parseTimeValue(start, section, errors);
        if (parsedStart != null && parsedEnd != null) {
            if (parsedStart >= parsedEnd) {
                errors.push(createDiagnostic(
                    end.textRange,
                    `${end.displayName} must be greater than ${start.displayName}`,
                    DiagnosticSeverity.Error
                ));
            }
        }
        if (errors.length > 0) {
            return errors;
        }
    }
};

export default rule;
