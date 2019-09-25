import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const paletteTicksConfig = (
    widget: string, rangeMerge: string = "", thresholds: string = ""
) => `[configuration]
entity = nurswgvml006
metric = cpu_busy
[group]
  [widget]
    type = ${widget}
    ${rangeMerge}
    ${thresholds}
    palette-ticks = true
    [series]
    [series]`;

suite("Treemap widget: 'palette-ticks' validation", () => {
    test("Don't show palette-ticks: no 'range-merge' or 'thresholds' specified", () => {
        const config = paletteTicksConfig("treemap");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 13, 8),
                "Palette ticks will not be displayed if the widget contains multiple series with individual ranges. " +
                "Enable 'range-merge' or set common 'thresholds' to display ticks.",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'range-merge' specified, but 'thresholds' is not", () => {
        const config = paletteTicksConfig("treemap", "range-merge = true");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, but 'range-merge' is not", () => {
        const config = paletteTicksConfig("treemap", "", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, 'range-merge' is false", () => {
        const config = paletteTicksConfig("treemap", "range-merge = false", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: both 'thresholds' and 'range-merge' specified", () => {
        const config = paletteTicksConfig("treemap", "range-merge = true", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });
});

suite("Calendar widget: 'palette-ticks' validation", () => {
    test("Don't show palette-ticks: no 'range-merge' or 'thresholds' specified", () => {
        const config = paletteTicksConfig("calendar");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 13, 8),
                "Palette ticks will not be displayed if the widget contains multiple series with individual ranges. " +
                "Enable 'range-merge' or set common 'thresholds' to display ticks.",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'range-merge' specified, but 'thresholds' is not", () => {
        const config = paletteTicksConfig("calendar", "range-merge = true");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, but 'range-merge' is not", () => {
        const config = paletteTicksConfig("calendar", "", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Show palette-ticks: 'thresholds' specified, 'range-merge' is false", () => {
        const config = paletteTicksConfig("calendar", "range-merge = false", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: both 'thresholds' and 'range-merge' specified", () => {
        const config = paletteTicksConfig("calendar", "range-merge = true", "thresholds = 0, 50, 90, 100");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });
});
