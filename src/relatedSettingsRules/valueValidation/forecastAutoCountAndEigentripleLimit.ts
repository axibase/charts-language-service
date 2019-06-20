import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { ResourcesProviderBase } from "../../resourcesProviderBase";
import { Util } from "../../util";
import { RelatedSettingsRule } from "../utils/interfaces";

const rule: RelatedSettingsRule = {
    name: "Checks forecast-ssa-group-auto-count is greater than forecast-ssa-decompose-eigentriple-limit",
    check(section: Section, resourcesProvider: ResourcesProviderBase): Diagnostic | void {
        const groupAutoCount = section.getSettingFromTree("forecast-ssa-group-auto-count");
        if (groupAutoCount === undefined) {
            return;
        }
        const forecastLimit = section.getSettingFromTree("forecast-ssa-decompose-eigentriple-limit");
        const eigentripleLimitValue = forecastLimit ?
            forecastLimit.value : resourcesProvider.getSetting("forecast-ssa-decompose-eigentriple-limit").defaultValue;
        if (eigentripleLimitValue <= groupAutoCount.value) {
            return Util.createDiagnostic(groupAutoCount.textRange,
                `forecast-ssa-group-auto-count ` +
                `must be less than forecast-ssa-decompose-eigentriple-limit (default 0)`);
        }
    }
};

export default rule;
