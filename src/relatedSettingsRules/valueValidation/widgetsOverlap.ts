import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { POSITION_REGEX } from "../../regExpressions";
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

        const grid = [];
        const errors: Diagnostic[] = [];

        /**
         * Used to calcaulate X coordinate of last relative widget (position not specified)
         */
        let lastWidgetPosition = 0;

        /**
         * Create model grid to detect widgets intersection
         */
        for (let i = 0; i < gridWidth; i++) {
            grid[i] = new Array(gridHeight).fill(0);
        }

        section.children.forEach(widget => {
            const position = getValueOfSetting("position", widget, false);
            /**
             * Get own widget's height and width units if specified
             * Otherwise pick default value
             */
            const width = +getValueOfSetting("width-units", widget, false);
            const height = +getValueOfSetting("height-units", widget, false);

            /**
             * Position is specified try to parse it, check for syntax correctness
             */
            if (position) {
                try {
                    const { x1, x2, y1, y2 } = parsePosition(position.toString());

                    /**
                     * Position is 1-based, while array is 0-based
                     */
                    outer: for (let i = x1 - 1; i < x2; i++) {
                        for (let j = y1 - 1; j < y2; j++) {
                            /**
                             * We are out of grid defined in configuration
                             */
                            if (grid[i] === undefined || grid[i][j] === undefined) {
                                errors.push(
                                    createDiagnostic(
                                        widget.range.range,
                                        `Widget position '${position}' overflows grid ${gridWidth}x${gridHeight}`,
                                        DiagnosticSeverity.Warning
                                    )
                                );
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
                            widget.getSettingFromTree("position").textRange,
                            e.message
                        )
                    );
                }
            } else {
                /**
                 * Position is not specified — we met a relatively positioned widget
                 */
                const x1 = lastWidgetPosition + 1;
                const y1 = 1;
                const x2 = x1 + width;
                const y2 = y1 + height;
                lastWidgetPosition = x2;

                for (let i = x1 - 1; i < x2; i++) {
                    for (let j = y1 - 1; j < y2; j++) {
                        if (grid[i] === undefined || grid[i][j] === undefined) {
                            /**
                             * Relative positioned widgets grid overflow is validated separately in widgetsPerRow
                             */
                            continue;
                        } else if (grid[i][j]) {
                            /**
                             * There is already widget at the position
                             */
                            errors.push(
                                createDiagnostic(
                                    widget.parent.range.range,
                                    `Widgets overlap at ${i + 1}-${j + 1}`,
                                    DiagnosticSeverity.Warning
                                )
                            );
                        } else {
                            grid[i][j] = 1;
                        }
                    }
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
function parsePosition(line: string): Coordinates | null {
    let fullForm: string = line;
    /**
     * Process case for 'position = 1-1' shorthand and turn it into 'position = 1-1, 1-1'
     */
    if (line.split(",").length === 1) {
        fullForm += "," + line;
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
            + ` Position should be, for example: '1-1, 2-2' or '1-1' (= '1-1, 1-1' short form)`);
    }
}

export default rule;
