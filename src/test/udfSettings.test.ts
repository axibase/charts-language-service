import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";
import { deepStrictEqual } from "assert";

suite("UDF settings tests", () => {
  test("Required evaluate-expression is missing", () => {
    const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  metrics = c, d, e`;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = createDiagnostic(
      Range.create(Position.create(6, 19), Position.create(6, 25)),
      "evaluate-expression is required if metrics is specified",
      DiagnosticSeverity.Error
    );
    deepStrictEqual(actualDiagnostics, [expectedDiagnostic]);
  });

  test("No error: evaluate-expression is present", () => {
    const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c, d, e`;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    deepStrictEqual(actualDiagnostics, []);
  });
});