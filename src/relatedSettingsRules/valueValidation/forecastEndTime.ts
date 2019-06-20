import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Util } from "../../util";
import { RelatedSettingsRule } from "../utils/interfaces";

const rule: RelatedSettingsRule = {
    name: "Checks forecast-horizon-end-time is greater than end-time",
    check(section: Section): Diagnostic | void {
        let forecast = section.getSettingFromTree("forecast-horizon-end-time");
        if (forecast === undefined) {
            return;
        }
        let end = section.getSettingFromTree("end-time");
        if (end === undefined) {
            return;
        }

        if (end.value >= forecast.value) {
            return Util.createDiagnostic(
                end.textRange,
                `${forecast.displayName} must be greater than ${end.displayName}`,
                DiagnosticSeverity.Error
            );
        }
    }
};

export default rule;
