import { TIME_UNIT_REGEXP } from "../regExpressions";

export class IntervalParser {
    public static timeUnits: Map<string, number> = new Map([
        ["sec", 1000],
        ["second", 1000],
        ["min", 60000],
        ["minute", 60000],
        ["hour", 3600000],
        ["day", 86400000],
        ["week", 604800000],
        ["month", 2592000000],
        ["year", 31536000000],
    ]);

    public static getValue(interval: string): number {
        const match = TIME_UNIT_REGEXP.exec(interval);
        let value: number;

        if (match === null) {
            return;
        }

        const [, count, unit] = match;

        /**
         * Amount of milliseconds per time-unit
         */
        const milliseconds = this.timeUnits.get(unit);

        if (milliseconds === undefined) {
            throw new Error(`Unsupported time units ${unit}`);
        }

        value = milliseconds * parseFloat(count);

        if (isFinite(value) === false) {
            throw new Error(`Can't parse interval «${interval}»`);
        }

        return value;
    }
}
