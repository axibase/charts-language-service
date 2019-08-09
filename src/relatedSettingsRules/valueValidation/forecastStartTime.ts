import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { parseTimeValue } from "../../time";
import { RelatedSettingsRule } from "../utils/interfaces";

const rule: RelatedSettingsRule = {
    name: "Validates forecast-horizon-start-time value",
    check(section: Section): Diagnostic | void {
        let forecast = section.getSettingFromTree("forecast-horizon-start-time");
        if (forecast === undefined) {
            return;
        }
        const errors: Diagnostic[] = [];
        parseTimeValue(forecast, section, errors);
        if (errors.length > 0) {
            return errors[0];
        }
    }
};

export default rule;
