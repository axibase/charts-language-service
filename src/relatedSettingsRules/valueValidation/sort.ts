import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { INTERVAL_UNITS, STAT_FUNCTIONS } from "../../constants";
import { supportedStatFunctions, supportedUnits } from "../../messageUtil";
import { SORT_REGEX, STAT_COUNT_UNIT } from "../../regExpressions";
import { Setting } from "../../setting";
import { createDiagnostic, createRange } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "sort setting value validation",
    check(section: Section): Diagnostic | void {
        const sort: Setting = section.getSettingFromTree("sort");

        if (!sort) {
            return;
        }

        const errors: string[] = [];
        let errorMessage: string = "";
        const widgetType: string = section.getSetting("type").value;

        switch (widgetType) {
            case "calendar": {
                /**
                 * Check calendar-specific stat_func syntax
                 */
                const match = STAT_COUNT_UNIT.exec(sort.value);
                if (match !== null) {
                    const [, stat, quotes, contents] = match;
                    const [, unit] = contents.split(" ");

                    if (STAT_FUNCTIONS.indexOf(stat) < 0) {
                        errors.push(`Unknown stat function: ${stat} \n${supportedStatFunctions()}`);
                    }

                    if (unit && INTERVAL_UNITS.indexOf(unit) < 0) {
                        errors.push(`Unknown interval unit: ${unit} \n${supportedUnits()}`);
                    }
                } else if (!SORT_REGEX.test(sort.value)) {
                    /**
                     * Calendar supports only single sort value: 'val1 ASC, val2 DES' not allowed
                     */
                    errors.push(`Incorrect syntax. '${sort.value}' doesn't match 'value ASC|DESC' schema`);
                }

                break;
            }
            default: {
                /**
                 * Check that correct, yet unsuitable for current widget type syntax isn't used
                 * TODO: in case we have more syntaxes, put type-specific regexes into array
                 */
                if (STAT_COUNT_UNIT.exec(sort.value) !== null) {
                    errors.push(`Incorrect syntax for widget type '${widgetType}'. ` +
                    `'${sort.value}' doesn't match 'value ASC|DESC' schema`);
                } else if (incorrectMultiValueSyntax(sort.value)) {
                    if (sort.value.indexOf(",") < 0) {
                        const [first, second] = sort.value.split(" ");
                        errors.push(`Incorrect syntax. Replace with '${first}, ${second}' or '${first} [ASC|DESC]'`);
                    } else {
                        /**
                         * Default error message in case we have dangling commas or something unmatchable by regex
                         */
                        errors.push(`Incorrect syntax. '${sort.value}' doesn't match 'value ASC|DESC' schema`);
                    }
                }
            }
        }

        if (errors.length) {
            return createDiagnostic(
                sort.textRange,
                errors.join("\n")
            );
        }
    }
};

/**
 * Check each value item of 'sort' setting for syntax correctness
 * @param value - 'sort' setting value
 */
function incorrectMultiValueSyntax(value: string): boolean {
    return value.split(",").some(element => !SORT_REGEX.test(element.trim()));
}

export default rule;
