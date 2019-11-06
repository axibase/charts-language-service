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
});

suite("Incorrect sort value", () => {
    test("Wrong sort order", () => {
        const config = baseConfig("sort = value ASCE");
        const validator = new Validator(config);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Incorrect syntax. 'value asce' doesn't match 'value asc|desc' schema"
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
                "Incorrect syntax. 'not valid' doesn't match 'value asc|desc' schema"
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
                "Unknown stat function: test"
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
                "Unknown interval unit: hello"
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
                "Unknown stat function: test. Unknown interval unit: hello"
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
                "Unknown interval unit: 8"
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
                "Incorrect syntax. 'max(5 hour)' doesn't match 'value asc|desc' schema"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
