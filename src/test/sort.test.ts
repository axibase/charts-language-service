import assert = require("assert");
import { Diagnostic } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string, type: string = "chart") => `[configuration]
  entity = d
  metric = t

[group]

  [widget]
    type = ${type}
    ${setting}
    [series]`;

suite("Correct sort value", () => {
    test("SORT_ORDER emitted", () => {
        const config = baseConfig("sort = value");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("sort_value emitted", () => {
        const config = baseConfig("sort = ASC");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("both SORT_ORDER and sort_value are declared", () => {
        const config = baseConfig("sort = value ASC");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Multiple conditions", () => {
        const config = baseConfig("sort = value1 ASC, value2 DESC");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Multiple incomplete conditions", () => {
        const config = baseConfig("sort = value1 ASC, value2");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct interval syntax", () => {
        const config = baseConfig("sort = sum(5 minute)", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct interval syntax, single quotes", () => {
        const config = baseConfig("sort = sum('5 minute')", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct interval syntax, double quotes", () => {
        const config = baseConfig("sort = sum(\"5 minute\")", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct calendar sort by name", () => {
        const config = baseConfig("sort = name", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct calendar sort, name and order", () => {
        const config = baseConfig("sort = name ASC", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});

suite("Incorrect sort value", () => {
    test("Wrong sort order", () => {
        const config = baseConfig("sort = value ASCE");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. Replace with 'value, asce' or 'value [ASC|DESC]'"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Wrong sort value, no separating commas", () => {
        const config = baseConfig("sort = not valid");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. Replace with 'not, valid' or 'not [ASC|DESC]'"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect statistic function for calendar", () => {
        const config = baseConfig("sort = test(5 minute) ", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Unknown stat function: test \n" +
                "Supported statistic functions:\n * sum\n * min\n * max\n * avg\n * first\n * last"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect time units in statistic function", () => {
        const config = baseConfig("sort = max(5 hello) ", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Unknown interval unit: hello \nSupported units:\n * nanosecond\n * millisecond\n" +
                " * second\n * sec\n * minute\n * min\n * hour\n * day\n * week\n * month\n * quarter\n * year"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect statistic function and time units", () => {
        const config = baseConfig("sort = test(5 hello) ", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Unknown stat function: test \nSupported statistic functions:\n * sum\n * min\n" +
                " * max\n * avg\n * first\n * last\nUnknown interval unit: hello \nSupported units:\n" +
                " * nanosecond\n * millisecond\n * second\n * sec\n * minute\n * min\n * hour\n * day\n" +
                " * week\n * month\n * quarter\n * year"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect numeric value format in time units", () => {
        const config = baseConfig("sort = max(5 8 hello) ", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Unknown interval unit: 8 \nSupported units:\n * nanosecond\n * millisecond\n * second\n" +
                " * sec\n * minute\n * min\n * hour\n * day\n * week\n * month\n * quarter\n * year"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Statistic function in 'box' widget, (allowed only in calendar)", () => {
        const config = baseConfig("sort = max(5 hour) ", "box");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax for widget type 'box'. 'max(5 hour)' doesn't match 'value ASC|DESC' schema"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect sort by name in calendar", () => {
        const config = baseConfig("sort = value ASC", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. Replace with 'name' or 'name [ASC|DESC]'"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect sort by name (multiple values) in calendar", () => {
        const config = baseConfig("sort = value ASC, val DESC", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. Replace with 'name' or 'name [ASC|DESC]'"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Incorrect calendar sort, value instead of name", () => {
        const config = baseConfig("sort = value ASC", "calendar");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. Replace with 'name' or 'name [ASC|DESC]'"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
