import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Size (set as number) value validation",
    check(section: Section): Diagnostic | void {
        const size = section.getSettingFromTree("size");
        // TODO: add validation for 'size = value('alias')' and 'size = value'
        if (size === undefined || !isFinite(parseFloat(size.value))) {
            return;
        }
        if (parseFloat(size.value) < 0) {
            return createDiagnostic(
                size.textRange,
                `'${size.displayName}' must must have non-negative value`,
                DiagnosticSeverity.Error
            );
        }
    }
};

export default rule;
