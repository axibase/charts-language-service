import { DateWithTZ } from "./date_with_tz/date_with_tz";
import { DateFunction } from "./utils";

export interface Summand {
    count: string;
    unit: string;
    sign: string;
}

/**
 * Stores components of parsed date arithmetic expression.
 */
export class ParsedExpression {
    /**
     * Date function, which returns date, corresponding to base part of date arithmetic expression.
     * For example, for expression "current_day + 9 hour - 50*minute",
     * base part is "current_day",
     * timespan is "+ 9 hour - 50*minute", then
     * base = calendarKeywords['current_day']
     */
    private readonly base: DateFunction;
    /**
     * Interval part of date arithmetic expression, splitted to array of components:
     * [{count: "9", unit: "hour", sign: "+"}, {count: "50", unit: "minute", sign: "-"}]
     */
    private readonly summands: Summand[];

    constructor(base: DateFunction, summands: Summand[]) {
        this.base = base;
        this.summands = summands;
    }

    /**
     * Constructs {@link DateWithTZ} using {@link base} and {@link summands}.
     * Uses now date as base to construct target object,
     * that means that different dates for the same expression are returned on each getDate call.
     *
     * @param zone - Zone ID, in which date is need to be processed. It will be ignored if template contains offset
     *               @see DateWithTZ.zone
     */
    public getDate(zone: string): DateWithTZ {
        const now = new DateWithTZ(undefined, zone);
        const baseAsDate: DateWithTZ = this.base(now);
        try {
            this.summands.forEach((summand) => {
                baseAsDate.shift(summand.count, summand.unit, summand.sign);
            });
        } catch (error) {
            /** There is incorrect count, unit or sign. */
            return null;
        }
        return baseAsDate;
    }
}
