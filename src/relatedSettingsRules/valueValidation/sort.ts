import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { INTERVAL_UNITS, STAT_FUNCTIONS } from "../../constants";
import { INTERVAL_REGEXP, SORT_REGEX, STAT_COUNT_UNIT } from "../../regExpressions";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "summarize-period should not be greater than timespan",
    check(section: Section): Diagnostic | void {
        const sort: Setting = section.getSettingFromTree("sort");

        if (!sort) {
            return;
        }

        let errorMessage: string = "";

        switch (section.getSetting("type").value) {
            case "calendar": {
                const match = STAT_COUNT_UNIT.exec(sort.value);
                const errors: string[] = [];
                if (match !== null) {
                    const [, stat, contents] = match;
                    const [, unit] = contents.split(" ");
                    if (STAT_FUNCTIONS.indexOf(stat) < 0) {
                        errors.push(`Unknown stat function: ${stat}`);
                    }

                    if (unit && INTERVAL_UNITS.indexOf(unit) < 0) {
                        errors.push(`Unknown interval unit: ${unit}`);
                    }
                } else {
                    if (incorrectSyntax(sort.value)) {
                        errors.push(`Incorrect syntax. '${sort.value}' doesn't match 'value ASC|DESC' schema`);
                    }
                }

                if (errors.length) {
                    errorMessage = errors.join(". ");
                }
                break;
            }
            default: {
                if (incorrectSyntax(sort.value)) {
                    errorMessage = `Incorrect syntax. '${sort.value}' doesn't match 'value asc|desc' schema`;
                }
            }
        }

        if (errorMessage) {
            return createDiagnostic(
                sort.textRange,
                errorMessage
            );
        }
    }
};

/**
 * Check each value item of 'sort' setting for syntax correctness
 * @param value - 'sort' setting value
 */
function incorrectSyntax(value: string): boolean {
    return value.split(",").some(element => !SORT_REGEX.test(element.trim()));
}

export default rule;
