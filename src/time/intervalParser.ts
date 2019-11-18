import { parseInterval } from "./time_parser";

export class IntervalParser {
    public static parse(template: string) {
        const specInterval = this.specificIntervals.get(template);
        if (specInterval) {
            return specInterval;
        }
        return parseInterval(template, 0);
    }

    private static specificIntervals: Map<string, number> = new Map<string, number>([
        ["auto", 5 * 60000], // summarize-period default value is 5 minute
        ["all", +Infinity]
    ]);
}
