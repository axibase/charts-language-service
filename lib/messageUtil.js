(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./constants", "./regExpressions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("./constants");
    const regExpressions_1 = require("./regExpressions");
    /**
     * Creates a error message for unknown setting or value.
     * @param found the variant found in the user's text
     * @returns message with or without a suggestion
     */
    exports.unknownToken = (found) => `${found} is unknown.`;
    exports.deprecatedTagSection = `Replace [tag] sections with [tags].
Enclose the tag name in double quotes in case it contains special characters.

[tag]
  name = k
  value = v
[tag]
  name = my column
  value = my value

[tags]
  k = v
  "my column" = my value
`;
    exports.settingsWithWhitespaces = (found) => `The setting "${found}" contains whitespaces.\nReplace spaces with hyphens.`;
    exports.tagNameWithWhitespaces = (found) => `The tag name ${found} contains whitespaces. Wrap it in double quotes.`;
    exports.settingNameInTags = (found) => `${found} is interpreted as a series tag and is sent to the\nserver. ` +
        `Move the setting outside of the [tags] section or\n` +
        "enclose in double-quotes to send it to the server without\na warning.";
    exports.uselessScope = (found, msg) => `${found} setting is applied only if ${msg}.`;
    exports.incorrectColors = (found, msg) => `Number of colors (if specified) must be equal to\nnumber of thresholds minus 1.
Current: ${found}, expected: ${msg}`;
    exports.illegalSetting = (found) => `${found} setting is not allowed here.`;
    /**
     * If SCV pattern didn't match any known RegExp, compose error message
     * @param line line of code instruction
     * @returns csv error message
     */
    exports.getCsvErrorMessage = (line) => {
        return (regExpressions_1.CSV_FROM_URL_MISSING_NAME_PATTERN.test(line)) ? `<name> in 'csv <name> from <url>' is missing` :
            `The line should contain a '=' or 'from' keyword`;
    };
    /**
     * If start-time, end-time and timespan are declared simultaneously, show the warning
     */
    exports.simultaneousTimeSettingsWarning = () => `'start-time', 'end-time' and 'timespan' can not be declared simultaneously. 'timespan' will be ignored.`;
    exports.noRequiredSetting = (dependent, required) => `${required} is required if ${dependent} is specified`;
    exports.noRequiredSettings = (dependent, required) => `${dependent} has effect only with one of the following:
 * ${required.join("\n * ")}`;
    exports.noMatching = (dependent, required) => `${dependent} has no matching ${required}`;
    exports.lineFeedRequired = (dependent) => `A linefeed character after '${dependent}' keyword is required`;
    exports.supportedUnits = () => `Supported units:\n * ${constants_1.INTERVAL_UNITS.join("\n * ")}`;
    exports.dateError = (specificMsg, name) => `${specificMsg}. ${name} must be a date or calendar expression, for example:
 * current_hour + 1 minute
 * 2019-04-01T10:15:00Z`;
});
