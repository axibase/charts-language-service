import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { requiredCondition } from "../utils/condition";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "icon-alert-style requirements",
    check(section: Section): Diagnostic | void {

        const setting: Setting = section.getSettingFromTree("icon-alert-style");

        if (setting === undefined) {
            return;
        }

        if (section.matchesConditions([
            requiredCondition("type", ["text"])
        ])) {
            return checkTextWidgetRequirements(section, setting);
        } else if (requiredCondition("type", ["pie"])) {
            return checkPieWidgetRequirements(section, setting);
        }
    }
};

const checkTextWidgetRequirements = (section: Section, setting: Setting): Diagnostic | void => {
    const settings = ["alert-expression", "icon-color"];
    const allSettingsArePresent = settings.every(item =>
        section.getSettingFromTree(item) !== undefined
    );

    if (!allSettingsArePresent) {
        return createDiagnostic(
            setting.textRange,
            `${setting.displayName} requires all of the following settings:
 * ${settings.join("\n * ")}`
        );
    }
};

const checkPieWidgetRequirements = (section: Section, setting: Setting): Diagnostic | void => {
    const iconAlertExpression: Setting = section.getSettingFromTree("icon-alert-expression");

    if (iconAlertExpression === undefined) {
        return createDiagnostic(
            setting.textRange,
            "icon-alert-expression is required if icon-alert-style is specified"
        );
    }
};

export default rule;
