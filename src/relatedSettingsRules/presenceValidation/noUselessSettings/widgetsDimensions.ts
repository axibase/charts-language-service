import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../../configTree/section";
import { Setting } from "../../../setting";
import { createDiagnostic } from "../../../util";
import { Rule } from "../../utils/interfaces";

const rule: Rule = {
    name: "Width-units and height-units have no effect if position is set",
    check(section: Section): Diagnostic[] | void {
        const position = section.getSetting("position");

        const foundSettings: Setting[] = ["widthunits", "heightunits"]
            .map(settingName => section.getSetting(settingName))
            .filter(element => element !== undefined);

        const diagnostic: Diagnostic[] = [];

        if (position) {
            foundSettings.forEach(setting => {
                diagnostic.push(
                    createDiagnostic(
                        setting.textRange,
                        `${setting.displayName} has no effect if position is specified`,
                        DiagnosticSeverity.Warning
                    )
                );
            });
        }

        return diagnostic;
    }
};

export default rule;
