import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "check that amount of widgets per row fits group capacity",
    check(section: Section): Diagnostic | void {
        let errorMessage: string;
        const dimensions: string[] = ["width-units", "height-units"];

        /**
         * Compare width-units and height-units of child widgets with parent's dimensions
         */
        dimensions.forEach(dimension => {
            const widgetsDimensions = section.children.reduce((total, childSection) => {
                const value = getValueOfSetting(dimension, childSection, false) as string;
                return total + parseFloat(value);
            }, 0);

            const groupDimensions = +getValueOfSetting(dimension, section.parent, false);

            if (widgetsDimensions > groupDimensions) {
                if (errorMessage) {
                    errorMessage = `Widgets' ${dimensions.join(" and ")} don't fit group capacity`;
                } else {
                    errorMessage = `Widgets' ${dimension} doesn't fit group capacity`;
                }
            }

        });

        if (errorMessage) {
            return createDiagnostic(
                section.range.range,
                errorMessage
            );
        }
    }
};

export default rule;
