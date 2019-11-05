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
        const conf = baseConfig("sort = value");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("sort_value emitted", () => {
        const conf = baseConfig("sort = ASC");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("both SORT_ORDER and sort_value are declared", () => {
        const conf = baseConfig("sort = value ASC");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("Multiple conditions", () => {
        const conf = baseConfig("sort = value1 ASC, value2 DESC");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("Multiple incomplete conditions", () => {
        const conf = baseConfig("sort = value1 ASC, value2");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("Correct interval syntax", () => {
        const conf = baseConfig("sort = sum(5 minute)", "calendar");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("Correct interval syntax, spaces around parentheses", () => {
        const conf = baseConfig("sort = avg ( 5 minute ) ", "calendar");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });
});

suite("Incorrect sort value", () => {
    test("Wrong sort order", () => {
        const conf = baseConfig("sort = value ASCE");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Correct syntax for 'sort' setting is, for example: 'metric, value desc'"
            )
        ];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    test("Wrong sort value, no separating commas", () => {
        const conf = baseConfig("sort = not valid");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "Correct syntax for 'sort' setting is, for example: 'metric, value desc'"
            )
        ];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });

    /**
     * TODO: make message text more specific
     */
    test.skip("Incorrect statistic function for calendar", () => {
        const conf = baseConfig("sort = test(5 minute) ", "calendar");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });
});
