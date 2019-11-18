export class TimeParseError extends Error {
    public message: string;

    /**
     * Constructs error, thrown during time settings parsing.
     *
     * @param message - Specific description of the error
     * @param wrongValue - Incorrect value, which is the reason of the error
     */
    constructor(message: string, wrongValue: string | number) {
        super(message);
        this.message = message + ": " + wrongValue;
        this.name = this.constructor.name;
        this.stack = (new Error()).stack;
    }
}
