import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string, condition: string = "") => `[configuration]
[group]
  [widget]
    type = treemap
    ${condition}
    ${setting}
    [series]
      entity = nurswgvml006
      metric = cpu_busy`;

suite("Size setting tests", () => {
    test("Incorrect: negative value", () => {
        const config = baseConfig("size = -3");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(4, 4, 5),
                `size should be in range [0, Infinity]. For example, 3`,
                DiagnosticSeverity.Error
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct: positive value", () => {
        const config = baseConfig("size = 2");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
    });
});
