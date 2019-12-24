import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../configTree/section";
import { dateErrorMsg } from "../messageUtil";
import { Setting } from "../setting";
import { createDiagnostic, getValueOfSetting } from "../util";
import { IntervalParser } from "./intervalParser";
import { DateWithTZ, parseDateExpression } from "./time_parser";

/**
 * Parses value of time setting to ISO string.
 *
 * @param timeSetting - Date setting, which value is need to be parsed
 * @param section - Section, for which "time-zone" setting is need to be found
 * @param errors - Array of diagnostics, to which information about error is added
 * @returns Value of `timeSetting`, parsed to ISO string.
 */
export function parseTimeValue(timeSetting: Setting, section: Section, errors: Diagnostic[]): string | void {
    let result;
    if (timeSetting != null) {
        const timeZoneValue = getValueOfSetting("time-zone", section);
        const parsedValue = parseDateExpression(timeSetting.value, timeZoneValue as string);
        if (parsedValue === null) {
            /** Setting is incorrect - add error and return. */
            const diagnostic = createDiagnostic(timeSetting.textRange,
                    dateErrorMsg(timeSetting.value, timeSetting.displayName));
            errors.push(diagnostic);
            return;
        }
        result = (parsedValue as DateWithTZ).toISOString();
    }
    return result;
}

/**
 * Parses value of interval setting, adds diagnostic to `errors` if any error during parsing was thrown.
 *
 * @param intervalSetting - Interval setting, which value is need to be parsed
 * @param errors - Array of diagnostics, to which information about error is added
 * @returns Value of `intervalSetting`, parsed to number.
 */
export function parseIntervalValue(intervalSetting: Setting/*, errors: Diagnostic[]*/): number {
    let parsedValue;
    if (intervalSetting != null) {
        try {
            parsedValue = IntervalParser.parse(intervalSetting.value);
        } catch (err) {
            // Commented for now, because syntax is checked in Setting.checkType.
            // It may be convenient to use this method instead of code in case "interval".
            /*
             const diagnostic = createDiagnostic(intervalSetting.textRange,
             intervalError(err.message, intervalSetting.displayName));
             errors.push(diagnostic);
             */
        }
    }
    return parsedValue;
}
