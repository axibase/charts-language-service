import { COUNT_UNIT_FORMAT } from "../regExpressions";
import { TimeParseError } from "./timeParseError";

export class IntervalParser {
    public static unitMillis: Map<string, number> = new Map<string, number>([
        ["millisecond", 1],
        ["sec", 1000],
        ["second", 1000],
        ["min", 60000],
        ["minute", 60000],
        ["hour", 3600000],
        ["day", 86400000],
        ["week", 604800000],
        ["month", 2592000000],
        ["quarter", 3 * 2592000000], // quarter = 3 month
        ["year", 31536000000]
    ]);

    public static getIntervalAsMillis(count, unit) {
        const unitAsMillis = this.unitMillis.get(unit);
        if (!unitAsMillis) {
            throw new TimeParseError(unit, "Incorrect interval unit");
        }
        return parseFloat(count) * unitAsMillis;
    }

    public static parse(template: string) {
        const specInterval = this.specificIntervals.get(template);
        if (specInterval) {
            return specInterval;
        }
        const parsedExpr = COUNT_UNIT_FORMAT.exec(template);
        if (!parsedExpr) {
            throw new TimeParseError(template, "Incorrect interval syntax");
        }
        const [, count, unit] = parsedExpr;
        return this.getIntervalAsMillis(count, unit);
    }

    private static specificIntervals: Map<string, number> = new Map<string, number>([
        ["auto", 5 * 60000], // summarize-period default value is 5 minute
        ["all", +Infinity]
    ]);
}
