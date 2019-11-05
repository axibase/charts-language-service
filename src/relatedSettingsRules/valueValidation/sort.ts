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

        let correct: boolean = true;

        if (section.getSetting("type").value === "calendar") {
            correct = STAT_COUNT_UNIT.exec(sort.value) !== null || syntaxIsCorrect(sort.value);
        } else {
            correct = syntaxIsCorrect(sort.value);
        }

        if (!correct) {
            return createDiagnostic(
                sort.textRange,
                `Correct syntax for '${sort.displayName}' setting is, for example: '${sort.example}'`
            );
        }
    }
};

/**
 * Check each value item of 'sort' setting for syntax correctness
 * @param value - 'sort' setting value
 */
function syntaxIsCorrect(value: string): boolean {
    return value.split(",").every(element => SORT_REGEX.test(element.trim()));
}

export default rule;
