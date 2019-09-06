import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Validates forecast-ssa-group-manual-groups value syntax",
    check(section: Section): Diagnostic | void {
        const setting = section.getSettingFromTree("forecast-ssa-group-manual-groups");
        if (setting === void 0) {
            return;
        }
        if (!/^[\d\s,;-]+$/.test(setting.value)) {
            return createDiagnostic(
                setting.textRange,
                "Incorrect group syntax"
            );
        }
    }
};

export default rule;