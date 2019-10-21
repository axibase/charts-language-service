import assert = require("assert");
import { Diagnostic } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string) => `[configuration]
  entity = d
  metric = t

[group]

  [widget]
    type=chart
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
});

suite("Incorrect sort value", () => {
    test("Wrong sort order", () => {
        const conf = baseConfig("sort = value ASCE");
        const validator = new Validator(conf);
        const actual: Diagnostic[] = validator.lineByLine();
        const expected: Diagnostic[] = [
            createDiagnostic(
                createRange(4, 4, 8),
                "'value asce' is not valid 'sort' setting value"
            )
        ];
        assert.deepStrictEqual(expected, actual, `Config: \n${conf}`);
    });
});