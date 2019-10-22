import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string) => `[configuration]
width-units = 10
height-units = 10
[group]
  [widget]
    type = chart
    ${setting}
    [series]
      metric = a
      entity = b`;

suite("Widgets position tests", () => {
    test("Incorrect widgets position", () => {
        const config = baseConfig("position = 0");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Can't parse widget's position. '0' doesn't seem to match {number}-{number} schema",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct widgets position", () => {
        const config = baseConfig("position = 1-1, 2-2");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Widgets position overflows grid 10x10", () => {
        const config = baseConfig("position = 10-10, 11-11");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Widget position '10-10, 11-11' overflows grid 10x10",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Useless width-units with specified position", () => {
        const config = baseConfig("position = 2-2, 3-3\n  width-units = 2");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(2, 11, 7),
                "width-units has no effect is position is specified",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    /**
     * Skip for now because not sure how absolute and relative widgets should be positioned
     */
    test.skip("Absolute and relative widgets overlap each other", () => {
        const config = `[configuration]
        width-units = 10
        height-units = 10
    [group]
      [widget]
          type = chart
          position = 1-1, 2-2
          [series]
              metric = a
              entity = b
      [widget]
          type = chart
          [series]
              metric = a
              entity = b
    `;
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Widget position '10-10, 11-11' overflows grid 10x10",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });
});
