import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { noRequiredSetting, notAllRequiredSettings } from "../../messageUtil";
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
            notAllRequiredSettings("icon-alert-style", settings)
        );
    }
};

const checkPieWidgetRequirements = (section: Section, setting: Setting): Diagnostic | void => {
    const iconAlertExpression: Setting = section.getSettingFromTree("icon-alert-expression");

    if (iconAlertExpression === undefined) {
        return createDiagnostic(
            setting.textRange,
            noRequiredSetting("icon-alert-style", iconAlertExpression.displayName)
        );
    }
};

export default rule;
