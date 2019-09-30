import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { noRequiredSetting } from "../../messageUtil";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "icon-alert-style requirements",
    check(section: Section): Diagnostic[] | void {

        const setting: Setting = section.getSettingFromTree("icon-alert-style");
        const widgetType = section.getSettingFromTree("type");

        if (setting === undefined || widgetType === undefined) {
            return;
        }

        switch (widgetType.value) {
            case "text":
                return checkTextWidgetRequirements(section, setting);
            case "pie":
                return checkPieWidgetRequirements(section, setting);
        }
    }
};

const checkTextWidgetRequirements = (section: Section, setting: Setting): Diagnostic[] | void => {
    const diagnostic: Diagnostic[] = [];
    const iconColor = section.getSettingFromTree("icon-color");
    const alertExpression = section.getSettingFromTree("alert-expression");

    if (iconColor === undefined) {
        diagnostic.push(
            createDiagnostic(
                section.range.range,
                `Set icon-color to apply the same color to series icons when alert is off.`,
                DiagnosticSeverity.Warning
            )
        );
    }

    if (alertExpression === undefined) {
        diagnostic.push(
            createDiagnostic(
                setting.textRange,
                noRequiredSetting(setting.displayName, "alert-expression"),
                DiagnosticSeverity.Error
            )
        );
    }

    return diagnostic;
};

const checkPieWidgetRequirements = (section: Section, setting: Setting): Diagnostic[] | void => {
    const iconAlertExpression: Setting = section.getSettingFromTree("icon-alert-expression");

    if (iconAlertExpression === undefined) {
        return [
            createDiagnostic(
                setting.textRange,
                "icon-alert-expression is required if icon-alert-style is specified"
            )
        ];
    }
};

export default rule;
