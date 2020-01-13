import * as assert from "assert";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("string[] type tests", () => {
    test("Commas are missing", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c d e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = createDiagnostic(
                Range.create(Position.create(9, 18), Position.create(9, 25)),
                "metrics should be a comma separated list. For example, disk_used, memused",
                DiagnosticSeverity.Error
        );
        assert.deepStrictEqual(actualDiagnostics, [expectedDiagnostic]);
    });

    test("Some commas are missing", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c, d e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = createDiagnostic(
                Range.create(Position.create(9, 18), Position.create(9, 25)),
                "metrics should be a comma separated list. For example, disk_used, memused",
                DiagnosticSeverity.Error
        );
        assert.deepStrictEqual(actualDiagnostics, [expectedDiagnostic]);
    });

    test("Correct setting of string[] type, no spaces", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c,d,e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        assert.deepStrictEqual(actualDiagnostics, []);
    });

    test("Correct setting of string[] type with spaces", () => {
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
        assert.deepStrictEqual(actualDiagnostics, []);
    });

    test("Correct setting of string[], single value", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        assert.deepStrictEqual(actualDiagnostics, []);
    });

    test("Correct setting of string[] type, some spaces are missing", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c,d, e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        assert.deepStrictEqual(actualDiagnostics, []);
    });

    test("Incorrect setting of string[] type, some items are empty", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  evaluate-expression = c LIKE 'cpu*'
                  metrics = c,d, , e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = createDiagnostic(
                createRange(18, 7, 9),
                "metrics can not contain empty elements",
                DiagnosticSeverity.Error
        );
        assert.deepStrictEqual(actualDiagnostics, [expectedDiagnostic]);
    });
});
