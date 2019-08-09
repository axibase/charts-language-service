"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimeParseError extends Error {
    /**
     * Constructs error, thrown during time settings parsing.
     * @param wrongValue - Incorrect value, which is the reason of the error
     * @param message - Specific description of the error
     */
    constructor(wrongValue, message) {
        super(message);
        this.message = message + ": " + wrongValue;
        this.wrongValue = wrongValue;
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = (new Error()).stack;
        }
    }
}
exports.TimeParseError = TimeParseError;
