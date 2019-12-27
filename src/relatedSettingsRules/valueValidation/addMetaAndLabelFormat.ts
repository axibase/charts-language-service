import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const META = /meta/;
const rule: Rule = {
    name: "If label-format contains 'meta', add-meta must be true",
    check(section: Section): Diagnostic | void {
        const labelFormat = section.getSettingFromTree("label-format");
        if (labelFormat === undefined) {
            return;
        }
        if (!META.test(labelFormat.value)) {
            return;
        }
        const addMeta = section.getSettingFromTree("add-meta");
        if (addMeta == null || addMeta.value === "false") {
            return createDiagnostic(
                    labelFormat.textRange, "If label-format contains 'meta', add-meta must be true",
                    DiagnosticSeverity.Error);
        }
    }
};

export default rule;
