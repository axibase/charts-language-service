import { deepStrictEqual } from "assert";
import * as assert from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Requirements for [series]: simple cases", () => {
    test("Correct: entity is not required if change-field = entity or series.entity", () => {
        let config = `[configuration]
metric = b
[group]
[widget]
  type = chart
  [series]
  [dropdown]
    change-field = entity
`;
        let validator = new Validator(config);
        const expected = [];
        let actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        config = `[configuration]
metric = b
[group]
[widget]
  type = chart
  [series]
  [dropdown]
    change-field = series.entity
`;
        validator = new Validator(config);
        actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Correct: metric is not required if change-field = metric or series.metric", () => {
        const config = `[configuration]
    entity = atsd
  [group]
    [widget]
      type = chart
  [dropdown]
    change-field = metric
  [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect: entity is required if change-field != entity and != series.entity", () => {
        const config = `[configuration]
metric = b
[group]
[widget]
  type = chart
[series]
  [dropdown]
    change-field = sahgdh.entity
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 5), "entity is required")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Correct: only 'value' is required, if [series] is derived", () => {
        let config = `[configuration]
[group]
[widget]
  type = chart
  [series]
 value = 100
`;
        let validator = new Validator(config);
        const expected = [];
        let actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect: entity and metric are required", () => {
        const config = `[configuration]
[group]
[widget]
  type = chart
[series]
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required"),
            createDiagnostic(createRange("[".length, "series".length, 4), "metric is required")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
});

suite("[series] declared inside if", () => {
    test("Correct: metric and entity are declared in [series], no [tags]", () => {
        const config = `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
        [series]
          entity = a
          metric = b
    endif`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct: metric and entity are declared in [series] with [tags]", () => {
        const config = `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
        [series]
          entity = a
          metric = b
          [tags]
              a = b
    endif`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect: no metric, no [tags]", () => {
        const config = `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
   entity = a
    endif`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 5), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect: no metric, [tags] at EOF - expected one error", () => {
        const config = `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
          entity = a
        [tags]
          a = b
    endif`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 5), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect: no metric, [tags] - expected one error", () => {
        const config = `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
          entity = a
        [tags]
          a = b
    endif`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 5), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
