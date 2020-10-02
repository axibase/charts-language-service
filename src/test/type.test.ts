import * as assert from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Type check tests", () => {
    test("Correct boolean settings", () => {
        const buildConfig = (value) => {
            return `[configuration]
  add-meta = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["false", "no", "nO", "null", "none", "0", "off", "true", "yes", "yEs", "on", "1"];
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Incorrect boolean setting", () => {
        const buildConfig = (value) => {
            return `[configuration]
  add-meta = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["not", "false true", "OFF 1"];
        const msg = "add-meta should be a boolean value. For example, true";
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [createDiagnostic(createRange("  ".length, "add-meta".length, 1), msg)];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Correct number settings", () => {
        const buildConfig = (value) => {
            return `[configuration]
  arrow-length = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["1", "0", ".3", "0.3", "0.333333333", "30%"];
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Incorrect number setting", () => {
        const buildConfig = (value) => {
            return `[configuration]
  arrow-length = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["false", "5 + 5", "5+51", "5.0 + 5", "5.0+5", "hello5", "hello 5"];
        const msg = "arrow-length should be a real (floating-point) number. For example, 0.3, 30%";
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [createDiagnostic(createRange("  ".length, "arrow-length".length, 1), msg)];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Correct enum settings", () => {
        const config = `[configuration]
  bottom-axis = percentiles
  buttons = update
  case = upper
  counter-position = top
[group]
  [widget]
    type = page
`;
        const validator = new Validator(config);
        const expected = [];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect enum settings", () => {
        const config = `[configuration]
  bottom-axis = percentile
  buttons = updat
  case = uppe
  counter-position = to
[group]
  [widget]
    type = page
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "bottom-axis".length, 1),
                    "bottom-axis must be one of:\n * none\n * percentiles\n * values"),
            createDiagnostic(createRange("  ".length, "buttons".length, 2),
                    "buttons must be one of:\n * menu\n * update"),
            createDiagnostic(createRange("  ".length, "case".length, 3),
                    "case must be one of:\n * lower\n * upper"),
            createDiagnostic(createRange("  ".length, "counter-position".length, 4),
                    "counter-position must be one of:\n * bottom\n * none\n * top")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Correct percentile", () => {
        const config = `[configuration]
  group-statistic = percentile(100)
  statistic = percentile(25.5)
  summarize-statistic = percentile(0)
[group]
  [widget]
    type = page
`;
        const validator = new Validator(config);
        const expected = [];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("Incorrect percentile", () => {
        const buildConfig = (value) => {
            return `[configuration]
  statistic = percentile(${value})
[group]
  [widget]
    type = page
`;
        };
        const values = ["-5", "-0.1", "100.1"];
        const percentileError = (current) => {
            return `n must be a decimal number between [0, 100]. Current: ${current}`;
        };
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [
                createDiagnostic(createRange("  ".length, "statistic".length, 1), percentileError(v))
            ];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Empty settings are not allowed", () => {
        const config = `[configuration]
[group]
[widget]
  type = console
  mode =
  entity =
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "mode".length, 4), "mode must be one of:\n * terminal"),
            createDiagnostic(createRange("  ".length, "entity".length, 5), "entity can not be empty")
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
})
;
