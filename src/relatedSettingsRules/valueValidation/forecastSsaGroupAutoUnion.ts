import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Validates forecast-ssa-group-auto-union value syntax",
    check(section: Section): Diagnostic | void {
        const setting = section.getSettingFromTree("forecast-ssa-group-auto-union");
        if (setting === void 0) {
            return;
        }
        if (!/^[a-z\s,;-]+$/.test(setting.value)) {
            return createDiagnostic(
                setting.textRange,
                "Incorrect group union syntax"
            );
        }
    }
};

export default rule;