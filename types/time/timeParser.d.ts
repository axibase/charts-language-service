export declare class TimeParser {
    /**
     * If true, {@link parseDateTemplate} constructs target Date object as UTC date.
     */
    private readonly isUTC;
    private calendarKeywords;
    constructor(timezoneValue?: string);
    /**
     * Main parsing method. Parses time setting value to Date object in the following order:
     *  a) tries to parse as ISO-like string or Unix timestamp as string;
     *  b) if fails (null is produced), tries to parse as calendar expression.
     *
     * @param settingValue - Date template string, which need to be parsed.
     *                       Can be either ISO-like string or calendar expression
     * @returns Date object, corresponding to `settingValue` template.
     */
    parseDateTemplate(settingValue: string): Date;
    /**
     * Parses span part of calendar expression and adds it to parsed base part. For example,
     * for expression "current_day + 9 hour + 50 minute", base part is "current_day"
     * and timespan is "+ 9 hour + 50 minute".
     *
     * @param timespan - Span part of calendar expression to be parsed and processed
     * @param baseTime - Parsed base part of calendar expression
     * @returns Date object, corresponding to parsed calendar expression.
     * @throws TimeParseError The following restrictions are applied to `timespan`:
     *                          1) must be in `<[+,-] count [*] unit>` format, e.g. "8 hour", "1 day";
     *                          2) unit must be one of
     *                            [year, quarter, month, week, day, hour, minute, min, second, sec, millisecond].
     */
    private parseIntervalExpression;
    /**
     * Parses date part and returns Date object, corresponding to date template.
     *
     * @param dateTemplate - Date template string in format yyyy-mm-dd
     * @param d - Date object, which is used as base to construct target Date object
     * @returns Date object, corresponding to `dateTemplate`.
     */
    private parseDate;
    /**
     * Parses time part and returns Date object, corresponding to time template.
     *
     * @param match - Date template string, parsed to RegExpMatchArray
     * @param d - Date object, which is used as base to construct target Date object
     * @returns Date object, corresponding to time part of `match`.
     */
    private parseTime;
    /**
     * Parses template string to Date object. In addition to formats, accepted by Date constructor,
     * there are some others ISO-like yyyy-mm-dd hh:mm:ss,
     * see timeParser.parseDate.test.ts and timeParser.parseTime.test.ts.
     *
     * @param template - Date template string.
     * @param t - Unix timestamp, which is used as base to construct target Date object
     * @returns Date object, corresponding to `template`.
     * @throws TimeParseError Date must be greater than start of Unix epoch.
     */
    private parseIsoLikeTemplate;
    private _getDay;
    private _getDate;
    private _getMonth;
    private _setMonth;
    private cw;
    private cm;
    private pd;
    private pwd;
    private pvd;
    private nd;
    private nwd;
    private nvd;
    private ld;
    /**
     * Returns function, which returns date corresponding to specified day of week.
     *
     * @param day - Index of day
     * @returns Function, which constructs date object corresponding to `day`.
     */
    private dayOfWeek;
    /**
     * Parses base part of calendar expression to Date or timestamp.
     *
     * @param value - Date template string, which need to be parsed
     * @param now - Unix timestamp, which is used as base to construct target Date object
     * @returns Date object or timestamp, corresponding to `value` template.
     * @see calendarKeywords
     */
    private parseCalendarKeyword;
}
