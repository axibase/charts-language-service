"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const constants_1 = require("./constants");
const defaultSetting_1 = require("./defaultSetting");
const messageUtil_1 = require("./messageUtil");
const regExpressions_1 = require("./regExpressions");
const util_1 = require("./util");
const specificValueChecksMap = new Map([
    ["forecastssagroupmanualgroups", {
            errMsg: "Incorrect group syntax",
            isIncorrect: (value) => {
                const regex = /^[\d\s,;-]+$/;
                return !regex.test(value);
            }
        }],
    ["forecastssagroupautounion", {
            errMsg: "Incorrect group union syntax",
            isIncorrect: (value) => {
                const regex = /^[a-z\s,;-]+$/;
                return !regex.test(value);
            }
        }]
]);
/**
 * In addition to DefaultSetting contains specific fields.
 */
class Setting extends defaultSetting_1.DefaultSetting {
    constructor(setting) {
        super(setting);
        /**
         * Setting value, specified in config.
         */
        this.value = "";
        /**
         * Setting values for multiline settings (mostly for colors and thresholds), specified in config.
         */
        this.values = [];
    }
    get textRange() {
        return this._textRange;
    }
    set textRange(value) {
        this._textRange = value;
    }
    /**
     * Checks the type of the setting and creates a corresponding diagnostic
     * @param range where the error should be displayed
     */
    checkType(range) {
        let result;
        // allows ${} and @{} expressions
        if (regExpressions_1.CALCULATED_REGEXP.test(this.value)) {
            return result;
        }
        switch (this.type) {
            case "string": {
                if (!/\S/.test(this.value)) {
                    result = util_1.createDiagnostic(range, `${this.displayName} can not be empty`);
                    break;
                }
                if (this.enum.length > 0) {
                    if (this.value.split(/\s*,\s*/).some(s => this.enum.indexOf(s) < 0)) {
                        const enumList = this.enum.sort().join("\n * ");
                        result = util_1.createDiagnostic(range, `${this.displayName} must contain only the following:\n * ${enumList}`);
                    }
                    break;
                }
                const specCheck = specificValueChecksMap.get(this.name);
                if (specCheck && specCheck.isIncorrect(this.value)) {
                    result = util_1.createDiagnostic(range, specCheck.errMsg);
                }
                break;
            }
            case "number": {
                const persent = /(\d*)%/.exec(this.value);
                if (this.name === "arrowlength" && persent) {
                    this.maxValue = typeof this.maxValue === "object" ? this.maxValue.value * 100 : this.maxValue * 100;
                    this.minValue = typeof this.minValue === "object" ? this.minValue.value * 100 : this.minValue * 100;
                    this.value = persent[1];
                }
                result = this.checkNumber(regExpressions_1.NUMBER_REGEXP, `${this.displayName} should be a real (floating-point) number.`, range);
                break;
            }
            case "integer": {
                result = this.checkNumber(regExpressions_1.INTEGER_REGEXP, `${this.displayName} should be an integer number.`, range);
                break;
            }
            case "boolean": {
                if (!regExpressions_1.BOOLEAN_REGEXP.test(this.value)) {
                    result = util_1.createDiagnostic(range, `${this.displayName} should be a boolean value. For example, ${this.example}`);
                }
                break;
            }
            case "enum": {
                const index = this.findIndexInEnum(this.value);
                // Empty enum means that the setting is not allowed
                if (this.enum.length === 0) {
                    result = util_1.createDiagnostic(range, messageUtil_1.illegalSetting(this.displayName));
                }
                else if (index < 0) {
                    if (/percentile/.test(this.value) && /statistic/.test(this.name)) {
                        result = this.checkPercentile(range);
                        break;
                    }
                    const enumList = this.enum.sort().
                        join("\n * ").
                        replace(/percentile\\.+/, "percentile(n)");
                    result = util_1.createDiagnostic(range, `${this.displayName} must be one of:\n * ${enumList}`);
                }
                break;
            }
            case "interval": {
                if (!regExpressions_1.INTERVAL_REGEXP.test(this.value)) {
                    const message = `.\nFor example, ${this.example}. Supported units:\n * ${constants_1.INTERVAL_UNITS.join("\n * ")}`;
                    if (this.name === "updateinterval" && /^\d+$/.test(this.value)) {
                        result = util_1.createDiagnostic(range, `Specifying the interval in seconds is deprecated.\nUse \`count unit\` format${message}`, vscode_languageserver_types_1.DiagnosticSeverity.Warning);
                    }
                    else {
                        /**
                         * Check other allowed non-interval values
                         * (for example, period, summarize-period, group-period supports "auto")
                         */
                        if (this.enum.length > 0) {
                            if (this.findIndexInEnum(this.value) < 0) {
                                result = util_1.createDiagnostic(range, `Use ${this.enum.sort().
                                    join(", ")} or \`count unit\` format${message}`);
                            }
                        }
                        else {
                            result = util_1.createDiagnostic(range, `${this.displayName} should be set as \`count unit\`${message}`);
                        }
                    }
                }
                break;
            }
            case "date": {
                // Is checked in RelatedSettingsRule.
                break;
            }
            case "object": {
                try {
                    JSON.parse(this.value);
                }
                catch (err) {
                    result = util_1.createDiagnostic(range, `Invalid object specified: ${err.message}`);
                }
                break;
            }
            default: {
                throw new Error(`${this.type} is not handled`);
            }
        }
        return result;
    }
    checkNumber(reg, message, range) {
        const example = ` For example, ${this.example}`;
        if (!reg.test(this.value)) {
            return util_1.createDiagnostic(range, `${message}${example}`);
        }
        const minValue = typeof this.minValue === "object" ?
            this.minValue.value :
            this.minValue;
        const minValueExcluded = typeof this.minValue === "object" ?
            this.minValue.excluded :
            false;
        const maxValue = typeof this.maxValue === "object" ?
            this.maxValue.value :
            this.maxValue;
        const maxValueExcluded = typeof this.maxValue === "object" ?
            this.maxValue.excluded :
            false;
        const left = minValueExcluded ? `(` : `[`;
        const right = maxValueExcluded ? `)` : `]`;
        if (minValueExcluded && +this.value <= minValue || +this.value < minValue ||
            maxValueExcluded && +this.value >= maxValue || +this.value > maxValue) {
            return util_1.createDiagnostic(range, `${this.displayName} should be in range ${left}${minValue}, ${maxValue}${right}.${example}`);
        }
        return undefined;
    }
    checkPercentile(range) {
        let result;
        const n = this.value.match(/[^percntil_()]+/);
        if (n && +n[0] >= 0 && +n[0] <= 100) {
            if (/_/.test(this.value)) {
                result = util_1.createDiagnostic(range, `Underscore is deprecated, use percentile(${n[0]}) instead`, vscode_languageserver_types_1.DiagnosticSeverity.Warning);
            }
            else if (!new RegExp(`\\(${n[0]}\\)`).test(this.value)) {
                result = util_1.createDiagnostic(range, `Wrong usage. Expected: percentile(${n[0]}).
Current: ${this.value}`);
            }
        }
        else {
            result = util_1.createDiagnostic(range, `n must be a decimal number between [0, 100]. Current: ${n ?
                n[0] :
                n}`);
        }
        return result;
    }
    findIndexInEnum(value) {
        return this.enum.findIndex((option) => new RegExp(`^${option}$`, "i").test(value));
    }
}
exports.Setting = Setting;
