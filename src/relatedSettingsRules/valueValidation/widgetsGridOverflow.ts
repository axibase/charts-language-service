import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { POSITION_REGEX } from "../../regExpressions";
import { Setting } from "../../setting";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { Rule } from "../utils/interfaces";

interface Coordinates {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

const rule: Rule = {
    name: "check that widgets per row don't overflow [group]",
    check(section: Section): Diagnostic[] | void {
        return section.children.reduce((total, widget) => {
            const diagnostic = detectGridOverflow(widget);

            if (diagnostic) {
                total.push(diagnostic);
            }

            return total;
        }, []);
    }
};

/**
 * Widget position parsing helper function
 * @param setting — position setting
 */
function parsePosition(setting: Setting): Coordinates | null {
    let fullForm: string = setting.value;
    /**
     * Process case for 'position = 1-1' shorthand and turn it into 'position = 1-1, 1-1'
     */
    if (setting.value.indexOf(",") < 0) {
        fullForm += "," + setting.value;
    }

    const match = POSITION_REGEX.exec(fullForm);

    try {
        const start = match[1].split("-");
        const end = match[2].split("-");

        return {
            x1: +start[1],
            x2: +end[1],
            y1: +start[0],
            y2: +end[0],
        };
    } catch (error) {
        throw new Error(`Can't parse widget's ${setting.displayName}.`
            + ` Correct setting syntax is, for example: '${setting.example}'`);
    }
}

/**
 * Check if widget position doesn't overflow grid
 * @param widget - widget section to check
 */
function detectGridOverflow(widget: Section): Diagnostic | void {
    const position = widget.getSettingFromTree("position");

    if (position) {
        /**
         * Get grid dimensions out of width- and height-units defined in configuration
         * Or use default dimensions
         */
        const gridWidth = +getValueOfSetting("width-units", widget.parent.parent);
        const gridHeight = +getValueOfSetting("height-units", widget.parent.parent);

        try {
            const { x1, x2, y1, y2 } = parsePosition(position);
            if (x1 < 1 || x2 > gridWidth || y1 < 1 || y2 > gridHeight) {
                return createDiagnostic(
                    position.textRange,
                    `Widget ${position.displayName} '${position.value}' overflows grid` +
                    ` ${gridHeight} × ${gridWidth}`,
                    DiagnosticSeverity.Warning
                );
            }
        } catch (e) {
            /**
             * Process 'position' setting parse errors
             */
            return createDiagnostic(
                position.textRange,
                e.message
            );
        }
    }
}

export default rule;
