import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../configTree/section";
import { dateError } from "../messageUtil";
import { Setting } from "../setting";
import { createDiagnostic, getValueOfSetting } from "../util";
import { IntervalParser } from "./intervalParser";
import { TimeParser } from "./timeParser";

const timeParseCache: Map<Setting, Date> = new Map<Setting, Date>();

/**
 * Parses value of time setting, adds diagnostic to `errors` if any error during parsing was thrown.
 *
 * @param timeSetting - Date setting, which value is need to be parsed
 * @param section - Section, for which "time-zone" setting is need to be found.
 * @param errors - Array of diagnostics, to which information about error is added
 * @returns Value of `timeSetting`, parsed to Date.
 */
export function parseTimeValue(timeSetting: Setting, section: Section, errors: Diagnostic[]): Date {
    let parsedValue;
    if (timeSetting != null) {
        if (timeParseCache.has(timeSetting)) {
            const cached = timeParseCache.get(timeSetting);
            if (cached instanceof Date) {
                return cached;
            }
            return null;
        }
        try {
            const timeZoneValue = getValueOfSetting("time-zone", section);
            const timeParser = new TimeParser(timeZoneValue as string);
            parsedValue = timeParser.parseDateTemplate(timeSetting.value);
            timeParseCache.set(timeSetting, parsedValue);
        } catch (err) {
            const diagnostic = createDiagnostic(timeSetting.textRange,
                    dateError(err.message, timeSetting.displayName));
            errors.push(diagnostic);
        }
    }
    return parsedValue;
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
