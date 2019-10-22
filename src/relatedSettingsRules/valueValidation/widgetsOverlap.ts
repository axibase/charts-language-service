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
    check(section: Section): Diagnostic | void {
        const groupWidth = +getValueOfSetting("width-units", section.parent, false);
        const groupHeight = +getValueOfSetting("height-units", section.parent, false);

        const grid = [];
        const errors: string[] = [];

        let lastRelativeWidgetPosX = 1;

        for (let i = 0; i < groupWidth; i++) {
            grid[i] = new Array(groupHeight).fill(0);
        }

        section.children.forEach(widget => {
            const position = getValueOfSetting("position", widget, false);
            const width = +getValueOfSetting("width-units", widget, false);
            const height = +getValueOfSetting("height-units", widget, false);

            if (position) {
                try {
                    let { x1, x2, y1, y2 } = parsePosition(position.toString());

                    outer: for (let i = x1 - 1; i < x2; i++) {
                        for (let j = y1 - 1; j < y2; j++) {
                            if (grid[i] === undefined || grid[i][j] === undefined) {
                                errors.push(
                                    `Widget position '${position}' overflows grid ${groupWidth}x${groupHeight}`
                                );
                                break outer;
                            }

                            if (grid[i][j]) {
                                errors.push(
                                    `Widget with position '${position}' overlaps other widget at ${i + 1}-${j + 1}`
                                );
                                break outer;
                            }

                            grid[i][j] = 1;
                        }
                    }
                } catch (e) {
                    errors.push(e.message);
                }
            } else {
                const x1 = lastRelativeWidgetPosX + 1;
                const y1 = 1;
                const x2 = x1 + width;
                const y2 = y1 + height;
                lastRelativeWidgetPosX = x2;

                for (let i = x1 - 1; i < x2; i++) {
                    for (let j = y1 - 1; j < y2; j++) {
                        if (grid[i] === undefined || grid[i][j] === undefined) {
                            /**
                             * Relative positioned widgets grid overflow is validated separately in widgetsPerRow
                             */
                            continue;
                        } else {
                            grid[i][j] = 1;
                        }
                    }
                }
            }
        });

        if (errors.length) {
            return createDiagnostic(
                section.range.range,
                errors[0],
                DiagnosticSeverity.Warning
            );
        }
    }
};

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
            + ` '${line}' doesn't seem to match {number}-{number} schema`);
    }
}

export default rule;
