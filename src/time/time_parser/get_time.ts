import { parseCalendarExpression } from "./calendar";
import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { parseDateTemplate } from "./iso";
import { TimeParseError } from "./time_parse_error";

/**
 * Wrapper, which calls corresponding date parser (calendar or date template).
 */
export type DateParser = () => DateWithTZ;

/**
 * Analyzes template string and returns corresponding parser (or parsed value, see `returnDate`).
 * If template is not a string or array of strings, returns template as is.
 * Returns undefined if the template can not be parsed.
 *
 * @param template - Date template or calendar expression
 * @param zone - Zone ID, in which template is need to be processed. It will be ignored, if template contains offset
 *               @see DateWithTZ.zone
 * @param [returnDate=false] - If true, returns parsed date instead of function, @see {@link parseTimespan}
 * @param [isValidation=false] - If true, that means that parser was called for validation of template,
 *                               and error must be rethrown to be shown to user;
 *                               suppose that it will be used by charts-language-server
 * @throws TimeParseError Template must be a string, if function is used for validation, i.e. `isValidation=true`
 */
export function getTime(template, zone: string, returnDate: boolean = false,
                        isValidation: boolean = false): DateParser | DateWithTZ | number | void {
    const type = typeof template;
    if (type !== "string") {
        if (isValidation) {
            throw new TimeParseError("Incorrect type, string is expected", type);
        }
        if (Array.isArray(template)) {
            // TODO: is it necessary?
            template = template.join("\n");
        } else {
            /**
             * For example, template can be a DateParser:
             * @see {@link dataLoader.endTime},
             * it's called by setLoaderTimespan after getTime is already called for endTime in getWidgetConfig.
             * Awkward.
             */
            /**
             * TODO: should the number be wrapped to function?
             * Review dataLoader.endTime -> updateable = typeof endTime === "function";
             */
            return template;
        }
    }
    template = template.trim();

    /**
     * TODO: is it necessary to re-parse for templates with date part?
     * For example, 2016-01-01 is always parsed to 2016-01-01 00:00:00, regardless of now timestamp.
     */
    // Try to parse as date string.
    function dateParser() {
        return parseDateTemplate(template, zone);
    }

    let d = dateParser();
    if (d != null) {
        // Success, template is parsable as date string.
        return returnDate ? d : dateParser;
    }

    // Failure, try to parse as calendar expression.
    /**
     * It's necessary to re-evaluate value of time setting, because it usually depends on current time, for example:
     *  end-time = current_working_day + 18 hour + 50 minute
     *  update-interval = 5 second
     * in this config "current_working_day" is different for each day of week, thus "end-time" is need to be re-evaluated
     * within each update to ensure correct "end-time", @see {@link https://nur.axibase.com/portals/edit?id=298}.
     */
    function calendarParser() {
        return parseCalendarExpression(template, zone);
    }

    try {
        d = calendarParser();
        // Success, template is parsable as calendar expression.
        return returnDate ? d : calendarParser;
    } catch (e) {
        // Failure.
        if (isValidation) {
            // Rethrow the error to show it to user.
            throw e;
        }
    }
}
