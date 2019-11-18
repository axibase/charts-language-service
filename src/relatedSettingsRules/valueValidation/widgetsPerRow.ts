import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "check that widgets per row don't overflow [group]",
    check(section: Section): Diagnostic | void {
        let errorMessage: string;
        /**
         * Compare summary width-units of child widgets with parent's dimensions
         */
        const groupWidth = +getValueOfSetting("width-units", section.parent, false);
        let widgetsWidth = section.children.reduce((total, childSection) => {
            const value = getValueOfSetting("width-units", childSection, false) as string;
            return total + parseFloat(value);
        }, 0);

        /**
         * Take into account widgets-per-row setting
         */
        const widgetsPerRow = section.getSettingFromTree("widgets-per-row");
        if (widgetsPerRow && widgetsWidth >= +widgetsPerRow.value) {
            widgetsWidth = +widgetsPerRow.value;
        }

        if (widgetsWidth > groupWidth) {
            errorMessage = `Widgets overflow [group] horizontally. Decrease number of widgets per row`;
        }

        /**
         * Widgets are placed next to each other, so we need to check only single widget max-height
         */
        const groupHeight = +getValueOfSetting("height-units", section.parent, false);
        const widgetsExceedHeight = section.children.some(childSection => {
            const value = getValueOfSetting("height-units", childSection, false) as string;
            return parseFloat(value) > groupHeight;
        });

        if (widgetsExceedHeight) {
            if (errorMessage) {
                errorMessage = `Widgets overflow [group]\n`
                    + `Decrease widget's height-units and number of widgets per row`;
            } else {
                errorMessage = `Widgets overflow [group] vertically. Decrease widget's height-units`;
            }
        }

        if (errorMessage) {
            return createDiagnostic(
                section.range.range,
                errorMessage,
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
