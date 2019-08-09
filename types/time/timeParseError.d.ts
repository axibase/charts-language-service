export declare class TimeParseError extends Error {
    wrongValue: string;
    message: string;
    /**
     * Constructs error, thrown during time settings parsing.
     * @param wrongValue - Incorrect value, which is the reason of the error
     * @param message - Specific description of the error
     */
    constructor(wrongValue: string, message: string);
}
