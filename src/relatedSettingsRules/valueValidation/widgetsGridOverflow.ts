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
        /**
         * Get grid dimensions out of width- and height-units defined in configuration
         * Or use default dimensions
         */
        const gridWidth = +getValueOfSetting("width-units", section.parent);
        const gridHeight = +getValueOfSetting("height-units", section.parent);

        /**
         * Create model grid to detect widgets intersection
         */
        const grid = [];
        for (let i = 0; i < gridWidth; i++) {
            grid[i] = new Array(gridHeight).fill(0);
        }

        const errors: Diagnostic[] = [];
        section.children.forEach(widget => {
            const position = widget.getSettingFromTree("position");

            /**
             * Position is specified try to parse it, check for syntax correctness
             */
            if (position) {
                try {
                    const { x1, x2, y1, y2 } = parsePosition(position);

                    /**
                     * Position is 1-based, while array is 0-based
                     */
                    outer: for (let i = x1 - 1; i < x2; i++) {
                        for (let j = y1 - 1; j < y2; j++) {
                            /**
                             * We are out of grid defined in configuration
                             */
                            if (grid[i] === undefined || grid[i][j] === undefined) {
                                errors.push(createDiagnostic(
                                    position.textRange,
                                    `Widget's position '${position.value}' overflows grid ${gridHeight}x${gridWidth}`,
                                    DiagnosticSeverity.Warning
                                ));
                                break outer;
                            }

                            grid[i][j] = 1;
                        }
                    }
                } catch (e) {
                    /**
                     * Process 'position' setting parse errors
                     */
                    errors.push(
                        createDiagnostic(
                            position.textRange,
                            e.message
                        )
                    );
                }
            }
        });

        if (errors.length) {
            return errors;
        }
    }
};

/**
 * Widget position parsing helper function
 * @param line — position setting
 */
function parsePosition(setting: Setting): Coordinates | null {
    let fullForm: string = setting.value;
    /**
     * Process case for 'position = 1-1' shorthand and turn it into 'position = 1-1, 1-1'
     */
    if (setting.value.split(",").length === 1) {
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
        throw new Error(`Can't parse widget's position.`
            + ` Correct setting syntax is, for example: '${setting.example}'`);
    }
}

export default rule;
