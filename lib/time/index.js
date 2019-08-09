"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageUtil_1 = require("../messageUtil");
const util_1 = require("../util");
const timeParseError_1 = require("./timeParseError");
const timeParser_1 = require("./timeParser");
const timeParseCache = new Map();
/**
 * Parses value of time setting, adds diagnostic to `errors` if any error during parsing was thrown.
 *
 * @param timeSetting - Date setting, which value is need to be parsed
 * @param timeParser - Util class, containig methods for date parsing
 * @param errors - Array of diagnosics, to which information about error is added
 * @returns Value of `timeSetting`, parsed to Date.
 */
function parseTimeValue(timeSetting, section, errors) {
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
            const timeZoneValue = util_1.getValueOfSetting("time-zone", section);
            const timeParser = new timeParser_1.TimeParser(timeZoneValue);
            parsedValue = timeParser.parseDateTemplate(timeSetting.value);
            timeParseCache.set(timeSetting, parsedValue);
        }
        catch (err) {
            if (err instanceof timeParseError_1.TimeParseError) {
                const diagnostic = util_1.createDiagnostic(timeSetting.textRange, messageUtil_1.dateError(err.message, timeSetting.displayName));
                errors.push(diagnostic);
            }
            else {
                throw err;
            }
        }
    }
    return parsedValue;
}
exports.parseTimeValue = parseTimeValue;
