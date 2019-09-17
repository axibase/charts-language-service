import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (timespan: string, summarizePeriod: string) => `[configuration]
  height-units = 2
  width-units = 1

[group]

  [widget]
    type = calendar
    timespan = ${timespan}
    summarize-period = ${summarizePeriod}

    [series]
      entity = nurswgvml006
      metric = cpu_busy`;

suite("Calendar validation rules", () => {
    test("Incorrect: summarize-period is greater than timespan", () => {
        const config = baseConfig("1 hour", "1 day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 16, 9),
                `For calendar summarize-period should not be greater than timespan`,
                DiagnosticSeverity.Warning
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
