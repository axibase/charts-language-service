import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (dim1: string, dim2: string = "") => `[configuration]
width-units = 40
height-units = 30
[group]
  [widget]
    type = chart
    ${dim1}
    [series]
      metric = a
      entity = b
  [widget]
    type = chart
    ${dim2}
    [series]
      metric = a
      entity = b`;

suite("Widgets per row tests", () => {
    test("Correct: both dimensions are within limits", () => {
        const config = baseConfig("width-units = 39");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect: width-units exceed limit", () => {
        const config = baseConfig("height-units = 5", "width-units = 40");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Widgets' width-units doesn't fit group capacity"
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect: height-units exceed limit", () => {
        const config = baseConfig("height-units = 30", "height-units = 2");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Widgets' height-units doesn't fit group capacity"
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: default dimensions", () => {
        const config = baseConfig("");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect: height and width units exceed limit", () => {
        const config = baseConfig(`height-units = 30
    width-units = 30`,
`width-units = 30
    height-units = 30
        `);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(1, 5, 3),
                "Widgets' width-units and height-units don't fit group capacity"
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: fractional dimensions within limits", () => {
        const config = baseConfig("height-units = 1.5", "height-units = 28.5");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });
});
