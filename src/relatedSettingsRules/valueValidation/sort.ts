import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { SORT_REGEX } from "../../regExpressions";
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

        const invalid = sort.value.split(",").some(element => !SORT_REGEX.test(element.trim()));

        if (invalid) {
            return createDiagnostic(
                sort.textRange,
                `Correct syntax for '${sort.displayName}' setting is, for example: '${sort.example}'`
            );
        }
    }
};

export default rule;
