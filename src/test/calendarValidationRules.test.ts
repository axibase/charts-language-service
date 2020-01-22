import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (timespan: string, summarizePeriod: string) => `[configuration]
[group]
  [widget]
    type = calendar
    timespan = ${timespan}
    summarize-period = ${summarizePeriod}
    [series]
      entity = nurswgvml006
      metric = cpu_busy`;

suite("Calendar type specfic validation rules", () => {
    test("Incorrect: summarize-period is greater than timespan", () => {
        const config = baseConfig("1 hour", "1 day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 16, 5),
                `The 'summarize-period' must be less than the selection interval.`,
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect: calendar has timespan 'all'", () => {
        const config = baseConfig("all", "1 day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 8, 4),
                `Timespan 'all' is not supported by the calendar widget`,
                DiagnosticSeverity.Error
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: summarize-period is equal to timespan", () => {
        const config = baseConfig("1 hour", "1 hour");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });
});
