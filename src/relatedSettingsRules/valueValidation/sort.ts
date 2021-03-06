import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { INTERVAL_UNITS, STAT_FUNCTIONS } from "../../constants";
import { supportedStatFunctions, supportedUnits } from "../../messageUtil";
import { CALENDAR_SORT_BY_NAME, SORT_REGEX, STAT_COUNT_UNIT } from "../../regExpressions";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "sort setting value validation",
    check(section: Section): Diagnostic | void {
        const sort: Setting = section.getSettingFromTree("sort");

        if (!sort) {
            return;
        }

        const errors: string[] = [];
        const widgetType: string = section.getSetting("type").value;

        switch (widgetType) {
            case "calendar": {
                errors.push(...validateCalendarSort(sort));
                break;
            }
            default: {
                errors.push(...validateSort(sort, widgetType));
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
function correctMultiValueSyntax(value: string): boolean {
    return value.split(",").every(element => SORT_REGEX.test(element.trim()));
}

/**
 * Validate calendar-specific sort setting
 * @param setting - sort setting
 */
function validateCalendarSort(setting: Setting): string[] {
    const errors: string[] = [];
    /**
     * Check calendar-specific stat_func syntax
     */
    const match = STAT_COUNT_UNIT.exec(setting.value);
    if (match !== null) {
        const [, stat, quotes, contents] = match;
        const [, unit] = contents.split(" ");

        if (STAT_FUNCTIONS.indexOf(stat) < 0) {
            errors.push(`Unknown stat function: ${stat} \n${supportedStatFunctions()}`);
        }

        if (unit && INTERVAL_UNITS.indexOf(unit) < 0) {
            errors.push(`Unknown interval unit: ${unit} \n${supportedUnits()}`);
        }
    } else if (setting.value.indexOf(",") >= 0 && correctMultiValueSyntax(setting.value)) {
        /**
         * Calendar supports only single sort by name syntax. 'val1 ASC, val2 DES' is not allowed
         */
        errors.push("Multiple sorting columns are not supported in calendar");
    } else if (!CALENDAR_SORT_BY_NAME.test(setting.value)) {
        /**
         * Final syntax check: stat function check failed, multiple values check failed
         * Either we have correct sort by name syntax, or something completely wrong
         */
        errors.push("Incorrect syntax. Replace with 'name' or 'name [ASC|DESC]'");
    }

    return errors;
}

/**
 * Validate not widget type specific sort setting
 * @param setting - sort setting
 * @param widgetType - type of widget, where setting is found
 */
function validateSort(setting: Setting, widgetType: string): string[] {
    const errors: string[] = [];
    /**
     * Check that correct, yet unsuitable for current widget type syntax isn't used
     * TODO: in case we have more syntaxes, put type-specific regexes into array
     */
    if (STAT_COUNT_UNIT.exec(setting.value) !== null) {
        errors.push(`Incorrect syntax for widget type '${widgetType}'. ` +
            `'${setting.value}' doesn't match 'value ASC|DESC' schema`);
    } else if (!correctMultiValueSyntax(setting.value)) {
        if (setting.value.indexOf(",") < 0) {
            const [first, second] = setting.value.split(" ");
            errors.push(`Incorrect syntax. Replace with '${first}, ${second}' or '${first} [ASC|DESC]'`);
        } else {
            /**
             * Default error message in case we have dangling commas or something unmatchable by regex
             */
            errors.push(`Incorrect syntax. '${setting.value}' doesn't match 'value ASC|DESC' schema`);
        }
    }

    return errors;
}

export default rule;
