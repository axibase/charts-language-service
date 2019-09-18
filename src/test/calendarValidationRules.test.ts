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

const paletteTicksConfig = (
    rangeMerge: string = "", thresholds: string = ""
) => `[configuration]
entity = nurswgvml006
metric = cpu_busy
[group]
  [widget]
    type = calendar
    ${rangeMerge}
    ${thresholds}
    palette-ticks = true
    [series]
    [series]`;

suite("Calendar type specfifc validation rules", () => {
    test("Incorrect: summarize-period is greater than timespan", () => {
        const config = baseConfig("1 hour", "1 day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 16, 5),
                `For calendar summarize-period should not be greater than timespan`,
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
                `calendar requires a definitive timespan (all is not allowed)`,
                DiagnosticSeverity.Error
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Don't show palette-ticks: no 'range-merge' or 'thresholds' specified", () => {
        const config = paletteTicksConfig();
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 13, 8),
                `For multiple series with no 'range-merge' and no 'thresholds' specified ticks won't show`,
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'range-merge' specified, but 'thresholds' is not", () => {
        const config = paletteTicksConfig("range-merge = true");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, but 'range-merge' is not", () => {
        const config = paletteTicksConfig("", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, 'range-merge' is false", () => {
        const config = paletteTicksConfig("range-merge = false", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: both 'thresholds' and 'range-merge' specified", () => {
        const config = paletteTicksConfig("range-merge = true", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
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
