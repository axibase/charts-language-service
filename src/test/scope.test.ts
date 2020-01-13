import * as assert from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Correct value depends on scope", () => {
    test("Correct: setting is declared in [group], scope is unknown", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = table
  [series]
[group]
  step-line = false
[widget]
  type = histogram
  [series]
`;
        const validator = new Validator(config);
        const expected = [];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Correct: horizontal-grid = density for histogram", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = histogram
  horizontal-grid = density
  [series]
`;
        const validator = new Validator(config);
        const expected = [];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Correct: horizontal-grid = false for chart", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = chart
  horizontal-grid = false
  [series]
`;
        const validator = new Validator(config);
        const expected = [];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect: class = terminal for box", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = console
  class = terminal
  [series]
[widget]
  type = box
  class = terminal
  [series]
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "class".length, 10), "class must be one of:\n * metro")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect: horizontal-grid = frequency for chart", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = chart
  horizontal-grid = frequency
  [series]
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "horizontal-grid".length, 6),
                    "horizontal-grid must be one of:\n * false\n * true")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect: horizontal-grid = true for histogram", () => {
        const config = `[configuration]
entity = a
metric = b
[group]
[widget]
  type = histogram
  horizontal-grid = true
  [series]
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "horizontal-grid".length, 6),
                    "horizontal-grid must be one of:\n * density\n * false\n * fractions\n * frequency\n * none")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
});
