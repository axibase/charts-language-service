import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string) => `[configuration]
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
                createRange(4, 8, 4),
                "Can't parse widget's position. Correct setting syntax is, for example: '1-1, 2-2'",
                DiagnosticSeverity.Error
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

    test("Widget's position overflows grid 10x10", () => {
        const config = baseConfig("position = 10-10, 11-11");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 8, 4),
                "Widget's position '10-10, 11-11' overflows grid 6x4",
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
                createRange(2, 11, 5),
                "width-units has no effect is position is specified",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });
});
