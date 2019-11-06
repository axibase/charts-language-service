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
                if (STAT_COUNT_UNIT.exec(sort.value) === null && incorrectSyntax(sort.value)) {
                    errorMessage = `Correct syntax for '${sort.displayName}' setting is, ` +
                        `for example: '${sort.example}' or 'stat_name('count unit')'`;
                }
                break;
            }
            default: {
                if (incorrectSyntax(sort.value)) {
                    errorMessage = `Correct syntax for '${sort.displayName}' setting is, ` +
                        `for example: '${sort.example}'`;
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
