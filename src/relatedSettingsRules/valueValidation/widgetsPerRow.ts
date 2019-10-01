import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "check that amount of widgets per row fits group capacity",
    check(section: Section): Diagnostic | void {
        let errorMessage: string;
        /**
         * Compare summary width-units of child widgets with parent's dimensions
         */
        const groupWidth = +getValueOfSetting("width-units", section.parent, false);
        const widgetsWidth = section.children.reduce((total, childSection) => {
            const value = getValueOfSetting("width-units", childSection, false) as string;
            return total + parseFloat(value);
        }, 0);

        if (widgetsWidth > groupWidth) {
            errorMessage = `Widgets' width-units doesn't fit group capacity`;
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
                errorMessage = `Widgets' width-units and height-units don't fit group capacity`;
            } else {
                errorMessage = `Widgets' height-units doesn't fit group capacity`;
            }
        }

        if (errorMessage) {
            return createDiagnostic(
                section.range.range,
                errorMessage
            );
        }
    }
};

export default rule;
