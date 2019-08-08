define('charts-language-service', ['exports', 'vscode-languageserver-types', 'escodegen', 'esprima'], function (exports, vscodeLanguageserverTypes, escodegen, esprima) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var INTERVAL_UNITS = [
        "nanosecond", "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year",
    ];
    var CALENDAR_KEYWORDS = [
        "current_day", "current_hour", "current_minute", "current_month", "current_quarter", "current_week",
        "current_year", "first_day", "first_vacation_day", "first_working_day", "friday", "last_vacation_day",
        "last_working_day", "monday", "next_day", "next_hour", "next_minute", "next_month", "next_quarter",
        "next_vacation_day", "next_week", "next_working_day", "next_year", "now", "previous_day", "previous_hour",
        "previous_minute", "previous_month", "previous_quarter", "previous_vacation_day", "previous_week",
        "previous_working_day", "previous_year", "saturday", "sunday", "thursday", "tuesday", "wednesday",
    ];
    var CONTROL_KEYWORDS = ["sql", "script", "if", "for", "var", "list", "csv"];
    var RELATIONS = [
        "!=",
        "==",
        "=",
        ">=",
        "<=",
        ">",
        "<"
    ];

    /**
     * Holds the description of a setting and corresponding methods.
     */
    var DefaultSetting = /** @class */ (function () {
        function DefaultSetting(setting) {
            /**
             * A brief description for the setting
             */
            this.description = "";
            /**
             * User-friendly setting name like 'refresh-interval'
             */
            this.displayName = "";
            /**
             * Array containing all possible values. RegExp is supported
             */
            this.enum = [];
            /**
             * Example value for the setting. Should not equal to the default value
             */
            this.example = "";
            /**
             * The settings in this array must not be declared simultaneously with the current
             */
            this.excludes = [];
            /**
             * The maximum allowed value for the setting
             */
            this.maxValue = Infinity;
            /**
             * The minimum allowed value for the setting
             */
            this.minValue = -Infinity;
            /**
             * Is the setting allowed to be repeated
             */
            this.multiLine = false;
            /**
             * Inner setting name. Lower-cased, without any symbols except alphabetical.
             * For example, "refreshinterval"
             */
            this.name = "";
            /**
             * The type of the setting.
             * Possible values: string, number, integer, boolean, enum, interval, date
             */
            this.type = "";
            /**
             * Type of the widget were setting is applicable, for example,
             * gradient-count is applicable for gauge, treemap and calendar.
             */
            this.widget = [];
            this.overrideCache = [];
            Object.assign(this, setting);
            this.enum = this.enum.map(function (v) { return v.toLowerCase(); });
            this.name = DefaultSetting.clearSetting(this.displayName);
            if (this.override) {
                for (var scope in this.override) {
                    if (this.override.hasOwnProperty(scope)) {
                        this.overrideCache.push({
                            setting: this.override[scope],
                            test: this.getOverrideTest(scope),
                        });
                    }
                }
            }
        }
        /**
         * Create an instance of setting with matching overrides applied.
         * If no override can be applied returns this instanse.
         * @param scope Configuration scope where setting exist
         */
        DefaultSetting.prototype.applyScope = function (scope) {
            if (this.override == null) {
                return this;
            }
            var matchingOverrides = this.overrideCache
                .filter(function (override) { return override.test(scope); })
                .map(function (override) { return override.setting; });
            if (matchingOverrides.length > 0) {
                return Object.assign.apply(Object, __spread([this], matchingOverrides));
            }
            else {
                return this;
            }
        };
        /**
         * Generates a string containing fully available information about the setting
         */
        DefaultSetting.prototype.toString = function () {
            // TODO: describe a script which is allowed as the setting value
            if (this.description == null) {
                return "";
            }
            var result = this.description + "  \n\n";
            if (this.example != null && this.example !== "") {
                result += "Example: " + this.displayName + " = " + this.example + "  \n";
            }
            if (this.type != null && this.type !== "") {
                result += "Type: " + this.type + "  \n";
            }
            if (this.defaultValue != null && this.defaultValue !== "") {
                result += "Default value: " + this.defaultValue + "  \n";
            }
            if (this.enum == null && this.enum.length === 0) {
                result += "Possible values: " + this.enum.join() + "  \n";
            }
            if (this.excludes != null && this.excludes.length !== 0) {
                result += "Can not be specified with: " + this.excludes.join() + "  \n";
            }
            if (this.maxValue != null && this.maxValue !== Infinity) {
                result += "Maximum: " + this.maxValue + "  \n";
            }
            if (this.minValue != null && this.minValue !== -Infinity) {
                result += "Minimum: " + this.minValue + "  \n";
            }
            if (this.section != null && this.section.length !== 0) {
                result += "Allowed in section: " + this.section + "  \n";
            }
            var widgets = "all";
            if (typeof this.widget !== "string" && this.widget.length > 0) {
                widgets = this.widget.join(", ");
            }
            else if (this.widget.length > 0) {
                widgets = this.widget;
            }
            result += "Allowed in widgets: " + widgets + "  \n";
            return result;
        };
        DefaultSetting.prototype.getOverrideTest = function (scopeSrc) {
            var scopeKeys = ["widget", "section"];
            var scopeSrcExtracted = /^\[(.*)\]$/.exec(scopeSrc);
            if (scopeSrcExtracted == null) {
                throw new Error("Wrong override scope format");
            }
            var source = "return !!(" + scopeSrcExtracted[1] + ");";
            var compiledScope = new Function(scopeKeys.join(), source);
            return function (scope) {
                try {
                    var values = scopeKeys.map(function (key) { return scope[key]; });
                    return compiledScope.apply(void 0, values);
                }
                catch (error) {
                    console.error("In '" + scopeSrc + "' :: " + error);
                }
            };
        };
        /**
         * Lowercases the string and deletes non-alphabetic characters
         * @param str string to be cleared
         * @returns cleared string
         */
        DefaultSetting.clearSetting = function (str) {
            return str.toLowerCase().replace(/[^a-z]/g, "");
        };
        /**
         * Lowercases the value of setting
         * @param str string to be cleared
         * @returns cleared string
         */
        DefaultSetting.clearValue = function (str) { return str.toLowerCase(); };
        return DefaultSetting;
    }());

    /**
     * Creates a error message for unknown setting or value.
     * @param found the variant found in the user's text
     * @returns message with or without a suggestion
     */
    var unknownToken = function (found) { return found + " is unknown."; };
    var deprecatedTagSection = "Replace [tag] sections with [tags].\nEnclose the tag name in double quotes in case it contains special characters.\n\n[tag]\n  name = k\n  value = v\n[tag]\n  name = my column\n  value = my value\n\n[tags]\n  k = v\n  \"my column\" = my value\n";
    var settingsWithWhitespaces = function (found) {
        return "The setting \"" + found + "\" contains whitespaces.\nReplace spaces with hyphens.";
    };
    var tagNameWithWhitespaces = function (found) {
        return "The tag name " + found + " contains whitespaces. Wrap it in double quotes.";
    };
    var settingNameInTags = function (found) {
        return found + " is interpreted as a series tag and is sent to the\nserver. " +
            "Move the setting outside of the [tags] section or\n" +
            "enclose in double-quotes to send it to the server without\na warning.";
    };
    var uselessScope = function (found, msg) {
        return found + " setting is appplied only if " + msg + ".";
    };
    var incorrectColors = function (found, msg) {
        return "Number of colors (if specified) must be equal to\nnumber of thresholds minus 1.\nCurrent: " + found + ", expected: " + msg;
    };
    var illegalSetting = function (found) {
        return found + " setting is not allowed here.";
    };
    /**
     * RegExp for: 'csv from <url>'
     */
    var CSV_FROM_URL_MISSING_NAME_PATTERN = /(^[ \t]*csv[ \t]+)[ \t]*(from)/;
    /**
     * If SCV pattern didn't match any known RegExp, compose error message
     * @param line line of code instruction
     * @returns csv error message
     */
    var getCsvErrorMessage = function (line) {
        return (CSV_FROM_URL_MISSING_NAME_PATTERN.test(line)) ? "<name> in 'csv <name> from <url>' is missing" :
            "The line should contain a '=' or 'from' keyword";
    };
    var noRequiredSetting = function (dependent, required) {
        return required + " is required if " + dependent + " is specified";
    };
    var noRequiredSettings = function (dependent, required) {
        return dependent + " has effect only with one of the following:\n * " + required.join("\n * ");
    };
    var noMatching = function (dependent, required) {
        return dependent + " has no matching " + required;
    };
    var lineFeedRequired = function (dependent) {
        return "A linefeed character after '" + dependent + "' keyword is required";
    };

    var DIAGNOSTIC_SOURCE = "Axibase Charts";
    var Util = /** @class */ (function () {
        function Util() {
        }
        /**
         * @param value the value to find
         * @param map the map to search
         * @returns true if at least one value in map is/contains the wanted value
         */
        Util.isInMap = function (value, map) {
            var e_1, _a, e_2, _b;
            if (value == null) {
                return false;
            }
            try {
                for (var _c = __values(map.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var array = _d.value;
                    try {
                        for (var array_1 = (e_2 = void 0, __values(array)), array_1_1 = array_1.next(); !array_1_1.done; array_1_1 = array_1.next()) {
                            var item = array_1_1.value;
                            if ((Array.isArray(item) && item.includes(value)) || (item === value)) {
                                return true;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (array_1_1 && !array_1_1.done && (_b = array_1.return)) _b.call(array_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return false;
        };
        /**
         * @param target array of aliases
         * @param array array to perform the search
         * @returns true, if array contains a value from target
         */
        Util.isAnyInArray = function (target, array) {
            var e_3, _a;
            try {
                for (var target_1 = __values(target), target_1_1 = target_1.next(); !target_1_1.done; target_1_1 = target_1.next()) {
                    var item = target_1_1.value;
                    if (array.includes(item)) {
                        return true;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (target_1_1 && !target_1_1.done && (_a = target_1.return)) _a.call(target_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return false;
        };
        /**
         * Counts CSV columns using RegExp.
         * @param line a CSV-formatted line
         * @returns number of CSV columns in the line
         */
        Util.countCsvColumns = function (line) {
            if (line.length === 0) {
                return 0;
            }
            var lineWithoutEscapes = line.replace(/(['"]).+\1/g, ""); // remove strings in quotes "6,3" or "6 3"
            return lineWithoutEscapes.split(",").length;
        };
        /**
         * Short-hand to create a diagnostic with undefined code and a standardized source
         * @param range Where is the mistake?
         * @param severity How severe is that problem?
         * @param message What message should be passed to the user?
         */
        Util.createDiagnostic = function (range, message, severity) {
            if (severity === void 0) { severity = vscodeLanguageserverTypes.DiagnosticSeverity.Error; }
            return vscodeLanguageserverTypes.Diagnostic.create(range, message, severity, undefined, DIAGNOSTIC_SOURCE);
        };
        /**
         * Replaces all comments with spaces.
         * We need to remember places of statements in the original configuration,
         * that's why it is not possible to delete all comments, whereas they must be ignored.
         * @param text the text to replace comments
         * @returns the modified text
         */
        Util.deleteComments = function (text) {
            var content = text;
            var multiLine = /\/\*[\s\S]*?\*\//g;
            var oneLine = /^[ \t]*#.*/mg;
            var match = multiLine.exec(content);
            if (match === null) {
                match = oneLine.exec(content);
            }
            while (match !== null) {
                var newLines = match[0].split("\n").length - 1;
                var spaces = Array(match[0].length)
                    .fill(" ")
                    .concat(Array(newLines).fill("\n"))
                    .join("");
                content = "" + content.substr(0, match.index) + spaces + content.substr(match.index + match[0].length);
                match = multiLine.exec(content);
                if (match === null) {
                    match = oneLine.exec(content);
                }
            }
            return content;
        };
        /**
         * Replaces scripts body with newline character
         * @param text the text to perform modifications
         * @returns the modified text
         */
        Util.deleteScripts = function (text) {
            return text.replace(/\bscript\b([\s\S]+?)\bendscript\b/g, "script\nendscript");
        };
        /**
         * Creates a diagnostic for a repeated setting. Warning if this setting was
         * multi-line previously, but now it is deprecated, error otherwise.
         * @param range The range where the diagnostic will be displayed
         * @param declaredAbove The setting, which has been declared earlier
         * @param current The current setting
         */
        Util.repetitionDiagnostic = function (range, declaredAbove, current) {
            var diagnosticSeverity = (["script", "thresholds", "colors"].includes(current.name)) ?
                vscodeLanguageserverTypes.DiagnosticSeverity.Warning : vscodeLanguageserverTypes.DiagnosticSeverity.Error;
            var message;
            switch (current.name) {
                case "script": {
                    message =
                        "Multi-line scripts are deprecated.\nGroup multiple scripts into blocks:\nscript\nendscript";
                    break;
                }
                case "thresholds": {
                    message = "Replace multiple `thresholds` settings with one, for example:\nthresholds = 0\nthresholds = 60\nthresholds = 80\n\nthresholds = 0, 60, 80";
                    declaredAbove.values.push(current.value);
                    break;
                }
                case "colors": {
                    message = "Replace multiple `colors` settings with one, for example:\ncolors = red\ncolors = yellow\ncolors = green\n\ncolors = red, yellow, green";
                    declaredAbove.values.push(current.value);
                    break;
                }
                default:
                    message = declaredAbove.displayName + " is already defined";
            }
            return Util.createDiagnostic(range, message, diagnosticSeverity);
        };
        /**
         * @returns true if the current line contains white spaces or nothing, false otherwise
         */
        Util.isEmpty = function (str) {
            return /^\s*$/.test(str);
        };
        /**
         * Creates Range object.
         *
         * @param start - The starting position in the string
         * @param length - Length of the word to be highlighted
         * @param lineNumber - Number of line, where is the word to be highlighted
         * @returns Range object with start equal to `start` and end equal to `start+length` and line equal to `lineNumber`
         */
        Util.createRange = function (start, length, lineNumber) {
            return vscodeLanguageserverTypes.Range.create(vscodeLanguageserverTypes.Position.create(lineNumber, start), vscodeLanguageserverTypes.Position.create(lineNumber, start + length));
        };
        return Util;
    }());

    var intervalUnits = [
        "nanosecond", "millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year",
    ];
    var calendarKeywords = [
        "current_day", "current_hour", "current_minute", "current_month", "current_quarter", "current_week",
        "current_year", "first_day", "first_vacation_day", "first_working_day", "friday", "last_vacation_day",
        "last_working_day", "monday", "next_day", "next_hour", "next_minute", "next_month", "next_quarter",
        "next_vacation_day", "next_week", "next_working_day", "next_year", "now", "previous_day", "previous_hour",
        "previous_minute", "previous_month", "previous_quarter", "previous_vacation_day", "previous_week",
        "previous_working_day", "previous_year", "saturday", "sunday", "thursday", "tuesday", "wednesday",
    ];
    var booleanKeywords = [
        "false", "no", "null", "none", "0", "off", "true", "yes", "on", "1",
    ];
    var booleanRegExp = new RegExp("^(?:" + booleanKeywords.join("|") + ")$");
    var calendarRegExp = new RegExp(
    // current_day
    "^(?:" + calendarKeywords.join("|") + ")" +
        (
        // + 5 * minute
        "(?:[ \\t]*[-+][ \\t]*(?:\\d+|(?:\\d+)?\\.\\d+)[ \\t]*\\*[ \\t]*(?:" + intervalUnits.join("|") + "))?$"));
    var integerRegExp = /^[-+]?\d+$/;
    var intervalRegExp = new RegExp(
    // -5 month, +3 day, .3 year, 2.3 week, all
    "^(?:(?:[-+]?(?:(?:\\d+|(?:\\d+)?\\.\\d+)|@\\{.+\\})[ \\t]*(?:" + intervalUnits.join("|") + "))|all)$");
    var localDateRegExp = new RegExp(
    // 2018-12-31
    "^(?:19[7-9]|[2-9]\\d\\d)\\d(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12][0-9]|3[01])" +
        // 01:13:46.123, 11:26:52
        "(?: (?:[01]\\d|2[0-4]):(?:[0-5][0-9])(?::(?:[0-5][0-9]))?(?:\\.\\d{1,9})?)?)?)?$");
    // 1, 5.2, 0.3, .9, -8, -0.5, +1.4
    var numberRegExp = /^(?:\-|\+)?(?:\.\d+|\d+(?:\.\d+)?)$/;
    var zonedDateRegExp = new RegExp(
    // 2018-12-31
    "^(?:19[7-9]|[2-9]\\d\\d)\\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])" +
        // T12:34:46.123, T23:56:18
        "[tT](?:[01]\\d|2[0-4]):(?:[0-5][0-9]):(?:[0-5][0-9])(?:\\.\\d{1,9})?" +
        // Z, +0400, -05:00
        "(?:[zZ]|[+-](?:[01]\\d|2[0-4]):?(?:[0-5][0-9]))$");
    var calculatedRegExp = /[@$]\{.+\}/;
    /**
     * Tests the provided string with regular expressions
     * @param text the target string
     * @returns true if the string is date expression, false otherwise
     */
    function isDate(text) {
        return calendarRegExp.test(text) || localDateRegExp.test(text) || zonedDateRegExp.test(text);
    }
    var specificValueChecksMap = new Map([
        ["forecastssagroupmanualgroups", {
                errMsg: "Incorrect group syntax",
                isIncorrect: function (value) {
                    var regex = /^[\d\s,;-]+$/;
                    return !regex.test(value);
                }
            }],
        ["forecastssagroupautounion", {
                errMsg: "Incorrect group union syntax",
                isIncorrect: function (value) {
                    var regex = /^[a-z\s,;-]+$/;
                    return !regex.test(value);
                }
            }]
    ]);
    /**
     * In addition to DefaultSetting contains specific fields.
     */
    var Setting = /** @class */ (function (_super) {
        __extends(Setting, _super);
        function Setting(setting) {
            var _this = _super.call(this, setting) || this;
            /**
             * Setting value.
             */
            _this.value = "";
            /**
             * Setting values for multiline settings (mostly for colors and thresholds).
             */
            _this.values = [];
            return _this;
        }
        Object.defineProperty(Setting.prototype, "textRange", {
            get: function () {
                return this._textRange;
            },
            set: function (value) {
                this._textRange = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Checks the type of the setting and creates a corresponding diagnostic
         * @param range where the error should be displayed
         */
        Setting.prototype.checkType = function (range) {
            var _this = this;
            var result;
            // allows ${} and @{} expressions
            if (calculatedRegExp.test(this.value)) {
                return result;
            }
            switch (this.type) {
                case "string": {
                    if (!/\S/.test(this.value)) {
                        result = Util.createDiagnostic(range, this.displayName + " can not be empty");
                        break;
                    }
                    if (this.enum.length > 0) {
                        if (this.value.split(/\s*,\s*/).some(function (s) { return _this.enum.indexOf(s) < 0; })) {
                            var enumList = this.enum.sort().join("\n * ");
                            result = Util.createDiagnostic(range, this.displayName + " must contain only the following:\n * " + enumList);
                        }
                        break;
                    }
                    var specCheck = specificValueChecksMap.get(this.name);
                    if (specCheck && specCheck.isIncorrect(this.value)) {
                        result = Util.createDiagnostic(range, specCheck.errMsg);
                    }
                    break;
                }
                case "number": {
                    var persent = /(\d*)%/.exec(this.value);
                    if (this.name === "arrowlength" && persent) {
                        this.maxValue = typeof this.maxValue === "object" ? this.maxValue.value * 100 : this.maxValue * 100;
                        this.minValue = typeof this.minValue === "object" ? this.minValue.value * 100 : this.minValue * 100;
                        this.value = persent[1];
                    }
                    result = this.checkNumber(numberRegExp, this.displayName + " should be a real (floating-point) number.", range);
                    break;
                }
                case "integer": {
                    result = this.checkNumber(integerRegExp, this.displayName + " should be an integer number.", range);
                    break;
                }
                case "boolean": {
                    if (!booleanRegExp.test(this.value)) {
                        result = Util.createDiagnostic(range, this.displayName + " should be a boolean value. For example, " + this.example);
                    }
                    break;
                }
                case "enum": {
                    var index = this.findIndexInEnum(this.value);
                    // Empty enum means that the setting is not allowed
                    if (this.enum.length === 0) {
                        result = Util.createDiagnostic(range, illegalSetting(this.displayName));
                    }
                    else if (index < 0) {
                        if (/percentile/.test(this.value) && /statistic/.test(this.name)) {
                            result = this.checkPercentile(range);
                            break;
                        }
                        var enumList = this.enum.sort().join("\n * ")
                            .replace(/percentile\\.+/, "percentile(n)");
                        result = Util.createDiagnostic(range, this.displayName + " must be one of:\n * " + enumList);
                    }
                    break;
                }
                case "interval": {
                    if (!intervalRegExp.test(this.value)) {
                        var message = ".\nFor example, " + this.example + ". Supported units:\n * " + intervalUnits.join("\n * ");
                        if (this.name === "updateinterval" && /^\d+$/.test(this.value)) {
                            result = Util.createDiagnostic(range, "Specifying the interval in seconds is deprecated.\nUse `count unit` format" + message, vscodeLanguageserverTypes.DiagnosticSeverity.Warning);
                        }
                        else {
                            /**
                             * Check other allowed non-interval values
                             * (for example, period, summarize-period, group-period supports "auto")
                             */
                            if (this.enum.length > 0) {
                                if (this.findIndexInEnum(this.value) < 0) {
                                    result = Util.createDiagnostic(range, "Use " + this.enum.sort().join(", ") + " or `count unit` format" + message);
                                }
                            }
                            else {
                                result = Util.createDiagnostic(range, this.displayName + " should be set as `count unit`" + message);
                            }
                        }
                    }
                    break;
                }
                case "date": {
                    if (!isDate(this.value)) {
                        result = Util.createDiagnostic(range, this.displayName + " should be a date. For example, " + this.example);
                    }
                    break;
                }
                case "object": {
                    try {
                        JSON.parse(this.value);
                    }
                    catch (err) {
                        result = Util.createDiagnostic(range, "Invalid object specified: " + err.message);
                    }
                    break;
                }
                default: {
                    throw new Error(this.type + " is not handled");
                }
            }
            return result;
        };
        Setting.prototype.checkNumber = function (reg, message, range) {
            var example = " For example, " + this.example;
            if (!reg.test(this.value)) {
                return Util.createDiagnostic(range, "" + message + example);
            }
            var minValue = typeof this.minValue === "object" ? this.minValue.value : this.minValue;
            var minValueExcluded = typeof this.minValue === "object" ? this.minValue.excluded : false;
            var maxValue = typeof this.maxValue === "object" ? this.maxValue.value : this.maxValue;
            var maxValueExcluded = typeof this.maxValue === "object" ? this.maxValue.excluded : false;
            var left = minValueExcluded ? "(" : "[";
            var right = maxValueExcluded ? ")" : "]";
            if (minValueExcluded && +this.value <= minValue || +this.value < minValue ||
                maxValueExcluded && +this.value >= maxValue || +this.value > maxValue) {
                return Util.createDiagnostic(range, this.displayName + " should be in range " + left + minValue + ", " + maxValue + right + "." + example);
            }
            return undefined;
        };
        Setting.prototype.checkPercentile = function (range) {
            var result;
            var n = this.value.match(/[^percntil_()]+/);
            if (n && +n[0] >= 0 && +n[0] <= 100) {
                if (/_/.test(this.value)) {
                    result = Util.createDiagnostic(range, "Underscore is deprecated, use percentile(" + n[0] + ") instead", vscodeLanguageserverTypes.DiagnosticSeverity.Warning);
                }
                else if (!new RegExp("\\(" + n[0] + "\\)").test(this.value)) {
                    result = Util.createDiagnostic(range, "Wrong usage. Expected: percentile(" + n[0] + ").\nCurrent: " + this.value);
                }
            }
            else {
                result = Util.createDiagnostic(range, "n must be a decimal number between [0, 100]. Current: " + (n ? n[0] : n));
            }
            return result;
        };
        Setting.prototype.findIndexInEnum = function (value) {
            var index = this.enum.findIndex(function (option) {
                return new RegExp("^" + option + "$", "i").test(value);
            });
            return index;
        };
        return Setting;
    }(DefaultSetting));

    /**
     * Provides hints for settings
     */
    var HoverProvider = /** @class */ (function () {
        function HoverProvider(document) {
            this.text = document.getText();
            this.document = document;
        }
        /**
         * Provides hover for the required position
         * @param position position where hover is requested
         */
        HoverProvider.prototype.provideHover = function (position) {
            var range = this.calculateRange(this.positionToOffset(position));
            if (range === null) {
                return null;
            }
            var word = this.text.substring(range.start, range.end);
            var name = Setting.clearSetting(word);
            var setting = LanguageService.getResourcesProvider().getSetting(name);
            if (setting == null || setting.description == null) {
                return null;
            }
            return {
                contents: setting.toString(),
                range: vscodeLanguageserverTypes.Range.create(this.offsetToPosition(range.start), this.offsetToPosition(range.end)),
            };
        };
        /**
         * Converts Position to offset
         * @param position the Position to be converted
         */
        HoverProvider.prototype.positionToOffset = function (position) {
            return this.document.offsetAt(position);
        };
        /**
         * Converts offset to Position
         * @param offset the offset to be converted
         */
        HoverProvider.prototype.offsetToPosition = function (offset) {
            return this.document.positionAt(offset);
        };
        /**
         * Finds limits of a line in text
         * @param position position from which to start
         */
        HoverProvider.prototype.lineLimits = function (position) {
            return {
                end: this.positionToOffset(vscodeLanguageserverTypes.Position.create(position.line + 1, 0)) - 1,
                start: this.positionToOffset(vscodeLanguageserverTypes.Position.create(position.line, 0)),
            };
        };
        /**
         * Calculates the range where the setting is defined
         * @param offset offset from which to start
         */
        HoverProvider.prototype.calculateRange = function (offset) {
            var lineLimits = this.lineLimits(this.offsetToPosition(offset));
            var line = this.text.substring(lineLimits.start, lineLimits.end);
            var regexp = /\S.+?(?=\s*?=)/;
            var match = regexp.exec(line);
            if (match === null) {
                return null;
            }
            var start = lineLimits.start + match.index;
            var end = start + match[0].length;
            if (offset >= start && offset <= end) {
                return { end: end, start: start };
            }
            return null;
        };
        return HoverProvider;
    }());

    var LanguageService = /** @class */ (function () {
        function LanguageService() {
        }
        LanguageService.initialize = function (resourcesProvider) {
            LanguageService.resourcesProvider = resourcesProvider;
        };
        LanguageService.getResourcesProvider = function () {
            if (LanguageService.resourcesProvider === undefined) {
                throw new Error("LanguageService wasn't properly initialized with ResourcesProvider");
            }
            return LanguageService.resourcesProvider;
        };
        LanguageService.getCompletionProvider = function (textDocument, position) {
            return new CompletionProvider(textDocument, position);
        };
        LanguageService.getValidator = function (text) {
            return new Validator(text);
        };
        LanguageService.getHoverProvider = function (document) {
            return new HoverProvider(document);
        };
        LanguageService.getFormatter = function (text, formattingOptions) {
            return new Formatter(text, formattingOptions);
        };
        return LanguageService;
    }());

    /**
     * Provides dynamic completion items.
     */
    var CompletionProvider = /** @class */ (function () {
        function CompletionProvider(textDocument, position) {
            var text = textDocument.getText().substr(0, textDocument.offsetAt(position));
            this.text = Util.deleteScripts(Util.deleteComments(text));
            var textList = this.text.split("\n");
            this.currentLine = textList[textList.length - 1];
        }
        /**
         * Creates completion items
         */
        CompletionProvider.prototype.getCompletionItems = function () {
            var valueMatch = /^\s*(\S+)\s*=\s*/.exec(this.currentLine);
            var bracketsMatch = /\s*(\[.*?)\s*/.exec(this.currentLine);
            if (valueMatch) {
                // completion requested at assign stage, i. e. type = <Ctrl + space>
                return this.completeSettingValue(valueMatch[1]);
            }
            else if (bracketsMatch) {
                // requested completion for section name in []
                return this.completeSectionName();
            }
            else {
                // completion requested at start of line (supposed that line is empty)
                return this.completeSnippets().concat(this.completeIf(), this.completeFor(), this.completeSettingName(), this.completeSectionName(), this.completeControlKeyWord(), this.completeEndKeyword());
            }
        };
        /**
         * Creates a completion item containing `for` loop.
         * `in` statement is generated based on previously declared lists and vars if any.
         * Variable name is generated based on `in` statement.
         * @returns completion item
         */
        CompletionProvider.prototype.completeFor = function () {
            var regexp = /^[ \t]*(?:list|var)[ \t]+(\S+)[ \t]*=/mg;
            var match = regexp.exec(this.text);
            var lastMatch;
            while (match) {
                lastMatch = match;
                match = regexp.exec(this.text);
            }
            var collection = "collection";
            var item = "item";
            if (lastMatch) {
                collection = lastMatch[1];
                if (collection.endsWith("s")) {
                    item = collection.substr(0, collection.lastIndexOf("s"));
                }
            }
            var completion = vscodeLanguageserverTypes.CompletionItem.create("for");
            completion.insertText = "\nfor ${1:" + item + "} in ${2:" + collection + "}\n  ${3:entity = @{${1:" + item + "}}}\n  ${0}\nendfor";
            completion.detail = "For loop";
            completion.kind = vscodeLanguageserverTypes.CompletionItemKind.Keyword;
            completion.insertTextFormat = vscodeLanguageserverTypes.InsertTextFormat.Snippet;
            return completion;
        };
        /**
         * Creates an array of completion items containing section names.
         * @returns array containing snippets
         */
        CompletionProvider.prototype.completeControlKeyWord = function () {
            var e_1, _a;
            var items = [];
            try {
                for (var CONTROL_KEYWORDS_1 = __values(CONTROL_KEYWORDS), CONTROL_KEYWORDS_1_1 = CONTROL_KEYWORDS_1.next(); !CONTROL_KEYWORDS_1_1.done; CONTROL_KEYWORDS_1_1 = CONTROL_KEYWORDS_1.next()) {
                    var keyword = CONTROL_KEYWORDS_1_1.value;
                    items.push(this.fillCompletionItem({
                        detail: "Control keyword: " + keyword,
                        insertText: "" + keyword,
                        kind: vscodeLanguageserverTypes.CompletionItemKind.Keyword,
                        name: keyword
                    }));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (CONTROL_KEYWORDS_1_1 && !CONTROL_KEYWORDS_1_1.done && (_a = CONTROL_KEYWORDS_1.return)) _a.call(CONTROL_KEYWORDS_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return items;
        };
        /**
         * Completes keywords endings such as `endsql`, `endfor` etc
         */
        CompletionProvider.prototype.completeEndKeyword = function () {
            // detected `end`
            var endWordRegex = /^[ \t]*(end)[ \t]*/gm;
            // detected any control keyword in previous code
            var keywordsRegex = new RegExp("^[ \t]*(?:" + CONTROL_KEYWORDS.join("|") + ")[ \t]*", "mg");
            var completions = [];
            if (endWordRegex.test(this.text)) {
                var keywordMatch = keywordsRegex.exec(this.text);
                var keywordLastMatch = void 0;
                while (keywordMatch) {
                    keywordLastMatch = keywordMatch;
                    keywordMatch = keywordsRegex.exec(this.text);
                }
                if (keywordLastMatch) {
                    var keyword = keywordLastMatch[0].trim();
                    completions.push(this.fillCompletionItem({
                        detail: "Control keyword: " + keyword,
                        insertText: "end" + keyword,
                        kind: vscodeLanguageserverTypes.CompletionItemKind.Keyword,
                    }));
                }
            }
            return completions;
        };
        /**
         * Creates an array of completion items containing `if` statement.
         * Conditions are generated based on previously declared `for` loops.
         * @returns array containing variants of `if` statement
         */
        CompletionProvider.prototype.completeIf = function () {
            var regexp = /^[ \t]*for[ \t]+(\w+)[ \t]+in/img;
            var endFor = /^[ \t]*endfor/img;
            var match = regexp.exec(this.text);
            var lastMatch;
            while (match) {
                var end = endFor.exec(this.text);
                if (!end || end.index < match.index) {
                    lastMatch = match;
                }
                match = regexp.exec(this.text);
            }
            var item = "item";
            if (lastMatch) {
                item = lastMatch[1];
            }
            var ifString = vscodeLanguageserverTypes.CompletionItem.create("if string");
            ifString.detail = "if item equals text";
            ifString.insertText = "\nif @{${1:" + item + "}} ${2:==} ${3:\"item1\"}\n  ${4:entity} = ${5:\"item2\"}\nelse\n  ${4:entity} = ${6:\"item3\"}\nendif\n${0}";
            var ifNumber = vscodeLanguageserverTypes.CompletionItem.create("if number");
            ifNumber.insertText = "\nif @{${1:" + item + "}} ${2:==} ${3:5}\n  ${4:entity} = ${5:\"item1\"}\nelse\n  ${4:entity} = ${6:\"item2\"}\nendif\n${0}";
            ifNumber.detail = "if item equals number";
            var ifElseIf = vscodeLanguageserverTypes.CompletionItem.create("if else if");
            ifElseIf.detail = "if item equals number else if";
            ifElseIf.insertText = "\nif @{${1:" + item + "}} ${2:==} ${3:5}\n  ${4:entity} = ${5:\"item1\"}\nelseif @{${1:" + item + "}} ${6:==} ${7:6}\n  ${4:entity} = ${8:\"item2\"}\nelse\n  ${4:entity} = ${9:\"item3\"}\nendif\n${0}";
            return [ifString, ifNumber, ifElseIf].map(function (completion) {
                completion.insertTextFormat = vscodeLanguageserverTypes.InsertTextFormat.Snippet;
                completion.kind = vscodeLanguageserverTypes.CompletionItemKind.Snippet;
                return completion;
            });
        };
        /**
         * Creates an array of completion items containing setting names.
         * @returns array containing snippets
         */
        CompletionProvider.prototype.completeSettingName = function () {
            var _this = this;
            var items = [];
            var map = Array.from(LanguageService.getResourcesProvider().settingsMap.values());
            map.forEach(function (value) {
                items.push(_this.fillCompletionItem({
                    detail: (value.description ? value.description + "\n" : "") + "Example: " + value.example,
                    insertText: value.displayName + " = ",
                    kind: vscodeLanguageserverTypes.CompletionItemKind.Field,
                    name: value.displayName
                }));
            });
            return items;
        };
        /**
         * Creates an array of completion items containing section names.
         * @returns array containing snippets
         */
        CompletionProvider.prototype.completeSectionName = function () {
            var e_2, _a;
            var items = [];
            var sectionNames = Object.keys(ResourcesProviderBase.sectionDepthMap);
            try {
                for (var sectionNames_1 = __values(sectionNames), sectionNames_1_1 = sectionNames_1.next(); !sectionNames_1_1.done; sectionNames_1_1 = sectionNames_1.next()) {
                    var item = sectionNames_1_1.value;
                    items.push(this.fillCompletionItem({
                        detail: "Section name: [" + item + "]",
                        insertText: "" + item,
                        kind: vscodeLanguageserverTypes.CompletionItemKind.Struct,
                        name: item
                    }));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (sectionNames_1_1 && !sectionNames_1_1.done && (_a = sectionNames_1.return)) _a.call(sectionNames_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return items;
        };
        /**
         * Creates an array of completion items containing possible values for settings.
         * @param settingName name of the setting, for example "colors"
         * @returns array containing completions
         */
        CompletionProvider.prototype.completeSettingValue = function (settingName) {
            var setting = LanguageService.getResourcesProvider().getSetting(settingName);
            if (!setting) {
                return [];
            }
            switch (setting.type) {
                case "string": {
                    return this.completeStringSettingValue(setting);
                }
                case "number":
                case "integer":
                    if (setting.example) {
                        return [this.fillCompletionItem({ insertText: setting.example.toString() })];
                    }
                    break;
                case "boolean": {
                    return this.getItemsArray(["true", "false"]);
                }
                case "enum": {
                    return this.getItemsArray(setting.enum.map(function (el) {
                        return el.replace(/percentile\\.+/, "percentile(n)");
                    }));
                }
                case "interval": {
                    return this.getItemsArray.apply(this, __spread([INTERVAL_UNITS], setting.enum));
                }
                case "date": {
                    return this.getItemsArray(CALENDAR_KEYWORDS, new Date().toISOString());
                }
                default: {
                    return [];
                }
            }
            return [];
        };
        /**
         * Creates an array of completion items containing snippets.
         * @returns array containing snippets
         */
        CompletionProvider.prototype.completeSnippets = function () {
            var _this = this;
            var snippets = LanguageService.getResourcesProvider().readSnippets();
            var items = Object.keys(snippets).map(function (key) {
                var insertText = (typeof snippets[key].body === "string") ?
                    snippets[key].body : snippets[key].body.join("\n");
                return _this.fillCompletionItem({
                    insertText: insertText, detail: snippets[key].description,
                    name: key, insertTextFormat: vscodeLanguageserverTypes.InsertTextFormat.Snippet, kind: vscodeLanguageserverTypes.CompletionItemKind.Keyword
                });
            });
            return items;
        };
        /**
         * Creates an array of completion items containing possible values for settings with type = "string".
         * @param setting the setting
         * @returns array containing completions
         */
        CompletionProvider.prototype.completeStringSettingValue = function (setting) {
            var _this = this;
            var valueItems = [];
            var scriptItems = [];
            if (setting.possibleValues) {
                valueItems = setting.possibleValues.map(function (v) {
                    return _this.fillCompletionItem({ insertText: v.value, detail: v.detail });
                });
            }
            if (setting.script) {
                setting.script.fields.forEach(function (field) {
                    var e_3, _a;
                    if (field.type === "function") {
                        var itemFields = { insertText: "", kind: vscodeLanguageserverTypes.CompletionItemKind.Function };
                        if (field.args) {
                            var requiredArgs = field.args.filter(function (a) { return a.required; });
                            var optionalArgs = field.args.filter(function (a) { return !a.required; });
                            var requiredArgsString = "" + requiredArgs.map(function (field) { return field.name; }).join(", ");
                            itemFields.insertText = "" + field.name + (requiredArgsString !== "" ?
                                "(" + requiredArgsString + ")" : "");
                            scriptItems.push(_this.fillCompletionItem(itemFields));
                            var args = "";
                            try {
                                for (var optionalArgs_1 = __values(optionalArgs), optionalArgs_1_1 = optionalArgs_1.next(); !optionalArgs_1_1.done; optionalArgs_1_1 = optionalArgs_1.next()) {
                                    var arg = optionalArgs_1_1.value;
                                    args = "" + (args !== "" ? args + ", " : "") + arg.name;
                                    itemFields.insertText = field.name + "(" + (requiredArgsString !== "" ?
                                        requiredArgsString + ", " : "") + args + ")";
                                    scriptItems.push(_this.fillCompletionItem(itemFields));
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (optionalArgs_1_1 && !optionalArgs_1_1.done && (_a = optionalArgs_1.return)) _a.call(optionalArgs_1);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        else {
                            itemFields.insertText = field.name;
                            scriptItems.push(_this.fillCompletionItem(itemFields));
                        }
                    }
                    else {
                        scriptItems.push(_this.fillCompletionItem({
                            insertText: field.name,
                            detail: "Type: " + field.type
                        }));
                    }
                });
            }
            if (!setting.possibleValues && setting.example !== "") {
                valueItems = [this.fillCompletionItem({
                        insertText: setting.example.toString(),
                        kind: vscodeLanguageserverTypes.CompletionItemKind.Field
                    })];
            }
            return valueItems.concat(scriptItems);
        };
        /**
         * Set fields for CompletionItem
         * @param insertText text to be inserted with completion request
         * @returns completion
         */
        CompletionProvider.prototype.fillCompletionItem = function (itemFields) {
            var item = vscodeLanguageserverTypes.CompletionItem.create(itemFields.name || itemFields.insertText);
            item.insertTextFormat = itemFields.insertTextFormat || vscodeLanguageserverTypes.InsertTextFormat.PlainText;
            item.kind = itemFields.kind || vscodeLanguageserverTypes.CompletionItemKind.Value;
            item.insertText = itemFields.insertText;
            item.detail = itemFields.detail || itemFields.insertText;
            item.sortText = item.kind.toString();
            return item;
        };
        /**
         * Сonverts the source array to array of completions
         * @param processedArray the source array
         * @param additionalStrings the strings to be processed and added to completions
         * @returns completions
         */
        CompletionProvider.prototype.getItemsArray = function (processedArray) {
            var e_4, _a;
            var _this = this;
            var additionalStrings = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                additionalStrings[_i - 1] = arguments[_i];
            }
            var items = processedArray.map(function (el) { return _this.fillCompletionItem({ insertText: el }); });
            try {
                for (var additionalStrings_1 = __values(additionalStrings), additionalStrings_1_1 = additionalStrings_1.next(); !additionalStrings_1_1.done; additionalStrings_1_1 = additionalStrings_1.next()) {
                    var s = additionalStrings_1_1.value;
                    items.push(this.fillCompletionItem({ insertText: s }));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (additionalStrings_1_1 && !additionalStrings_1_1.done && (_a = additionalStrings_1.return)) _a.call(additionalStrings_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return items;
        };
        return CompletionProvider;
    }());

    /** Regular expressions for CSV syntax checking */
    //  csv <name> =
    //  <header1>, <header2>
    var CSV_NEXT_LINE_HEADER_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(=)/m;
    // csv <name> = <header1>, <header2>
    var CSV_INLINE_HEADER_PATTERN = /=[ \t]*$/m;
    // csv <name> from <url>
    var CSV_FROM_URL_PATTERN = /(^[ \t]*csv[ \t]+)(\w+)[ \t]*(from)/m;
    // blank line
    var BLANK_LINE_PATTERN = /^[ \t]*$/m;
    // csv
    var CSV_KEYWORD_PATTERN = /\b(csv)\b/i;
    /** Regular expressions to match SQL */
    // sql = SELECT time, entity, value FROM cpu_busy
    var ONE_LINE_SQL = /^\s*sql\s*=.*$/m;
    // sql SELECT 1
    var BLOCK_SQL_START_WITHOUT_LF = /(^\s*)sql\s*\S/;
    /** Regular expressions to match script */
    // script = console.log()
    var ONE_LINE_SCRIPT = /^\s*script(?:\s+)*=\s+(.*)$/m;
    // script alert("Hello, world!")
    var BLOCK_SCRIPT_START_WITHOUT_LF = /(^\s*)script\s*\S/;
    // script
    var BLOCK_SCRIPT_START = /(?:^\s*)script(?!([\s\S]*=))/;
    // endscript
    var BLOCK_SCRIPT_END = /^\s*endscript\s*$/;
    // =, ==, !=, >=, <=, >, <
    var RELATIONS_REGEXP = new RegExp("(^\\s*.+?)(\\s*?)(" + RELATIONS.join("|") + ")(\\s*)");

    /**
     * Used in JavaScriptChecksQueue to ensure that the udf is placed earlier than it's first call
     */
    var CheckPriority;
    (function (CheckPriority) {
        CheckPriority[CheckPriority["High"] = 0] = "High";
        CheckPriority[CheckPriority["Low"] = 1] = "Low";
    })(CheckPriority || (CheckPriority = {}));

    /**
     * Contains the text and the position of the text
     */
    var TextRange = /** @class */ (function () {
        function TextRange(text, range, canBeUnclosed) {
            if (canBeUnclosed === void 0) { canBeUnclosed = false; }
            /**
             * Priority of the text, used in jsDomCaller: settings with higher priority are placed earlier in test js "file"
             */
            this.priority = CheckPriority.Low;
            this.range = range;
            this.text = text;
            this.canBeUnclosed = canBeUnclosed;
        }
        /**
         * Checks is current keyword closeable or not (can be closed like var-endvar)
         * @param line the line containing the keyword
         * @returns true if the keyword closeable
         */
        TextRange.isCloseAble = function (line) {
            return /^[\s\t]*(?:for|if|list|sql|var|script[\s\t]*$|csv|else|elseif)\b/.test(line);
        };
        /**
         * Checks does the keyword close a section or not
         * @param line the line containing the keyword
         * @returns true if the keyword closes a section
         */
        TextRange.isClosing = function (line) {
            return /^[\s\t]*(?:end(?:for|if|list|var|script|sql|csv)|elseif|else)\b/.test(line);
        };
        /**
         * Parses a keyword from the line and creates a TextRange.
         * @param line the line containing the keyword
         * @param i the index of the line
         * @param canBeUnclosed whether keyword can exist in both closed and unclosed variant or not
         */
        TextRange.parse = function (line, i, canBeUnclosed) {
            var match = TextRange.KEYWORD_REGEXP.exec(line);
            if (match === null) {
                return undefined;
            }
            var _a = __read(match, 3), indent = _a[1], keyword = _a[2];
            return new TextRange(keyword, Util.createRange(indent.length, keyword.length, i), canBeUnclosed);
        };
        /**
         * Determines if line contains a keyword that can be unclosed
         * @param line the line containing the keyword
         */
        TextRange.canBeUnclosed = function (line) {
            return TextRange.CAN_BE_UNCLOSED_REGEXP.some(function (regexp) {
                return regexp.test(line);
            });
        };
        Object.defineProperty(TextRange.prototype, "textPriority", {
            /**
             * priority property setter
             */
            set: function (value) {
                this.priority = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Matches a keyword
         */
        TextRange.KEYWORD_REGEXP = 
        // tslint:disable-next-line: max-line-length
        /^([ \t]*)(import|endvar|endcsv|endfor|elseif|endif|endscript|endlist|endsql|script|else|if|list|sql|for|csv|var)\b/i;
        /**
         * Regexps for keywords supporting both closed and unclosed syntax
         */
        TextRange.CAN_BE_UNCLOSED_REGEXP = [
            CSV_FROM_URL_PATTERN,
            ONE_LINE_SQL,
            ONE_LINE_SCRIPT
        ];
        return TextRange;
    }());

    /**
     * Formats the document
     */
    var Formatter = /** @class */ (function () {
        function Formatter(text, formattingOptions) {
            /**
             * Currently used indent
             */
            this.currentIndent = "";
            /**
             * Current line number
             */
            this.currentLine = 0;
            /**
             * Created TextEdits
             */
            this.edits = [];
            /**
             * A flag used to determine are we inside of a keyword or not
             */
            this.insideKeyword = false;
            /**
             * Array containing indents at start of keywords to restore them later
             */
            this.keywordsLevels = [];
            /**
             * Indent of last keyword.
             */
            this.lastKeywordIndent = "";
            this.lastAddedParent = {};
            this.previousSection = {};
            this.currentSection = {};
            this.options = formattingOptions;
            this.lines = text.split("\n");
        }
        /**
         * Reads the document line by line and calls corresponding formatting functions
         * @returns array of text edits to properly format document
         */
        Formatter.prototype.lineByLine = function () {
            for (var line = this.getLine(this.currentLine); line !== void 0; line = this.nextLine()) {
                if (Util.isEmpty(line)) {
                    if (this.currentSection.name === "tags" && this.previousSection.name !== "widget") {
                        Object.assign(this.currentSection, this.previousSection);
                        this.decreaseIndent();
                    }
                    continue;
                }
                else if (this.isSectionDeclaration()) {
                    this.calculateSectionIndent();
                    this.checkIndent();
                    this.increaseIndent();
                    continue;
                }
                else if (BLOCK_SCRIPT_START.test(line)) {
                    this.checkIndent();
                    this.formatScript();
                    this.checkIndent();
                    continue;
                }
                else {
                    this.checkSign();
                }
                if (TextRange.isClosing(line)) {
                    var stackHead = this.keywordsLevels.pop();
                    this.setIndent(stackHead);
                    this.insideKeyword = false;
                    this.lastKeywordIndent = "";
                }
                this.checkIndent();
                if (TextRange.isCloseAble(line) && this.shouldBeClosed()) {
                    this.keywordsLevels.push(this.currentIndent.length / Formatter.BASE_INDENT_SIZE);
                    this.lastKeywordIndent = this.currentIndent;
                    this.increaseIndent();
                    this.insideKeyword = true;
                }
            }
            return this.edits;
        };
        /**
         * Formats JavaScript content inside script tags
         */
        Formatter.prototype.formatScript = function () {
            var line = this.nextLine();
            var startLine = this.currentLine;
            // Get content between script tags
            var buffer = [];
            while (line !== undefined && !BLOCK_SCRIPT_END.test(line)) {
                buffer.push(line);
                line = this.nextLine();
            }
            if (!buffer.length) {
                return;
            }
            var content = buffer.join("\n");
            // Parse and format JavaScript
            var parsedCode = esprima.parseScript(content);
            var formattedCode = escodegen.generate(parsedCode, {
                format: {
                    indent: {
                        base: (this.currentIndent.length / this.options.tabSize) + 1,
                        style: " ".repeat(this.options.tabSize)
                    }
                }
            });
            var endLine = this.currentLine - 1;
            var endCharacter = this.getLine(endLine).length;
            this.edits.push(vscodeLanguageserverTypes.TextEdit.replace(vscodeLanguageserverTypes.Range.create(startLine, 0, endLine, endCharacter), formattedCode));
        };
        /**
         * Checks how many spaces are between the sign and setting name
         */
        Formatter.prototype.checkSign = function () {
            var line = this.getCurrentLine();
            var match = RELATIONS_REGEXP.exec(line);
            if (match === null) {
                return;
            }
            var _a = __read(match, 5), declaration = _a[1], spacesBefore = _a[2], sign = _a[3], spacesAfter = _a[4];
            if (spacesBefore !== " ") {
                this.edits.push(vscodeLanguageserverTypes.TextEdit.replace(Util.createRange(declaration.length, spacesBefore.length, this.currentLine), " "));
            }
            if (spacesAfter !== " ") {
                var start = line.indexOf(sign) + sign.length;
                this.edits.push(vscodeLanguageserverTypes.TextEdit.replace(Util.createRange(start, spacesAfter.length, this.currentLine), " "));
            }
        };
        /**
         * Calculates current indent based on current state
         */
        Formatter.prototype.calculateSectionIndent = function () {
            if (!this.match) {
                throw new Error("this.match or/and this.current is not defined in calculateIndent");
            }
            Object.assign(this.previousSection, this.currentSection);
            this.currentSection.name = this.match[2];
            var depth = ResourcesProviderBase.sectionDepthMap[this.currentSection.name];
            switch (depth) {
                case 0: // [configuration]
                case 1: // [group]
                case 2: { // [widget]
                    this.setIndent(depth - 1);
                    this.lastAddedParent = { name: this.currentSection.name, indent: this.currentIndent };
                    break;
                }
                case 3: { // [series], [dropdown], [column], ...
                    if (ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                        this.currentIndent = this.previousSection.indent;
                        this.increaseIndent();
                    }
                    else {
                        /**
                         *     [tags]
                         *       ...
                         *  [series]
                         *    ...
                         */
                        this.setIndent(depth - 1);
                    }
                    if (this.insideKeyword && this.currentIndent.length <= this.lastKeywordIndent.length) {
                        this.currentIndent = this.lastKeywordIndent;
                    }
                    if (["series", "dropdown"].includes(this.currentSection.name)) {
                        /**
                         * Change parent only if current is [series] or [dropdown],
                         * because only they could have child sections ([tag/tags] or [option]).
                         */
                        this.lastAddedParent = { name: this.currentSection.name, indent: this.currentIndent };
                    }
                    break;
                }
                case 4: { // [option], [properties], [tags]
                    if (ResourcesProviderBase.isNestedToPrevious(this.currentSection.name, this.previousSection.name)) {
                        this.currentIndent = this.previousSection.indent;
                    }
                    else {
                        this.currentIndent = this.lastAddedParent.indent;
                    }
                    this.increaseIndent();
                    break;
                }
            }
            this.currentSection.indent = this.currentIndent;
            if (this.insideKeyword) {
                this.increaseIndent();
            }
        };
        /**
         * Creates a text edit if the current indent is incorrect
         */
        Formatter.prototype.checkIndent = function () {
            this.match = /(^\s*)\S/.exec(this.getCurrentLine());
            if (this.match && this.match[1] !== this.currentIndent) {
                var indent = this.match[1];
                this.edits.push(vscodeLanguageserverTypes.TextEdit.replace(vscodeLanguageserverTypes.Range.create(this.currentLine, 0, this.currentLine, indent.length), this.currentIndent));
            }
        };
        /**
         * Decreases the current indent by one
         */
        Formatter.prototype.decreaseIndent = function () {
            if (this.currentIndent.length === 0) {
                return;
            }
            var newLength = this.currentIndent.length;
            if (this.options.insertSpaces) {
                newLength -= this.options.tabSize;
            }
            else {
                newLength--;
            }
            this.currentIndent = this.currentIndent.substring(0, newLength);
        };
        /**
         * @returns current line
         */
        Formatter.prototype.getCurrentLine = function () {
            var line = this.getLine(this.currentLine);
            if (line === undefined) {
                throw new Error("this.currentLine points to nowhere");
            }
            return line;
        };
        /**
         * Caches last returned line in this.lastLineNumber
         * To prevent several calls of removeExtraSpaces
         * @param i the required line number
         * @returns the required line
         */
        Formatter.prototype.getLine = function (i) {
            if (!this.lastLine || this.lastLineNumber !== i) {
                var line = this.lines[i];
                if (line === undefined) {
                    return undefined;
                }
                this.removeExtraSpaces(line);
                this.lastLine = line;
                this.lastLineNumber = i;
            }
            return this.lastLine;
        };
        /**
         * Gets next line of text document
         */
        Formatter.prototype.nextLine = function () {
            return this.getLine(++this.currentLine);
        };
        /**
         * Increases current indent by one
         */
        Formatter.prototype.increaseIndent = function () {
            var addition = "\t";
            if (this.options.insertSpaces) {
                addition = Array(this.options.tabSize)
                    .fill(" ")
                    .join("");
            }
            this.currentIndent += addition;
        };
        /**
         * @returns true, if current line is section declaration
         */
        Formatter.prototype.isSectionDeclaration = function () {
            this.match = /(^\s*)\[([a-z]+)\]/.exec(this.getCurrentLine());
            return this.match !== null;
        };
        /**
         * Removes trailing spaces (at the end and at the beginning)
         * @param line the target line
         */
        Formatter.prototype.removeExtraSpaces = function (line) {
            var match = / (\s +) $ /.exec(line);
            if (match) {
                this.edits.push(vscodeLanguageserverTypes.TextEdit.replace(vscodeLanguageserverTypes.Range.create(this.currentLine, line.length - match[1].length, this.currentLine, line.length), ""));
            }
        };
        /**
         * Sets current indent to the provided
         * @param newIndentLenth the new indent
         */
        Formatter.prototype.setIndent = function (newIndentLenth) {
            if (newIndentLenth === void 0) { newIndentLenth = 0; }
            var newIndent = "";
            for (; newIndentLenth > 0; newIndentLenth--) {
                newIndent += "  ";
            }
            this.currentIndent = newIndent;
        };
        /**
         * @returns true if current keyword should be closed
         */
        Formatter.prototype.shouldBeClosed = function () {
            var line = this.getCurrentLine();
            // If keyword supports unclosed syntax no need to check further
            if (TextRange.canBeUnclosed(line)) {
                return false;
            }
            this.match = /^[ \t]*((?:var|list|sql)|script[\s\t]*$)/.exec(line);
            if (!this.match) {
                return true;
            }
            switch (this.match[1]) {
                case "var": {
                    if (/=\s*(\[|\{)(|.*,)\s*$/m.test(line)) {
                        return true;
                    }
                    break;
                }
                case "list": {
                    if (/(=|,)[ \t]*$/m.test(line)) {
                        return true;
                    }
                    break;
                }
                default: return true;
            }
            return false;
        };
        /**
         * Number of spaces between parent and child indents
         */
        Formatter.BASE_INDENT_SIZE = 2;
        return Formatter;
    }());

    var ResourcesProviderBase = /** @class */ (function () {
        function ResourcesProviderBase() {
            this.settingsMap = this.createSettingsMap();
        }
        /**
         * Map of required settings for each section and their "aliases".
         * For instance, `series` requires `entity`, but `entities` is also allowed.
         * Additionally, `series` requires `metric`, but `table` with `attribute` is also ok
         */
        ResourcesProviderBase.getRequiredSectionSettingsMap = function (settingsMap) {
            return new Map([
                ["configuration", {
                        sections: [
                            ["group"],
                        ],
                    }],
                ["series", {
                        settings: [
                            [
                                settingsMap.get("entity"), settingsMap.get("value"),
                                settingsMap.get("entities"), settingsMap.get("entitygroup"),
                                settingsMap.get("entityexpression"),
                            ],
                            [
                                settingsMap.get("metric"), settingsMap.get("value"),
                                settingsMap.get("table"), settingsMap.get("attribute"),
                            ],
                        ],
                    }],
                ["group", {
                        sections: [
                            ["widget"],
                        ],
                    }],
                ["widget", {
                        sections: [
                            ["series"],
                        ],
                        settings: [
                            [settingsMap.get("type")],
                        ],
                    }],
                ["dropdown", {
                        settings: [
                            [settingsMap.get("onchange"), settingsMap.get("changefield")],
                        ],
                    }],
                ["node", {
                        settings: [
                            [settingsMap.get("id")],
                        ],
                    }],
            ]);
        };
        /**
         * @returns array of parent sections for the section
         */
        ResourcesProviderBase.getParents = function (section) {
            var e_1, _a;
            var parents = [];
            var found = ResourcesProviderBase.parentSections.get(section);
            if (found !== undefined) {
                try {
                    for (var found_1 = __values(found), found_1_1 = found_1.next(); !found_1_1.done; found_1_1 = found_1.next()) {
                        var father = found_1_1.value;
                        // JS recursion is not tail-optimized, replace if possible
                        parents = parents.concat(father, this.getParents(father));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (found_1_1 && !found_1_1.done && (_a = found_1.return)) _a.call(found_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return parents;
        };
        /**
         * @returns true if the current section is nested in the previous section
         */
        ResourcesProviderBase.isNestedToPrevious = function (currentName, previousName) {
            if (currentName === undefined || previousName === undefined) {
                return false;
            }
            return ResourcesProviderBase.getParents(currentName).includes(previousName);
        };
        /**
         * Tests if the provided setting complete or not
         * @param setting the setting to test
         * @returns true, if setting is complete, false otherwise
         */
        ResourcesProviderBase.isCompleteSetting = function (setting) {
            return setting !== undefined &&
                setting.displayName !== undefined &&
                setting.type !== undefined &&
                setting.example !== undefined;
        };
        /**
         * Clears the passed argument and looks for a setting with the same name
         * @param name name of the wanted setting
         * @param range TextRange of the setting in text.
         * @returns the wanted setting or undefined if not found
         */
        ResourcesProviderBase.prototype.getSetting = function (name, range) {
            var clearedName = Setting.clearSetting(name);
            var defaultSetting = this.settingsMap.get(clearedName);
            if (defaultSetting === undefined) {
                return undefined;
            }
            var setting = new Setting(defaultSetting);
            if (range) {
                setting.textRange = range;
            }
            return setting;
        };
        /**
         * @returns map of settings, key is the setting name, value is instance of Setting
         */
        ResourcesProviderBase.prototype.createSettingsMap = function () {
            var e_2, _a;
            var descriptions = this.readDescriptions();
            var settings = this.readSettings();
            var map = new Map();
            try {
                for (var settings_1 = __values(settings), settings_1_1 = settings_1.next(); !settings_1_1.done; settings_1_1 = settings_1.next()) {
                    var setting = settings_1_1.value;
                    if (ResourcesProviderBase.isCompleteSetting(setting)) {
                        var name = Setting.clearSetting(setting.displayName);
                        Object.assign(setting, { name: name, description: descriptions.get(name) });
                        var completeSetting = new Setting(setting);
                        map.set(completeSetting.name, completeSetting);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (settings_1_1 && !settings_1_1.done && (_a = settings_1.return)) _a.call(settings_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return map;
        };
        ResourcesProviderBase.widgetRequirementsByType = new Map([
            ["console", {
                    sections: [],
                }],
            ["page", {
                    sections: [],
                }],
            ["property", {
                    sections: [
                        ["property"],
                    ],
                }],
            ["graph", {
                    sections: [
                        ["series", "node", "link"]
                    ],
                }],
        ]);
        /**
         * Key is section name, value is array of parent sections for the key section
         */
        ResourcesProviderBase.parentSections = new Map([
            ["widget", ["group", "configuration"]],
            ["series", ["widget", "link"]],
            ["tag", ["series"]],
            ["tags", ["series"]],
            ["column", ["widget"]],
            ["node", ["widget"]],
            ["link", ["widget"]],
            ["option", ["dropdown"]]
        ]);
        ResourcesProviderBase.sectionDepthMap = {
            "configuration": 0,
            "group": 1,
            "widget": 2,
            "column": 3,
            "dropdown": 3,
            "keys": 3,
            "link": 3,
            "node": 3,
            "other": 3,
            "placeholders": 3,
            "property": 3,
            "series": 3,
            "threshold": 3,
            "option": 4,
            "properties": 4,
            "tag": 4,
            "tags": 4,
        };
        /**
         * Contains names of sections which can appear at depth `1..max_depth`, where
         * `max_depth` is a value from `sectionDepthMap`
         */
        ResourcesProviderBase.inheritableSections = new Set([
            "keys", "tags"
        ]);
        return ResourcesProviderBase;
    }());

    /**
     * Stores config lines as array, removes comments.
     */
    var Config = /** @class */ (function () {
        function Config(text) {
            this.currentLineNumber = -1;
            this.lines = Util.deleteComments(text)
                .toLowerCase()
                .split("\n");
        }
        Config.prototype.getCurrentLine = function () {
            return this.currentLine;
        };
        /**
         * Returns lowercased config line with specified index.
         *
         * @param line - Index of line to be returned
         * @returns Lowercased line of config with index equal to `line`
         */
        Config.prototype.getLine = function (line) {
            return (line < this.lines.length && line >= 0) ? this.lines[line] : null;
        };
        Config.prototype[Symbol.iterator] = function () {
            var _a, _b, line, e_1_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.lines), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        line = _b.value;
                        this.currentLine = line;
                        this.currentLineNumber++;
                        return [4 /*yield*/, line];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        };
        return Config;
    }());

    /**
     * ConfigTree node.
     */
    var Section = /** @class */ (function () {
        /**
         * @param range - The text (name of section) and the position of the text
         * @param settings - Section settings
         */
        function Section(range, settings) {
            this.children = [];
            this.scope = {};
            this.range = range;
            this.name = range.text;
            this.settings = settings;
        }
        Section.prototype.applyScope = function () {
            var e_1, _a;
            if (this.parent !== undefined) {
                /**
                 * We are not at [configuration].
                 */
                this.scope = Object.create(this.parent.scope);
            }
            try {
                for (var _b = __values(this.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var setting = _c.value;
                    if (setting.name === "type") {
                        this.scope.widgetType = setting.value;
                    }
                    else if (setting.name === "mode") {
                        this.scope.mode = setting.value;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Returns setting from this section by it's displayName.
         *
         * @param name - Setting.displayName
         * @returns Setting with displayname equal to `settingName`
         */
        Section.prototype.getSetting = function (name) {
            var cleared = Setting.clearSetting(name);
            return this.settings.find(function (s) { return s.name === cleared; });
        };
        /**
         * Searches setting in the tree by it's displayName,
         * starting from the current section and ending root, returns the closest one.
         *
         * @param settingName - Setting.displayName
         * @returns Setting with displayname equal to `settingName`
         */
        Section.prototype.getSettingFromTree = function (settingName) {
            var currentSection = this;
            while (currentSection) {
                var value = currentSection.getSetting(settingName);
                if (value !== void 0) {
                    return value;
                }
                currentSection = currentSection.parent;
            }
            return undefined;
        };
        Section.prototype.getScopeValue = function (settingName) {
            return settingName === "type" ? this.scope.widgetType : this.scope.mode;
        };
        /**
         * Returns true if section passes all of conditions, otherwise returns false.
         *
         * @param conditions - Array of conditions, for which section must be checked
         * @returns Result of `conditions` checks.
         */
        Section.prototype.matchesConditions = function (conditions) {
            var e_2, _a;
            var section = this;
            if (conditions === undefined) {
                return true;
            }
            try {
                for (var conditions_1 = __values(conditions), conditions_1_1 = conditions_1.next(); !conditions_1_1.done; conditions_1_1 = conditions_1.next()) {
                    var condition = conditions_1_1.value;
                    var currCondition = condition(section);
                    if (!currCondition) {
                        return false;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (conditions_1_1 && !conditions_1_1.done && (_a = conditions_1.return)) _a.call(conditions_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return true;
        };
        return Section;
    }());

    /**
     * Stores sections with corresponding settings in tree order.
     */
    var ConfigTree = /** @class */ (function () {
        function ConfigTree() {
        }
        Object.defineProperty(ConfigTree.prototype, "getRoot", {
            get: function () {
                return this.root;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates Section object based on `range` and `settings`, applies scope to it and adds to tree.
         * Doesn't alert if the section is out of order, this check is performed by SectionStack.
         *
         * @param range - The text (name of section) and the position of the text
         * @param settings - Section settings
         */
        ConfigTree.prototype.addSection = function (range, settings) {
            var section = new Section(range, settings);
            var depth = ResourcesProviderBase.sectionDepthMap[range.text];
            if (depth > 0 && !this.root) {
                return;
            }
            switch (depth) {
                case 0: { // [configuration]
                    this.root = section;
                    this.lastAddedParent = section;
                    break;
                }
                case 1: { // [group]
                    section.parent = this.root;
                    this.lastAddedParent = section;
                    break;
                }
                case 2: { // [widget]
                    var group = this.root.children[this.root.children.length - 1];
                    if (!group) {
                        return;
                    }
                    section.parent = group;
                    this.lastAddedParent = section;
                    break;
                }
                case 3: { // [series], [dropdown], [column], ...
                    if (this.lastAddedParent && this.lastAddedParent.name === "column" && range.text === "series") {
                        section.parent = this.lastAddedParent;
                    }
                    else {
                        var group = this.root.children[this.root.children.length - 1];
                        if (!group) {
                            return;
                        }
                        var widget = group.children[group.children.length - 1];
                        if (!widget) {
                            return;
                        }
                        section.parent = widget;
                        this.lastAddedParent = section;
                    }
                    break;
                }
                case 4: { // [option], [properties], [tags]
                    if (ResourcesProviderBase.isNestedToPrevious(range.text, this.previous.name)) {
                        section.parent = this.previous;
                    }
                    else {
                        section.parent = this.lastAddedParent;
                    }
                    if (!section.parent) {
                        return;
                    }
                    break;
                }
            }
            if (section.parent) {
                // We are not in [configuration]
                section.parent.children.push(section);
            }
            this.previous = section;
            section.applyScope();
        };
        return ConfigTree;
    }());

    /**
     * Settings, that are frequently used in conditions checks,
     * see requiredSettings.ts and uselessSettings.ts.
     */
    var frequentlyUsed = ["mode", "type"];
    /**
     * Returns value of setting with specified displayName:
     *  a) if setting is frequently used, tries to get it from section's scope;
     *  b) otherwise searches setting in tree
     *  c) if there is no setting in tree, returns default value.
     *
     * @param settingName - Name of setting, which value is requisted
     * @param section - Start section, from which setting must be searched
     * @returns Value of Setting with name `settingName`.
     */
    function getValueOfCheckedSetting(settingName, section) {
        var value;
        if (frequentlyUsed.includes(settingName)) {
            value = section.getScopeValue(settingName);
        }
        else {
            var setting = section.getSettingFromTree(settingName);
            if (setting === undefined) {
                /**
                 * Setting is not declared, thus loooking for default value.
                 */
                setting = LanguageService.getResourcesProvider().getSetting(settingName);
                if (setting !== undefined) {
                    value = setting.defaultValue;
                }
            }
            else {
                value = setting.value;
            }
        }
        return value;
    }
    /**
     * Returns function, which validates value of specified setting.
     *
     * @param settingName - Name of the setting
     * @param possibleValues  - Values that can be assigned to the setting
     * @returns The function, which checks that value of setting with name `settingName` is any of `possibleValues`
     */
    function requiredCondition(settingName, possibleValues) {
        return function (section) {
            var value = getValueOfCheckedSetting(settingName, section);
            return value ? new RegExp(possibleValues.join("|")).test(value.toString()) : true;
        };
    }
    /**
     * Returns function, which validates value of specified setting and generates string
     * with allowed values if check is not passed.
     *
     * @param settingName - Name of the setting
     * @param possibleValues - Values that can be assigned to the setting
     * @returns The function, which checks that value of setting with name `settingName` is any of `possibleValues`
     *          and generates info string if check is not passed
     */
    function isNotUselessIf(settingName, possibleValues) {
        return function (section) {
            var value = getValueOfCheckedSetting(settingName, section);
            var valueIsOk = value ? new RegExp(possibleValues.join("|")).test(value.toString()) : true;
            if (!valueIsOk) {
                if (possibleValues.length > 1) {
                    return settingName + " is one of " + possibleValues.join(", ");
                }
                else {
                    return settingName + " is " + possibleValues[0];
                }
            }
            return null;
        };
    }

    /**
     * If key is declared in the section and the section doesn't match any of conditions, then key is useless.
     */
    var checks = new Map([
        [
            "forecast-arima-auto-regression-interval", [
                /**
                 * If "type!=chart" OR "forecast-arima-auto=true",
                 * setting "forecast-arima-auto-regression-interval" is useless.
                 */
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-arima-auto", ["false"])
            ]
        ],
        [
            "forecast-arima-d", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-arima-auto", ["false"])
            ]
        ],
        [
            "forecast-arima-p", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-arima-auto", ["false"])
            ]
        ],
        [
            "forecast-hw-alpha", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-hw-auto", ["false"])
            ]
        ],
        [
            "forecast-hw-beta", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-hw-auto", ["false"])
            ]
        ],
        [
            "forecast-hw-gamma", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("forecast-hw-auto", ["false"])
            ]
        ]
    ]);

    /**
     * If key is declared in the section and the section doesn't match any of conditions, then key is useless.
     */
    var checks$1 = new Map([
        [
            "negative-style",
            /**
             * If "type!=chart" OR "mode" is NOT "column-stack" or "column",
             * settings "negative-style" and "current-period-style" are useless.
             */
            [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("mode", ["column-stack", "column"])
            ]
        ],
        [
            "current-period-style", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("mode", ["column-stack", "column"])
            ]
        ],
        [
            "moving-average", [
                isNotUselessIf("type", ["chart"]),
                isNotUselessIf("server-aggregate", ["false"])
            ]
        ],
        [
            "ticks", [
                isNotUselessIf("type", ["calendar", "treemap", "gauge"]),
                isNotUselessIf("mode", ["half", "default"])
            ]
        ],
        [
            "color-range", [
                isNotUselessIf("type", ["calendar", "treemap", "gauge"]),
                isNotUselessIf("mode", ["half", "default"])
            ]
        ],
        [
            "gradient-count", [
                isNotUselessIf("type", ["calendar", "treemap", "gauge"]),
                isNotUselessIf("mode", ["half", "default"])
            ]
        ]
    ]);

    function getRule(checksMap) {
        return function (section) {
            var diagnostics = [];
            checksMap.forEach(function (conditions, dependent) {
                var dependentSetting = section.getSettingFromTree(dependent);
                if (dependentSetting === undefined) {
                    return;
                }
                var msg = conditions.map(function (condition) { return condition(section); }).filter(function (m) { return m; });
                if (msg.length > 0) {
                    diagnostics.push(Util.createDiagnostic(dependentSetting.textRange, uselessScope(dependentSetting.displayName, "" + msg.join(", ")), vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
                }
            });
            return diagnostics;
        };
    }
    var noUselessSettingsForWidget = {
        check: getRule(checks$1),
        name: "Checks absence of useless settings in [widget]"
    };
    var noUselessSettingsForSeries = {
        check: getRule(checks),
        name: "Checks absence of useless settings in [series]"
    };

    /**
     * If key (dependent) is declared in the section and the section matches all of conditions, then:
     *   a) setting, specified in `requiredSetting` is required for this section;
     *      or
     *   b) required at least one setting from `requiredSetting` array.
     * If `conditions` are null, suppose the section matches conditions.
     */
    var checks$2 = new Map([
        [
            "colors", {
                /**
                 * If "colors" is specified:
                 *  1) check that:
                 *      1) "type" is "calendar", "treemap " or "gauge";
                 *      2) "mode" is "half" or "default";
                 *  2) require "thresholds" (try to search in tree and create Diagnostic if neccessary).
                 */
                conditions: [
                    requiredCondition("type", ["calendar", "treemap", "gauge"]),
                    requiredCondition("mode", ["half", "default"])
                ],
                requiredSetting: "thresholds"
            }
        ],
        [
            "forecast-style", {
                conditions: [
                    requiredCondition("type", ["chart"]),
                    requiredCondition("mode", ["column", "column-stack"])
                ],
                requiredSetting: "data-type"
            }
        ],
        [
            "forecast-horizon-start-time", {
                /**
                 * If "forecast-horizon-start-time" is specified:
                 *  1) check that "type" is "chart";
                 *  2) require any of "forecast-horizon-end-time", "forecast-horizon-interval", "forecast-horizon-length".
                 */
                conditions: [
                    requiredCondition("type", ["chart"])
                ],
                requiredSetting: ["forecast-horizon-end-time", "forecast-horizon-interval", "forecast-horizon-length"]
            }
        ],
        [
            "table", {
                /**
                 * If "table" is specified, require "attribute".
                 */
                requiredSetting: "attribute"
            }
        ],
        [
            "attribute", {
                requiredSetting: "table"
            }
        ],
        [
            "column-alert-style", {
                conditions: [
                    requiredCondition("type", ["bar"])
                ],
                requiredSetting: "column-alert-expression"
            }
        ],
        [
            "alert-style", {
                requiredSetting: "alert-expression"
            }
        ],
        [
            "link-alert-style", {
                conditions: [
                    requiredCondition("type", ["graph"])
                ],
                requiredSetting: "alert-expression"
            }
        ],
        [
            "node-alert-style", {
                conditions: [
                    requiredCondition("type", ["graph"])
                ],
                requiredSetting: "alert-expression"
            }
        ],
        [
            "icon-alert-style", {
                conditions: [
                    requiredCondition("type", ["pie", "text"])
                ],
                requiredSetting: "icon-alert-expression"
            }
        ],
        [
            "icon-alert-expression", {
                conditions: [
                    requiredCondition("type", ["pie"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-color", {
                conditions: [
                    requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-position", {
                conditions: [
                    requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "icon-size", {
                conditions: [
                    requiredCondition("type", ["text"])
                ],
                requiredSetting: "icon"
            }
        ],
        [
            "caption-style", {
                conditions: [
                    requiredCondition("type", ["pie", "gauge"])
                ],
                requiredSetting: "caption"
            }
        ]
    ]);
    var rule = {
        name: "Checks presence of required setting if dependent is specified",
        check: function (section) {
            var diagnostics = [];
            checks$2.forEach(function (requirement, dependent) {
                var e_1, _a;
                if (!section.matchesConditions(requirement.conditions)) {
                    return;
                }
                var dependentSetting = section.getSettingFromTree(dependent);
                if (dependentSetting === undefined) {
                    return;
                }
                var reqNames = requirement.requiredSetting;
                var required;
                var msg;
                if (Array.isArray(reqNames)) {
                    try {
                        for (var reqNames_1 = __values(reqNames), reqNames_1_1 = reqNames_1.next(); !reqNames_1_1.done; reqNames_1_1 = reqNames_1.next()) {
                            var displayName = reqNames_1_1.value;
                            required = section.getSettingFromTree(displayName);
                            if (required) {
                                break;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (reqNames_1_1 && !reqNames_1_1.done && (_a = reqNames_1.return)) _a.call(reqNames_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    msg = noRequiredSettings(dependent, reqNames);
                }
                else {
                    required = section.getSettingFromTree(reqNames);
                    msg = noRequiredSetting(dependent, reqNames);
                }
                if (required === undefined) {
                    diagnostics.push(Util.createDiagnostic(section.range.range, msg));
                }
            });
            return diagnostics;
        }
    };

    var rule$1 = {
        name: "Checks colors is less than thresholds by 1",
        check: function (section) {
            var colorsValues;
            var thresholdsValues;
            if (!section.matchesConditions([
                requiredCondition("type", ["calendar", "treemap", "gauge"]),
                requiredCondition("mode", ["half", "default"])
            ])) {
                return;
            }
            var colorsSetting = section.getSettingFromTree("colors");
            if (colorsSetting === undefined) {
                return;
            }
            var thresholdsSetting = section.getSettingFromTree("thresholds");
            if (thresholdsSetting === undefined) {
                return Util.createDiagnostic(section.range.range, "thresholds is required if colors is specified");
            }
            if (colorsSetting.values.length > 0) {
                colorsSetting.values.push(colorsSetting.value);
                colorsValues = colorsSetting.values;
            }
            else {
                /**
                 * Converts 1) -> 2):
                 * 1) colors = rgb(247,251,255), rgb(222,235,247), rgb(198,219,239)
                 * 2) colors = rgb, rgb, rgb
                 */
                colorsValues = colorsSetting.value.replace(/(\s*\d{3}\s*,?)/g, "");
                colorsValues = colorsValues.split(",").filter(function (s) { return s.trim() !== ""; });
            }
            if (thresholdsSetting.values.length > 0) {
                thresholdsSetting.values.push(thresholdsSetting.value);
                thresholdsValues = thresholdsSetting.values;
            }
            else {
                thresholdsValues = thresholdsSetting.value.split(",").filter(function (s) { return s.trim() !== ""; });
            }
            var expected = thresholdsValues.length - 1;
            if (colorsValues.length !== expected) {
                return Util.createDiagnostic(colorsSetting.textRange, incorrectColors("" + colorsValues.length, "" + expected));
            }
        }
    };

    var rule$2 = {
        name: "Checks forecast-ssa-group-auto-count is greater than forecast-ssa-decompose-eigentriple-limit",
        check: function (section) {
            var groupAutoCount = section.getSettingFromTree("forecast-ssa-group-auto-count");
            if (groupAutoCount === undefined) {
                return;
            }
            var forecastLimit = section.getSettingFromTree("forecast-ssa-decompose-eigentriple-limit");
            var eigentripleLimitValue = forecastLimit ?
                forecastLimit.value : LanguageService.getResourcesProvider().getSetting("forecast-ssa-decompose-eigentriple-limit").defaultValue;
            if (eigentripleLimitValue <= groupAutoCount.value) {
                return Util.createDiagnostic(groupAutoCount.textRange, "forecast-ssa-group-auto-count " +
                    "must be less than forecast-ssa-decompose-eigentriple-limit (default 0)");
            }
        }
    };

    var rule$3 = {
        name: "Checks forecast-horizon-end-time is greater than end-time",
        check: function (section) {
            var forecast = section.getSettingFromTree("forecast-horizon-end-time");
            if (forecast === undefined) {
                return;
            }
            var end = section.getSettingFromTree("end-time");
            if (end === undefined) {
                return;
            }
            if (end.value >= forecast.value) {
                return Util.createDiagnostic(end.textRange, forecast.displayName + " must be greater than " + end.displayName, vscodeLanguageserverTypes.DiagnosticSeverity.Error);
            }
        }
    };

    var rule$4 = {
        name: "Checks start-time is greater than end-time",
        check: function (section) {
            var end = section.getSettingFromTree("end-time");
            var start = section.getSettingFromTree("start-time");
            if (end === undefined || start === undefined) {
                return;
            }
            if (start.value >= end.value) {
                return Util.createDiagnostic(end.textRange, end.displayName + " must be greater than " + start.displayName, vscodeLanguageserverTypes.DiagnosticSeverity.Error);
            }
        }
    };

    var rulesBySection = new Map([
        [
            "series", [
                rule$1,
                rule$3,
                rule$2,
                rule,
                noUselessSettingsForSeries
            ]
        ],
        [
            "widget", [
                rule$4,
                noUselessSettingsForWidget
            ]
        ]
    ]);

    var ConfigTreeValidator = /** @class */ (function () {
        function ConfigTreeValidator() {
        }
        /**
         * Goes through validationRules and performs checks on corresponding sections.
         *
         * @param сonfigTree - Configuration tree
         * @returns Diagnosics about problems in sections
         */
        ConfigTreeValidator.validate = function (сonfigTree) {
            var walker = new ConfigTreeWalker(сonfigTree);
            var diagnostics = [];
            rulesBySection.forEach(function (rulesForSection, sectionName) {
                var sectionsToCheck = walker.getSectionsByName(sectionName);
                if (sectionsToCheck.length > 0) {
                    sectionsToCheck.forEach(function (section) {
                        rulesForSection.forEach(function (rule) {
                            var diag = rule.check(section);
                            if (diag) {
                                if (Array.isArray(diag)) {
                                    diagnostics.push.apply(diagnostics, __spread(diag));
                                }
                                else {
                                    diagnostics.push(diag);
                                }
                            }
                        });
                    });
                }
            });
            return diagnostics;
        };
        return ConfigTreeValidator;
    }());
    // tslint:disable-next-line:max-classes-per-file
    var ConfigTreeWalker = /** @class */ (function () {
        function ConfigTreeWalker(сonfigTree) {
            this.requestedSections = [];
            this.tree = сonfigTree;
        }
        /**
         * Triggers bypass of ConfigTree and returns array with specified sections.
         *
         * @param sectionName - Name of sections to be returned
         * @returns Array of sections with name `sectionName`
         */
        ConfigTreeWalker.prototype.getSectionsByName = function (sectionName) {
            if (this.tree.getRoot) {
                this.walk(sectionName, this.tree.getRoot);
            }
            return this.requestedSections;
        };
        /**
         * Recursively bypasses the ConfigTree starting from `startsection` and
         * adds every section with name `targetSection` to the `requestedSections` array.
         *
         * @param targetSection - Name of sections to be added to `requestedSections` array
         * @param startSection - Section, from which the walk must begin
         */
        ConfigTreeWalker.prototype.walk = function (targetSection, startSection) {
            var e_1, _a;
            try {
                for (var _b = __values(startSection.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var section = _c.value;
                    if (section.name === targetSection) {
                        this.requestedSections.push(section);
                    }
                    else {
                        this.walk(targetSection, section);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        return ConfigTreeWalker;
    }());

    var KeywordHandler = /** @class */ (function () {
        function KeywordHandler(keywordsStack) {
            this.diagnostics = [];
            this.keywordsStack = keywordsStack;
        }
        KeywordHandler.prototype.handleSql = function (line, foundKeyword) {
            if (ONE_LINE_SQL.test(line)) {
                return;
            }
            this.keywordsStack.push(foundKeyword);
            var match = BLOCK_SQL_START_WITHOUT_LF.exec(line);
            if (match !== null) {
                this.diagnostics.push(Util.createDiagnostic(Util.createRange(match[1].length, "sql".length, foundKeyword.range.start.line), lineFeedRequired("sql")));
            }
        };
        /**
         * Checks `if` condition syntax
         */
        KeywordHandler.prototype.handleIf = function (line, foundKeyword) {
            var ifConditionRegex = /^[\s].*if\s*(.*)/;
            var ifCondition = ifConditionRegex.exec(line)[1];
            if (ifCondition.trim() === "") {
                this.diagnostics.push(Util.createDiagnostic(foundKeyword.range, "If condition can not be empty"));
                return;
            }
            try {
                Function("return " + ifCondition);
            }
            catch (err) {
                this.diagnostics.push(Util.createDiagnostic(Util.createRange(line.indexOf(ifCondition), ifCondition.length, foundKeyword.range.start.line), err.message));
            }
        };
        KeywordHandler.prototype.handleScript = function (line, foundKeyword) {
            if (ONE_LINE_SCRIPT.test(line)) {
                return;
            }
            this.keywordsStack.push(foundKeyword);
            var match = BLOCK_SCRIPT_START_WITHOUT_LF.exec(line);
            if (match !== null) {
                this.diagnostics.push(Util.createDiagnostic(Util.createRange(match[1].length, "script".length, foundKeyword.range.start.line), lineFeedRequired("script")));
            }
        };
        return KeywordHandler;
    }());

    var _a;
    var SectionStackNode = /** @class */ (function () {
        function SectionStackNode(range) {
            this.range = range;
            this.dependencies = [];
            this.settings = [];
            var settingsMap = LanguageService.getResourcesProvider().settingsMap;
            var deps = ResourcesProviderBase.getRequiredSectionSettingsMap(settingsMap).get(this.name);
            if (deps && deps.sections) {
                this.setRequiredSections(deps.sections);
            }
        }
        SectionStackNode.prototype.setRequiredSections = function (sections) {
            var e_1, _a;
            this.dependencies.splice(0, this.dependencies.length);
            try {
                for (var sections_1 = __values(sections), sections_1_1 = sections_1.next(); !sections_1_1.done; sections_1_1 = sections_1.next()) {
                    var option = sections_1_1.value;
                    this.dependencies.push({
                        resolvedCount: 0,
                        unresolved: option.slice(),
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (sections_1_1 && !sections_1_1.done && (_a = sections_1.return)) _a.call(sections_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        SectionStackNode.prototype.insertSetting = function (setting) {
            this.settings.push(setting);
        };
        SectionStackNode.prototype.getSetting = function (name) {
            var cleared = Setting.clearSetting(name);
            return this.settings.find(function (s) { return s.name === cleared; });
        };
        /**
         * Remove section from dependency list for every dependency option
         * @param name name of incoming section
         */
        SectionStackNode.prototype.resolveDependency = function (name) {
            var e_2, _a;
            try {
                for (var _b = __values(this.dependencies), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var option = _c.value;
                    var index = option.unresolved.indexOf(name);
                    if (index >= 0) {
                        option.resolvedCount++;
                        option.unresolved.splice(index, 1);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        Object.defineProperty(SectionStackNode.prototype, "dependenciesResolved", {
            /**
             * True if dependencies for any dependency option are resolved
             */
            get: function () {
                if (this.dependencies.length === 0) {
                    return true;
                }
                return this.dependencies.some(function (deps) { return deps.unresolved.length === 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SectionStackNode.prototype, "name", {
            /**
             * A name of underlying section
             */
            get: function () {
                return this.range.text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SectionStackNode.prototype, "unresolved", {
            /**
             * A list of unresolved dependencies for section. If several options for
             * dependency list provisioned, return best of them. The best option is
             * an option with max number of resolved dependencies and min length of
             * unresolved.
             */
            get: function () {
                if (this.dependencies.length === 0) {
                    return [];
                }
                var bestDependencyOption = this.dependencies
                    .reduce(function (best, dep) {
                    if (dep.resolvedCount > best.resolvedCount) {
                        return dep;
                    }
                    if (dep.unresolved.length < best.unresolved.length) {
                        return dep;
                    }
                    return best;
                });
                return bestDependencyOption.unresolved;
            },
            enumerable: true,
            configurable: true
        });
        return SectionStackNode;
    }());
    /**
     * A null object to prevent multiple errors on missing root section
     */
    var DummySectionStackNode = (_a = {
            dependencies: [],
            dependenciesResolved: true,
            name: "",
            range: new TextRange("", vscodeLanguageserverTypes.Range.create(vscodeLanguageserverTypes.Position.create(0, 0), vscodeLanguageserverTypes.Position.create(0, 0))),
            settings: [],
            unresolved: [],
            resolveDependency: function () { },
            setRequiredSections: function () { },
            getSetting: function () { return undefined; },
            insertSetting: function () { }
        },
        _a[Symbol.toStringTag] = "DummySectionStackNode",
        _a);
    // tslint:disable-next-line:max-classes-per-file
    var SectionStack = /** @class */ (function () {
        function SectionStack() {
            this.stack = [];
        }
        SectionStack.prototype.insertSection = function (section) {
            var e_3, _a;
            var sectionName = section.text;
            var _b = __read(this.checkAndGetDepth(section), 2), depth = _b[0], error = _b[1];
            if (depth < this.stack.length) {
                if (depth === 0) {
                    // We are attempting to declare [configuration] twice
                    return this.createErrorDiagnostic(section, "Unexpected section [" + sectionName + "].");
                }
                // Pop stack, check dependencies of popped resolved
                error = this.checkDependenciesResolved(depth);
                this.stack.splice(depth, this.stack.length - depth);
            }
            for (var i = this.stack.length; i < depth; i++) {
                this.stack.push(DummySectionStackNode);
            }
            try {
                for (var _c = __values(this.stack), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var entry = _d.value;
                    entry.resolveDependency(sectionName);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.stack.push(new SectionStackNode(section));
            return error;
        };
        SectionStack.prototype.getLastSection = function () {
            return this.stack[this.stack.length - 1];
        };
        SectionStack.prototype.finalize = function () {
            var err = this.checkDependenciesResolved(0);
            this.stack = [];
            return err;
        };
        SectionStack.prototype.requireSections = function (targetSection) {
            var e_4, _a, e_5, _b;
            var sections = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sections[_i - 1] = arguments[_i];
            }
            var target = this.stack.find(function (s) { return s.name === targetSection; });
            if (target) {
                try {
                    for (var _c = __values(target.dependencies), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var dep = _d.value;
                        try {
                            for (var sections_2 = (e_5 = void 0, __values(sections)), sections_2_1 = sections_2.next(); !sections_2_1.done; sections_2_1 = sections_2.next()) {
                                var section = sections_2_1.value;
                                if (!dep.unresolved.includes(section)) {
                                    dep.unresolved.push(section);
                                }
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (sections_2_1 && !sections_2_1.done && (_b = sections_2.return)) _b.call(sections_2);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                if (target.dependencies.length === 0) {
                    target.dependencies.push({
                        resolvedCount: 0,
                        unresolved: sections,
                    });
                }
            }
        };
        SectionStack.prototype.setSectionRequirements = function (targetSection, sections) {
            var target = this.stack.find(function (s) { return s.name === targetSection; });
            if (target) {
                target.setRequiredSections(sections);
            }
        };
        SectionStack.prototype.insertCurrentSetting = function (setting) {
            if (this.stack.length > 0) {
                var target = this.stack[this.stack.length - 1];
                target.insertSetting(setting);
            }
        };
        /**
         * Returns the setting by name.
         * @param name setting name
         * @param recursive if true searches setting in the whole stack and returns the closest one,
         * otherwise searches setting in the current section
         */
        SectionStack.prototype.getCurrentSetting = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var visitSectionCount = recursive ? this.stack.length : 1;
            for (var i = visitSectionCount; i > 0;) {
                var section = this.stack[--i];
                var value = section.getSetting(name);
                if (value !== void 0) {
                    return value;
                }
            }
            return undefined;
        };
        SectionStack.prototype.getSectionSettings = function (section, recursive) {
            var e_6, _a;
            if (recursive === void 0) { recursive = true; }
            var targetIdx = section ? this.stack.findIndex(function (s) { return s.name === section; }) : this.stack.length - 1;
            var result = [];
            if (targetIdx >= 0) {
                var start = recursive ? 0 : targetIdx;
                for (var i = start; i <= targetIdx; i++) {
                    var target = this.stack[i];
                    try {
                        for (var _b = (e_6 = void 0, __values(target.settings)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var setting = _c.value;
                            result.push(setting);
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
            return result;
        };
        SectionStack.prototype.getSectionRange = function (section) {
            var node = this.stack.find(function (s) { return s.name === section; });
            return node ? node.range : null;
        };
        SectionStack.prototype.createErrorDiagnostic = function (section, message) {
            return Util.createDiagnostic(section.range, message, vscodeLanguageserverTypes.DiagnosticSeverity.Error);
        };
        SectionStack.prototype.checkDependenciesResolved = function (startIndex) {
            var stack = this.stack;
            for (var i = stack.length; i > startIndex;) {
                var section = stack[--i];
                if (!section.dependenciesResolved) {
                    var unresolved = section.unresolved.map(function (s) { return "[" + s + "]"; });
                    var message = void 0;
                    if (unresolved.length > 1) {
                        message = "Required sections " + unresolved.join(", ") + " are not declared.";
                    }
                    else {
                        message = "Required section " + unresolved.join(", ") + " is not declared.";
                    }
                    return this.createErrorDiagnostic(section.range, message);
                }
            }
            return null;
        };
        SectionStack.prototype.checkAndGetDepth = function (sectionRange) {
            var section = sectionRange.text;
            var expectedDepth = this.stack.length;
            var actualDepth = ResourcesProviderBase.sectionDepthMap[section];
            var error = null;
            if (actualDepth == null) {
                error = this.createErrorDiagnostic(sectionRange, "Unknown section [" + section + "].");
            }
            else if (actualDepth > expectedDepth) {
                var canBeInherited = ResourcesProviderBase.inheritableSections.has(section);
                if (canBeInherited && expectedDepth > 0) {
                    actualDepth = expectedDepth;
                }
                else {
                    var errorMessage = "Unexpected section [" + section + "]. ";
                    var expectedSections = Object.entries(ResourcesProviderBase.sectionDepthMap)
                        .filter(function (_a) {
                        var _b = __read(_a, 2), depth = _b[1];
                        return depth === expectedDepth;
                    })
                        .map(function (_a) {
                        var _b = __read(_a, 1), key = _b[0];
                        return "[" + key + "]";
                    });
                    if (expectedSections.length > 1) {
                        errorMessage += "Expected one of " + expectedSections.join(", ") + ".";
                    }
                    else {
                        errorMessage += "Expected " + expectedSections[0] + ".";
                    }
                    error = this.createErrorDiagnostic(sectionRange, errorMessage);
                }
            }
            return [actualDepth, error];
        };
        return SectionStack;
    }());

    var placeholderContainingSettings = [
        "url", "urlparameters"
    ];
    /**
     * Performs validation of a whole document line by line.
     */
    var Validator = /** @class */ (function () {
        function Validator(text) {
            /**
             * Array of declared aliases in the current widget
             */
            this.aliases = [];
            /**
             * Contains sections hierarchy from configuration
             */
            this.sectionStack = new SectionStack();
            /**
             * Array of settings declared in current section
             */
            this.currentSettings = [];
            /**
             * Array of de-aliases (value('alias')) in the current widget
             */
            this.deAliases = [];
            /**
             * Map of settings declared in if statement.
             * Key is line number and keyword. For example, "70if server == 'vps'", "29else".
             * Index is used to distinguish statements from each other
             */
            this.ifSettings = new Map();
            /**
             * Stack of nested keywords. For example, if can be included to a for.
             */
            this.keywordsStack = [];
            /**
             * Map of settings declared in parent sections. Keys are section names.
             */
            this.parentSettings = new Map();
            /**
             * Settings declared in the previous section
             */
            this.previousSettings = [];
            /**
             * Settings required to declare in the current section
             */
            this.requiredSettings = [];
            /**
             * Validation result
             */
            this.result = [];
            /**
             * Map of settings in the current widget and their values
             */
            this.settingValues = new Map();
            /**
             * Map of defined variables, where key is type (for, var, csv...)
             */
            this.variables = new Map([
                ["freemarker", ["entity", "entities", "type"]],
            ]);
            /**
             * Line number of last "endif" keyword
             */
            this.lastEndIf = undefined;
            this.configTree = new ConfigTree();
            this.config = new Config(text);
            this.keywordHandler = new KeywordHandler(this.keywordsStack);
        }
        /**
         * Iterates over the document content line by line
         * @returns diagnostics for all found mistakes
         */
        Validator.prototype.lineByLine = function () {
            var e_1, _a, _b;
            try {
                for (var _c = __values(this.config), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var line = _d.value;
                    /**
                     * At the moment 'csv <name> from <url>' supports unclosed syntax
                     */
                    var canBeSingle = false;
                    if (CSV_KEYWORD_PATTERN.test(line)) {
                        canBeSingle = !CSV_INLINE_HEADER_PATTERN.test(line) && !CSV_NEXT_LINE_HEADER_PATTERN.test(line);
                    }
                    this.foundKeyword = TextRange.parse(line, this.config.currentLineNumber, canBeSingle);
                    if (this.isNotKeywordEnd("script") || this.isNotKeywordEnd("var") || this.isNotKeywordEnd("sql")) {
                        /**
                         * Lines in multiline script and var sections
                         * will be checked in JavaScriptValidator.processScript() and processVar().
                         * SQL-block must be skipped without any processing.
                         */
                        continue;
                    }
                    if (this.isNotKeywordEnd("csv")) {
                        this.validateCsv();
                    }
                    this.eachLine();
                    if (this.foundKeyword !== undefined) {
                        if (/\b(if|for|csv)\b/i.test(this.foundKeyword.text)) {
                            this.keywordsStack.push(this.foundKeyword);
                        }
                        this.switchKeyword();
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.checkAliases();
            this.diagnosticForLeftKeywords();
            this.checkRequredSettingsForSection();
            this.checkUrlPlaceholders();
            this.setSectionToStackAndTree(null);
            /**
             * Apply checks, which require walking through the ConfigTree.
             */
            var rulesDiagnostics = ConfigTreeValidator.validate(this.configTree);
            /**
             * Ugly hack. Removes duplicates from rulesDiagnostics.
             */
            rulesDiagnostics = __spread(rulesDiagnostics.reduce((function (allItems, item) { return allItems.has(item.range) ? allItems : allItems.set(item.range, item); }), new Map()).values());
            (_b = this.result).push.apply(_b, __spread(rulesDiagnostics));
            return this.result.concat(this.keywordHandler.diagnostics);
        };
        /**
         * Checks whether has the keyword ended or not
         * @param keyword keyword which is expected to end
         */
        Validator.prototype.isNotKeywordEnd = function (keyword) {
            return this.areWeIn(keyword) && (this.foundKeyword === undefined || this.foundKeyword.text !== "end" + keyword);
        };
        /**
         * Adds all current section setting to parent
         * if they're required by a section
         */
        Validator.prototype.addCurrentToParentSettings = function () {
            var e_2, _a;
            if (this.currentSection !== undefined) {
                try {
                    for (var _b = __values(this.currentSettings), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var setting = _c.value;
                        this.addToParentsSettings(this.currentSection.text, setting);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        };
        /**
         * Adds new entry to settingValue map and new Setting to SectionStack
         * based on this.match, also sets value for setting.
         * @param setting setting to which value will be set
         */
        Validator.prototype.addSettingValue = function (setting) {
            if (this.match == null) {
                throw new Error("Trying to add new entry to settingValues map and sectionStack based on undefined");
            }
            var value = Setting.clearValue(this.match[3]);
            setting.value = value;
            this.settingValues.set(setting.name, value);
        };
        /**
         * Adds a setting based on this.match to array
         * or creates a new diagnostic if setting is already present
         * @param array the target array
         * @returns the array containing the setting from this.match
         */
        Validator.prototype.addToSettingArray = function (variable, array) {
            var result = (array === undefined) ? [] : array;
            if (this.match == null) {
                return result;
            }
            var _a = __read(this.match, 3), indent = _a[1], name = _a[2];
            if (variable === undefined) {
                return result;
            }
            var declaredAbove = result.find(function (v) { return v.name === variable.name; });
            if (declaredAbove !== undefined) {
                var range = this.createRange(indent.length, name.length);
                this.result.push(Util.repetitionDiagnostic(range, declaredAbove, variable));
            }
            else {
                result.push(variable);
            }
            return result;
        };
        /**
         * Adds a setting based on this.match to the target map
         * or creates a new diagnostic if setting is already present
         * @param key the key, which value will contain the setting
         * @param setting which setting to add
         * @returns the map regardless was it modified or not
         */
        Validator.prototype.addToParentsSettings = function (key, setting) {
            var array = this.parentSettings.get(key);
            if (array === undefined) {
                array = [setting];
            }
            else {
                array.push(setting);
            }
            this.parentSettings.set(key, array);
        };
        /**
         * Adds a string based on this.match to the array
         * or creates a diagnostic if the string is already present
         * @param array  the target array
         * @returns the array regardless was it modified or not
         */
        Validator.prototype.addToStringArray = function (array) {
            var result = array;
            if (this.match == null) {
                return result;
            }
            var _a = __read(this.match, 3), indent = _a[1], variable = _a[2];
            if (array.includes(variable)) {
                this.result.push(Util.createDiagnostic(this.createRange(indent.length, variable.length), variable + " is already defined"));
            }
            else {
                result.push(variable);
            }
            return result;
        };
        /**
         * Adds a string based on this.match to a value of the provided key
         * @param map the target map
         * @param key the key which value will contain the setting
         * @returns the map regardless was it modified or not
         */
        Validator.prototype.addToStringMap = function (map, key) {
            if (this.match == null) {
                return map;
            }
            var _a = __read(this.match, 3), indent = _a[1], variable = _a[2];
            if (Util.isInMap(variable, map)) {
                var startPosition = this.match.index + indent.length;
                this.result.push(Util.createDiagnostic(this.createRange(startPosition, variable.length), variable + " is already defined"));
            }
            else {
                var array = map.get(key);
                if (array === undefined) {
                    array = [variable];
                }
                else {
                    array.push(variable);
                }
                map.set(key, array);
            }
            return map;
        };
        /**
         * Tests if keywordsStack contain the provided name or not
         * @param name the target keyword name
         * @return true, if stack contains the keyword, false otherwise
         */
        Validator.prototype.areWeIn = function (name) {
            return this.keywordsStack
                .some(function (textRange) { return textRange.text === name; });
        };
        /**
         * Checks that each de-alias has corresponding alias
         */
        Validator.prototype.checkAliases = function () {
            var _this = this;
            this.deAliases.forEach(function (deAlias) {
                if (!_this.aliases.includes(deAlias.text)) {
                    _this.result.push(Util.createDiagnostic(deAlias.range, unknownToken(deAlias.text)));
                }
            });
        };
        /**
         * Tests that user has finished a corresponding keyword
         * For instance, user can write "endfor" instead of "endif"
         * @param expectedEnd What the user has finished?
         */
        Validator.prototype.checkEnd = function (expectedEnd) {
            if (this.foundKeyword === undefined) {
                return;
            }
            var lastKeyword = this.getLastKeyword();
            if (lastKeyword === expectedEnd) {
                this.keywordsStack.pop();
                return;
            }
            if (!this.areWeIn(expectedEnd)) {
                this.result.push(Util.createDiagnostic(this.foundKeyword.range, noMatching(this.foundKeyword.text, expectedEnd)));
            }
            else {
                var index = this.keywordsStack.findIndex(function (keyword) { return keyword.text === expectedEnd; });
                this.keywordsStack.splice(index, 1);
                this.result.push(Util.createDiagnostic(this.foundKeyword.range, expectedEnd + " has finished before " + lastKeyword));
            }
        };
        /**
         * Check that the section does not contain settings
         * Which are excluded by the specified one
         * @param setting the specified setting
         */
        Validator.prototype.checkExcludes = function (setting) {
            var e_3, _a;
            if (this.match == null) {
                return;
            }
            var _b = __read(this.match, 3), indent = _b[1], name = _b[2];
            try {
                for (var _c = __values(this.currentSettings), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var item = _d.value;
                    if (setting.excludes.includes(item.displayName)) {
                        var range = this.createRange(indent.length, name.length);
                        this.result.push(Util.createDiagnostic(range, setting.displayName + " can not be specified simultaneously with " + item.displayName));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        Validator.prototype.checkFreemarker = function () {
            var line = this.config.getCurrentLine();
            this.match = /<\/?#.*?\/?>/.exec(line);
            if (this.match !== null) {
                this.result.push(Util.createDiagnostic(this.createRange(this.match.index, this.match[0].length), "Freemarker expressions are deprecated.\nUse a native collection: list, csv table, var object." +
                    "\nMigration examples are available at " +
                    "https://github.com/axibase/charts/blob/master/syntax/freemarker.md", vscodeLanguageserverTypes.DiagnosticSeverity.Information));
                this.match = /(as\s*(\S+)>)/.exec(line);
                if (this.match) {
                    this.addToStringArray(this.aliases);
                }
            }
        };
        /**
         * Creates diagnostics if the current section does not contain required settings.
         */
        Validator.prototype.checkRequredSettingsForSection = function () {
            var e_4, _a, e_5, _b, e_6, _c, e_7, _d, e_8, _e;
            if (this.currentSection === undefined) {
                return;
            }
            if (this.previousSection && /tag/i.test(this.currentSection.text)) {
                /**
                 * [tags] has finished, perform checks for parent section.
                 */
                this.currentSettings = this.previousSettings;
                this.currentSection = this.previousSection;
            }
            var settingsMap = LanguageService.getResourcesProvider().settingsMap;
            var sectionRequirements = ResourcesProviderBase.getRequiredSectionSettingsMap(settingsMap)
                .get(this.currentSection.text);
            if (!sectionRequirements) {
                return;
            }
            var required = sectionRequirements.settings;
            if (required !== undefined) {
                this.requiredSettings = required.concat(this.requiredSettings);
            }
            var notFound = [];
            try {
                required: for (var _f = __values(this.requiredSettings), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var options = _g.value;
                    var displayName = options[0].displayName;
                    if (displayName === "metric") {
                        var columnMetric = this.settingValues.get("columnmetric");
                        var columnValue = this.settingValues.get("columnvalue");
                        if (columnMetric === "null" && columnValue === "null") {
                            continue;
                        }
                        var changeField = this.settingValues.get("changefield");
                        if (/metric/.test(changeField)) {
                            continue;
                        }
                    }
                    var optionsNames = options.map(function (s) { return s.name; });
                    if (Util.isAnyInArray(optionsNames, this.currentSettings.map(function (s) { return s.name; }))) {
                        continue;
                    }
                    try {
                        for (var _h = (e_5 = void 0, __values(this.parentSettings.values())), _j = _h.next(); !_j.done; _j = _h.next()) {
                            var array = _j.value;
                            // Trying to find in this section parents
                            if (Util.isAnyInArray(optionsNames, array.map(function (s) { return s.name; }))) {
                                continue required;
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    if (this.ifSettings.size > 0) {
                        try {
                            for (var _k = (e_6 = void 0, __values(this.ifSettings.values())), _l = _k.next(); !_l.done; _l = _k.next()) {
                                var array = _l.value;
                                // Trying to find in each one of if-elseif-else... statement
                                if (!Util.isAnyInArray(optionsNames, array.map(function (s) { return s.name; }))) {
                                    notFound.push(displayName);
                                    continue required;
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        var curSectLine = this.currentSection.range.end.line;
                        var lastCondLine = parseInt(this.lastCondition.match(/^\d+/)[0], 10);
                        if ( // if-elseif-else statement inside the section
                        this.areWeIn("if") ||
                            // section inside the if-elseif-else statement
                            curSectLine < this.lastEndIf && curSectLine > lastCondLine) {
                            continue;
                        }
                        var ifCounter = 0;
                        var elseCounter = 0;
                        try {
                            for (var _m = (e_7 = void 0, __values(this.ifSettings.keys())), _o = _m.next(); !_o.done; _o = _m.next()) {
                                var statement = _o.value;
                                if (/\bif\b/.test(statement)) {
                                    ifCounter++;
                                }
                                else if (/\belse\b/.test(statement)) {
                                    elseCounter++;
                                }
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        if (ifCounter === elseCounter) {
                            continue;
                        }
                    }
                    notFound.push(displayName);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_4) throw e_4.error; }
            }
            try {
                for (var notFound_1 = __values(notFound), notFound_1_1 = notFound_1.next(); !notFound_1_1.done; notFound_1_1 = notFound_1.next()) {
                    var option = notFound_1_1.value;
                    this.result.push(Util.createDiagnostic(this.currentSection.range, option + " is required"));
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (notFound_1_1 && !notFound_1_1.done && (_e = notFound_1.return)) _e.call(notFound_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
            this.requiredSettings.splice(0, this.requiredSettings.length);
        };
        /**
         * Creates a new diagnostic if the provided setting is defined
         * @param setting the setting to perform check
         */
        Validator.prototype.checkRepetition = function (setting) {
            if (this.match == null) {
                return;
            }
            var _a = __read(this.match, 3), indent = _a[1], name = _a[2];
            var range = this.createRange(indent.length, name.length);
            if (this.areWeIn("if")) {
                if (this.lastCondition === undefined) {
                    throw new Error("We are in if, but last condition is undefined");
                }
                var array = this.ifSettings.get(this.lastCondition);
                array = this.addToSettingArray(setting, array);
                this.ifSettings.set(this.lastCondition, array);
                var declaredAbove = this.currentSettings.find(function (v) { return v.name === setting.name; });
                if (declaredAbove !== undefined) {
                    // The setting was defined before if
                    this.result.push(Util.repetitionDiagnostic(range, declaredAbove, setting));
                    return;
                }
            }
            else {
                this.addToSettingArray(setting, this.currentSettings);
            }
            this.sectionStack.insertCurrentSetting(setting);
        };
        /**
         * Creates diagnostics for all unclosed keywords
         */
        Validator.prototype.diagnosticForLeftKeywords = function () {
            var e_9, _a;
            try {
                for (var _b = __values(this.keywordsStack), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var nestedConstruction = _c.value;
                    if (nestedConstruction.canBeUnclosed) {
                        continue;
                    }
                    this.result.push(Util.createDiagnostic(nestedConstruction.range, noMatching(nestedConstruction.text, "end" + nestedConstruction.text)));
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        /**
         * Handles every line in the document, calls corresponding functions
         */
        Validator.prototype.eachLine = function () {
            this.checkFreemarker();
            var line = this.config.getCurrentLine();
            this.match = /(^[\t ]*\[)(\w+)\][\t ]*/.exec(line);
            if ( // Section declaration, for example, [widget]
            this.match !== null ||
                /**
                 * We are in [tags] section and current line is empty - [tags] section has finished
                 */
                (line.trim().length === 0 && this.currentSection !== undefined && this.currentSection.text === "tags")) {
                // We met start of the next section, that means that current section has finished
                if (this.match !== null) {
                    this.spellingCheck();
                }
                this.handleSection();
            }
            else {
                this.match = /(^\s*)([a-z].*?[a-z])\s*=\s*(.*?)\s*$/.exec(line);
                if (this.match !== null) {
                    // Setting declaration, for example, width-units = 6.2
                    this.checkSettingsWhitespaces();
                    this.handleSettings();
                    if (this.areWeIn("for")) {
                        this.validateFor();
                    }
                }
                this.match = /(^\s*\[)(\w+)\s*$/.exec(line);
                if (this.match !== null) {
                    this.result.push(Util.createDiagnostic(this.createRange(this.match[1].length, this.match[2].length), "Section tag is unclosed"));
                }
            }
        };
        /**
         * Adds all de-aliases from the line to the corresponding array
         */
        Validator.prototype.findDeAliases = function () {
            var line = this.config.getCurrentLine();
            var regexp = /value\((['"])(\S+?)\1\)/g;
            var deAliasPosition = 2;
            var freemarkerExpr;
            var deAlias;
            this.match = regexp.exec(line);
            while (this.match !== null) {
                deAlias = this.match[deAliasPosition];
                freemarkerExpr = /(\$\{(\S+)\})/.exec(deAlias);
                if (freemarkerExpr) {
                    // extract "lpar" from value('${lpar}PX')
                    deAlias = freemarkerExpr[deAliasPosition];
                }
                this.deAliases.push(new TextRange(deAlias, this.createRange(line.indexOf(deAlias), deAlias.length)));
                this.match = regexp.exec(line);
            }
        };
        /**
         * Returns the keyword from the top of keywords stack without removing it
         * @returns the keyword which is on the top of keywords stack
         */
        Validator.prototype.getLastKeyword = function () {
            if (this.keywordsStack.length === 0) {
                return undefined;
            }
            var stackHead = this.keywordsStack[this.keywordsStack.length - 1];
            return stackHead.text;
        };
        /**
         * Creates a diagnostic about unknown setting name or returns the setting
         * @returns undefined if setting is unknown, setting otherwise
         */
        Validator.prototype.getSettingCheck = function () {
            if (this.match == null) {
                return undefined;
            }
            var settingName = this.match[2];
            var setting = this.getSetting(settingName);
            if (setting === undefined) {
                if (/column-/.test(settingName)) {
                    return undefined;
                }
                if (TextRange.KEYWORD_REGEXP.test(settingName)) {
                    return undefined;
                }
                if (this.currentSection !== undefined && (this.currentSection.text === "placeholders" ||
                    this.currentSection.text === "properties")) {
                    /**
                     * Return Setting instead of undefined because SectionStack.getSectionSettings(),
                     * which is used in checkUrlPlaceholders(), returns Setting[] instead of Map<string, any>
                     */
                    setting = new Setting(new DefaultSetting());
                    Object.assign(setting, { name: settingName, section: this.currentSection.text });
                    return setting;
                }
                var message = unknownToken(settingName);
                this.result.push(Util.createDiagnostic(this.createRange(this.match[1].length, settingName.length), message));
                return undefined;
            }
            setting = setting.applyScope({
                section: this.currentSection ? this.currentSection.text.trim() : "",
                widget: this.currentWidget || "",
            });
            return setting;
        };
        /**
         * Calculates the number of columns in the found csv header
         */
        Validator.prototype.handleCsv = function () {
            var line = this.config.getCurrentLine();
            var header = null;
            if (CSV_INLINE_HEADER_PATTERN.exec(line)) {
                var j = this.config.currentLineNumber + 1;
                header = this.config.getLine(j);
                while (header !== null && BLANK_LINE_PATTERN.test(header)) {
                    header = this.config.getLine(++j);
                }
            }
            else {
                var match = CSV_NEXT_LINE_HEADER_PATTERN.exec(line) || CSV_FROM_URL_PATTERN.exec(line);
                if (match !== null) {
                    this.match = match;
                    header = line.substring(this.match.index + 1);
                }
                else {
                    this.result.push(Util.createDiagnostic(this.foundKeyword.range, getCsvErrorMessage(line)));
                }
            }
            this.addToStringMap(this.variables, "csvNames");
            this.csvColumns = (header === null) ? 0 : Util.countCsvColumns(header);
        };
        /**
         * Creates a diagnostic if `else` is found, but `if` is not
         * or `if` is not the last keyword
         */
        Validator.prototype.handleElse = function () {
            if (this.foundKeyword === undefined) {
                throw new Error("We're trying to handle 'else ', but foundKeyword is " + this.foundKeyword);
            }
            this.setLastCondition();
            var message;
            if (!this.areWeIn("if")) {
                message = noMatching(this.foundKeyword.text, "if");
            }
            else if (this.getLastKeyword() !== "if") {
                message = this.foundKeyword.text + " has started before " + this.getLastKeyword() + " has finished";
            }
            if (message !== undefined) {
                this.result.push(Util.createDiagnostic(this.foundKeyword.range, message));
            }
        };
        /**
         * Removes the variable from the last `for`
         */
        Validator.prototype.handleEndFor = function () {
            var forVariables = this.variables.get("forVariables");
            if (forVariables === undefined) {
                forVariables = [];
            }
            else {
                forVariables.pop();
            }
            this.variables.set("forVariables", forVariables);
        };
        /**
         * Creates diagnostics related to `for ... in _here_` statements
         * Like "for srv in servers", but "servers" is not defined
         * Also adds the new `for` variable to the corresponding map
         */
        Validator.prototype.handleFor = function () {
            var e_10, _a;
            var line = this.config.getCurrentLine();
            // groups are used in addToStringMap
            this.match = /(^\s*for\s+)(\w+)\s+in\s*/m.exec(line);
            if (this.match != null) {
                var collection = line.substring(this.match[0].length).trim();
                if (collection !== "") {
                    var regs = [
                        /^Object\.keys\((\w+)(?:\.\w+)*\)$/i,
                        /^(\w+)\.values\((["'])\w+\2\)$/i,
                        /^(\w+)(\[\d+\])*$/i // apps, apps[1]
                    ];
                    var varName = void 0;
                    try {
                        for (var regs_1 = __values(regs), regs_1_1 = regs_1.next(); !regs_1_1.done; regs_1_1 = regs_1.next()) {
                            var regex = regs_1_1.value;
                            var matched = regex.exec(collection);
                            varName = matched ? matched[1] : null;
                            if (varName) {
                                break;
                            }
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (regs_1_1 && !regs_1_1.done && (_a = regs_1.return)) _a.call(regs_1);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                    if (!varName) {
                        try {
                            /**
                             * Check for inline declaration, for example:
                             * for widgetType in ['chart', 'calendar']
                             */
                            Function("return " + collection);
                        }
                        catch (err) {
                            var start = line.indexOf(collection);
                            this.result.push(Util.createDiagnostic(this.createRange(start, collection.length), "Incorrect collection declaration."));
                        }
                    }
                    else if (!Util.isInMap(varName, this.variables)) {
                        var message = unknownToken(varName);
                        var start = line.lastIndexOf(varName);
                        this.result.push(Util.createDiagnostic(this.createRange(start, varName.length), message));
                    }
                }
                else {
                    var start = this.match[0].indexOf("in");
                    this.result.push(Util.createDiagnostic(this.createRange(start, "in".length), "Empty 'in' statement"));
                }
                this.addToStringMap(this.variables, "forVariables");
            }
        };
        /**
         * Adds new variable to corresponding map,
         * Pushes a new keyword to the keyword stack
         * If necessary (`list hello = value1, value2` should not be closed)
         */
        Validator.prototype.handleList = function () {
            if (this.foundKeyword === undefined) {
                throw new Error("We're trying to handle 'list', but foundKeyword is undefined");
            }
            var line = this.config.getCurrentLine();
            this.match = /(^\s*list\s+)(\w+)\s*=/.exec(line);
            this.addToStringMap(this.variables, "listNames");
            if (/(=|,)[ \t]*$/m.test(line)) {
                this.keywordsStack.push(this.foundKeyword);
            }
            else {
                var j = this.config.currentLineNumber + 1;
                var nextLine = this.config.getLine(j);
                while (nextLine !== null && /^[ \t]*$/m.test(nextLine)) {
                    nextLine = this.config.getLine(++j);
                }
                if (nextLine !== null && (/^[ \t]*,/.test(nextLine) || /\bendlist\b/.test(nextLine))) {
                    this.keywordsStack.push(this.foundKeyword);
                }
            }
        };
        /**
         * Performs required operations after a section has finished.
         * Mostly empties arrays.
         */
        Validator.prototype.handleSection = function () {
            if (this.match == null) {
                if (this.previousSection !== undefined) {
                    this.currentSection = this.previousSection;
                    this.currentSettings = this.previousSettings;
                }
                return;
            }
            var _a = __read(this.match, 3), indent = _a[1], name = _a[2];
            var nextIsTags = this.currentSection && /tag/i.test(name);
            if (!nextIsTags) {
                /**
                 * If the next is [tags], no need to perform checks for current section now,
                 * they will be done after [tags] section finished.
                 */
                this.checkRequredSettingsForSection();
                this.addCurrentToParentSettings();
                if (/widget/i.test(name)) {
                    this.checkAliases();
                    this.deAliases.splice(0, this.deAliases.length);
                    this.aliases.splice(0, this.aliases.length);
                    this.settingValues.clear();
                }
                this.checkUrlPlaceholders();
                this.ifSettings.clear();
            }
            this.previousSettings = this.currentSettings.splice(0, this.currentSettings.length);
            this.previousSection = this.currentSection;
            this.currentSection = new TextRange(name, this.createRange(indent.length, name.length));
            this.parentSettings.delete(this.currentSection.text);
            this.setSectionToStackAndTree(this.currentSection);
        };
        /**
         * Attempts to add section to section stack, displays error if section
         * is out ouf hierarchy, unknown or has unresolved section dependencies
         * If section is null, finalizes section stack and return summary error
         * Adds last section of stack to ConfigTree.
         * @param section section to add or null
         */
        Validator.prototype.setSectionToStackAndTree = function (section) {
            var sectionStackError;
            var lastSection = this.sectionStack.getLastSection();
            if (lastSection) {
                this.configTree.addSection(lastSection.range, lastSection.settings);
            }
            if (section == null) {
                sectionStackError = this.sectionStack.finalize();
            }
            else {
                sectionStackError = this.sectionStack.insertSection(this.currentSection);
            }
            if (sectionStackError) {
                this.result.push(sectionStackError);
            }
        };
        /**
         * Calls functions in proper order to handle a found setting
         */
        Validator.prototype.handleSettings = function () {
            if (this.match == null) {
                return;
            }
            var line = this.config.getCurrentLine();
            if (this.currentSection === undefined || !/(?:tag|key)s?/.test(this.currentSection.text)) {
                this.handleRegularSetting();
            }
            else if (/(?:tag|key)s?/.test(this.currentSection.text) &&
                // We are in tags/keys section
                /(^[ \t]*)([a-z].*?[a-z])[ \t]*=/.test(line)) {
                this.match = /(^[ \t]*)([a-z].*?[a-z])[ \t]*=/.exec(line);
                if (this.match === null) {
                    return;
                }
                var _a = __read(this.match, 3), indent = _a[1], name = _a[2];
                var setting = this.getSetting(name);
                if (this.isAllowedWidget(setting)) {
                    this.result.push(Util.createDiagnostic(this.createRange(indent.length, name.length), settingNameInTags(name), vscodeLanguageserverTypes.DiagnosticSeverity.Information));
                }
            }
        };
        /**
         * Checks whether the setting is defined and is allowed to be defined in the current widget
         * @param setting the setting to be checked
         */
        Validator.prototype.isAllowedWidget = function (setting) {
            return setting !== undefined
                && this.currentSection.text !== "tag"
                && (setting.widget == null
                    || this.currentWidget === undefined
                    || setting.widget === this.currentWidget);
        };
        /**
         * Return true if the setting is allowed to be defined in the current section.
         * @param setting The setting to be checked.
         */
        Validator.prototype.isAllowedInSection = function (setting) {
            if (setting.section == null || this.currentSection == null) {
                return true;
            }
            var currDepth = ResourcesProviderBase.sectionDepthMap[this.currentSection.text];
            if (setting.name === "mode") {
                if (this.currentWidget == null) {
                    return true;
                }
                if (this.currentWidget === "chart") {
                    if (setting.value === "column-stack") {
                        return currDepth <= ResourcesProviderBase.sectionDepthMap.widget;
                    }
                    return currDepth <= ResourcesProviderBase.sectionDepthMap.series;
                }
            }
            if (Array.isArray(setting.section)) {
                return setting.section.some(function (s) { return currDepth <= ResourcesProviderBase.sectionDepthMap[s]; });
            }
            else {
                var reqDepth = ResourcesProviderBase.sectionDepthMap[setting.section];
                return currDepth <= reqDepth;
            }
        };
        /**
         * Processes a regular setting which is defined not in tags/keys section
         */
        Validator.prototype.handleRegularSetting = function () {
            var line = this.config.getCurrentLine();
            var setting = this.getSettingCheck();
            if (setting === undefined) {
                return;
            }
            this.addSettingValue(setting);
            /**
             * Show hint if setting is deprecated
             */
            if (setting.deprecated) {
                this.result.push(Util.createDiagnostic(setting.textRange, setting.deprecated, vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
            }
            if (!this.isAllowedInSection(setting)) {
                this.result.push(Util.createDiagnostic(setting.textRange, illegalSetting(setting.displayName), vscodeLanguageserverTypes.DiagnosticSeverity.Error));
            }
            if (setting.name === "type") {
                this.currentWidget = this.match[3];
                var reqs = ResourcesProviderBase.widgetRequirementsByType.get(this.currentWidget);
                if (reqs && reqs.sections) {
                    this.sectionStack.setSectionRequirements("widget", reqs.sections);
                }
            }
            if (!setting.multiLine) {
                this.checkRepetition(setting);
            }
            else {
                this.currentSettings.push(setting);
                this.sectionStack.insertCurrentSetting(setting);
            }
            if (!(this.currentSection && ["placeholders", "properties", "property"].includes(this.currentSection.text))) {
                this.typeCheck(setting);
                this.checkExcludes(setting);
                // Aliases
                if (setting.name === "alias") {
                    this.match = /(^\s*alias\s*=\s*)(\S+)\s*$/m.exec(line);
                    this.addToStringArray(this.aliases);
                }
                this.findDeAliases();
            }
        };
        /**
         * Check if settings or tag key contains whitespace and warn about it.
         * Ignore any settings in [properties] section.
         */
        Validator.prototype.checkSettingsWhitespaces = function () {
            var line = this.config.getCurrentLine();
            var match = /(^\s*)((\w+\s+)+\w+)\s*=\s*(.+?)\s*$/.exec(line);
            if (match != null && match[2]) {
                var settingName = match[2];
                if (settingName && !this.foundKeyword && /^\w+(\s.*\w)+$/.test(settingName)) {
                    var start = line.indexOf(settingName);
                    var range = this.createRange(start, settingName.length);
                    if (this.currentSection.text === "tags") {
                        if (!/^["].+["]$/.test(settingName)) {
                            this.result.push(Util.createDiagnostic(range, tagNameWithWhitespaces(settingName), vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
                        }
                    }
                    else if (this.currentSection.text !== "properties") {
                        this.result.push(Util.createDiagnostic(range, settingsWithWhitespaces(settingName), vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
                    }
                }
            }
        };
        /**
         * Updates the lastCondition field
         */
        Validator.prototype.setLastCondition = function () {
            this.lastCondition = "" + this.config.currentLineNumber + this.config.getCurrentLine();
        };
        /**
         * Checks spelling mistakes in a section name
         */
        Validator.prototype.spellingCheck = function () {
            if (this.match == null) {
                return;
            }
            var indent = this.match[1].length;
            var word = this.match[2];
            var range = this.createRange(indent, word.length);
            if (word === "tag") {
                this.result.push(Util.createDiagnostic(range, deprecatedTagSection, vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
            }
        };
        /**
         * Calls corresponding functions for the found keyword
         */
        Validator.prototype.switchKeyword = function () {
            if (this.foundKeyword === undefined) {
                throw new Error("We're trying to handle a keyword, but foundKeyword is undefined");
            }
            var line = this.config.getCurrentLine();
            switch (this.foundKeyword.text) {
                case "endfor":
                    this.handleEndFor();
                case "endif":
                    this.lastEndIf = this.config.currentLineNumber;
                case "endvar":
                case "endcsv":
                case "endlist":
                case "endsql":
                case "endscript": {
                    var expectedEnd = this.foundKeyword.text.substring("end".length);
                    this.checkEnd(expectedEnd);
                    break;
                }
                case "else":
                case "elseif": {
                    this.handleElse();
                    break;
                }
                case "csv": {
                    this.handleCsv();
                    break;
                }
                case "var": {
                    var openBrackets = line.match(/((\s*[\[\{\(]\s*)+)/g);
                    var closeBrackets = line.match(/((\s*[\]\}\)]\s*)+)/g);
                    if (openBrackets) {
                        if (closeBrackets && openBrackets.map(function (s) { return s.trim(); }).join("").length !==
                            closeBrackets.map(function (s) { return s.trim(); }).join("").length
                            || closeBrackets === null) {
                            // multiline var
                            this.keywordsStack.push(this.foundKeyword);
                        }
                    }
                    this.match = /(var\s*)(\w+)\s*=/.exec(line);
                    this.addToStringMap(this.variables, "varNames");
                    break;
                }
                case "list": {
                    this.handleList();
                    break;
                }
                case "for": {
                    this.handleFor();
                    break;
                }
                case "if": {
                    this.keywordHandler.handleIf(line, this.foundKeyword);
                    this.setLastCondition();
                    break;
                }
                case "script": {
                    this.keywordHandler.handleScript(line, this.foundKeyword);
                    break;
                }
                case "sql": {
                    this.keywordHandler.handleSql(line, this.foundKeyword);
                    break;
                }
                case "import":
                    break;
                default:
                    throw new Error(this.foundKeyword.text + " is not handled");
            }
        };
        /**
         * Performs type checks for the found setting value
         * @param setting the setting to be checked
         */
        Validator.prototype.typeCheck = function (setting) {
            if (this.match == null) {
                return;
            }
            var range = this.createRange(this.match[1].length, this.match[2].length);
            var diagnostic = setting.checkType(range);
            if (diagnostic != null) {
                this.result.push(diagnostic);
            }
        };
        /**
         * Creates diagnostics for a CSV line containing wrong columns number
         */
        Validator.prototype.validateCsv = function () {
            var line = this.config.getCurrentLine();
            var columns = Util.countCsvColumns(line);
            if (columns !== this.csvColumns && !/^[ \t]*$/m.test(line)) {
                this.result.push(Util.createDiagnostic(this.createRange(0, line.length), "Expected " + this.csvColumns + " columns, but found " + columns));
            }
        };
        /**
         * Creates diagnostics for unknown variables in `for` keyword
         * like `for srv in servers setting = @{server} endfor`
         * but `server` is undefined
         */
        Validator.prototype.validateFor = function () {
            var line = this.config.getCurrentLine();
            var atRegexp = /@{.+?}/g;
            this.match = atRegexp.exec(line);
            while (this.match !== null) {
                var substr = this.match[0];
                var startPosition = this.match.index;
                var varRegexp = /[a-zA-Z_]\w*(?!\w*["\('])/g;
                this.match = varRegexp.exec(substr);
                while (this.match !== null) {
                    if (substr.charAt(this.match.index - 1) === ".") {
                        this.match = varRegexp.exec(substr);
                        continue;
                    }
                    var variable = this.match[0];
                    if (!Util.isInMap(variable, this.variables)) {
                        var position = startPosition + this.match.index;
                        var message = unknownToken(variable);
                        this.result.push(Util.createDiagnostic(this.createRange(position, variable.length), message));
                    }
                    this.match = varRegexp.exec(substr);
                }
                this.match = atRegexp.exec(line);
            }
        };
        Validator.prototype.getSetting = function (name) {
            var line = this.config.getCurrentLine();
            var start = line.indexOf(name);
            var range = (start > -1) ? this.createRange(start, name.length) : undefined;
            return LanguageService.getResourcesProvider().getSetting(name, range);
        };
        Validator.prototype.checkUrlPlaceholders = function () {
            var phs = this.getUrlPlaceholders();
            if (phs.length > 0) {
                if (this.currentSection && this.currentSection.text.match(/widget/i)) {
                    this.sectionStack.requireSections("widget", "placeholders");
                }
            }
            var placeholderRange = this.sectionStack.getSectionRange("placeholders");
            if (placeholderRange) {
                var phSectionSettings_1 = this.sectionStack.getSectionSettings("placeholders", false);
                var missingPhs = phs.filter(function (key) {
                    var cleared = Setting.clearValue(key);
                    return phSectionSettings_1.find(function (s) { return s.name === cleared; }) == null;
                });
                if (missingPhs.length > 0) {
                    this.result.push(Util.createDiagnostic(placeholderRange.range, "Missing placeholders: " + missingPhs.join(", ") + ".", vscodeLanguageserverTypes.DiagnosticSeverity.Error));
                }
                var unnecessaryPhs = phSectionSettings_1.filter(function (s) { return !phs.includes(s.name); }).map(function (s) { return s.name; });
                if (unnecessaryPhs.length > 0) {
                    this.result.push(Util.createDiagnostic(placeholderRange.range, "Unnecessary placeholders: " + unnecessaryPhs.join(", ") + ".", vscodeLanguageserverTypes.DiagnosticSeverity.Warning));
                }
            }
        };
        /**
         * Returns all placeholders declared before the current line.
         */
        Validator.prototype.getUrlPlaceholders = function () {
            var e_11, _a;
            var result = new Set();
            try {
                for (var placeholderContainingSettings_1 = __values(placeholderContainingSettings), placeholderContainingSettings_1_1 = placeholderContainingSettings_1.next(); !placeholderContainingSettings_1_1.done; placeholderContainingSettings_1_1 = placeholderContainingSettings_1.next()) {
                    var setting = placeholderContainingSettings_1_1.value;
                    var currentSetting = this.sectionStack.getCurrentSetting(setting);
                    if (currentSetting) {
                        var regexp = /{(.+?)}/g;
                        var match = regexp.exec(currentSetting.value);
                        while (match !== null) {
                            var cleared = Setting.clearSetting(match[1]);
                            result.add(cleared);
                            match = regexp.exec(currentSetting.value);
                        }
                    }
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (placeholderContainingSettings_1_1 && !placeholderContainingSettings_1_1.done && (_a = placeholderContainingSettings_1.return)) _a.call(placeholderContainingSettings_1);
                }
                finally { if (e_11) throw e_11.error; }
            }
            return __spread(result);
        };
        /**
         * Creates Range object for the current line.
         *
         * @param start - The starting position in the string
         * @param length - Length of the word to be highlighted
         * @returns Range object with start equal to `start` and end equal to `start+length`
         */
        Validator.prototype.createRange = function (start, length) {
            return Util.createRange(start, length, this.config.currentLineNumber);
        };
        return Validator;
    }());

    exports.CompletionProvider = CompletionProvider;
    exports.DefaultSetting = DefaultSetting;
    exports.Formatter = Formatter;
    exports.LanguageService = LanguageService;
    exports.ResourcesProviderBase = ResourcesProviderBase;
    exports.Setting = Setting;
    exports.Util = Util;
    exports.Validator = Validator;

    Object.defineProperty(exports, '__esModule', { value: true });

});
