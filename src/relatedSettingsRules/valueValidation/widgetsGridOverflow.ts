import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic, getSetting, getValueOfSetting } from "../../util";
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
    let line: string = setting.value;
    line = line && line.trim();
    if (!line) { return null; }
    const PARSE_POSITION_ERROR = `Can't parse widget's ${setting.displayName}.`
            + ` Correct setting syntax is, for example: '${setting.example}'`;
    let parts = line.split(/\s*,\s*/g, 3);
    if (parts.length > 2) {
        throw new Error(PARSE_POSITION_ERROR);
    }

    function parsePart(part: string) {
        if (!part) {
            throw new Error(PARSE_POSITION_ERROR);
        }

        const coordinates = part.split("-");
        if (coordinates.length > 2) {
            /** For example, position = -1--3. */
            throw new Error(PARSE_POSITION_ERROR);
        }
        let [x, y] = coordinates.map(c => +c);
        if (isFinite(x) && isFinite(y)) {
            return [y, x];
        } else {
            throw new Error(PARSE_POSITION_ERROR);
        }
    }

    let [x1, y1] = parsePart(parts[0]);
    let [x2, y2] = parts[1] ? parsePart(parts[1]) : [x1, y1];

    return { x1, y1, x2, y2 };
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
         * Or use default dimensions for configuration
         */
        const [gridWidth, gridHeight] = ["width-units", "height-units"].map(setting => {
            return +getValueOfSetting(setting, widget.parent.parent) || getSetting(setting).applyScope({
                section: widget.parent.parent.name,
                widget: ""
            }).defaultValue;
        });

        try {
            const { x1, x2, y1, y2 } = parsePosition(position);
            if (x1 < 1 || x2 > gridWidth || y1 < 1 || y2 > gridHeight) {
                return createDiagnostic(
                        position.textRange,
                        `Widget ${position.displayName} '${position.value}' overflows grid` +
                        ` ${gridHeight}×${gridWidth}`,
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
