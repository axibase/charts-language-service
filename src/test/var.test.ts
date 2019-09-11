import { deepStrictEqual } from "assert";
import { Position, Range } from "vscode-languageserver-types";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string) => `[configuration]
[group]
  [widget]
    type = chart
    [series]
      metric = a
      entity = b
      ${setting}`;

suite("Var endvar tests", () => {

    test("Correct one line var array", () => {
        const config = baseConfig("var v = [[9,3], [9,4]]");
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct one line var props", () => {
        const config = baseConfig('var v = { "hello": "value", "array": ["val", "value"]}');
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct multiline var props", () => {
        const config = baseConfig(`var v = {
                    "hello": "value",
                    "array": ["val", "value"]
                 }
                 endvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct multiline var array", () => {
        const config = baseConfig(`var v = [
                [9,3], [9,4]
            ]
            endvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect multiline var array", () => {
        const config = baseConfig(`var v = [
            [9,3], [9,4]
        ]
        edvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(6, 3, 7),
                "var has no matching endvar",
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect multiline var props", () => {
        const config = baseConfig(`var v = {
            "hello": "value",
            "array": ["val", "value"]
         }
         edvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(6, 3, 7),
                "var has no matching endvar",
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect multiline var mixed array of props", () => {
        const config = baseConfig(`var v = [
            { "hello": "value" },
            { "array": ["val", "value"] }
         ]
         edvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(6, 3, 7),
                "var has no matching endvar",
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct var function call", () => {
        const config = baseConfig('var v = getEntities("hello")');
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Correct multiline var: bracket next line", () => {
        const config = baseConfig(`var v =
        [
            "a"
            "b",
            "c"
        ]
        endvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Incorrect multiline var: no open var, bracket next line", () => {
        const config = baseConfig(`v =
        [
            "a"
            "b",
            "c"
        ]
        endvar`);
        const validator = new Validator(config);
        const actualDiagnostic = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(8, 6, 13),
                "endvar has no matching var",
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });
});

suite("Var formatting tests", () => {
    test("Incorrect multiline var: wrong endvar indent, bracket same line", () => {
        const text = `var data = [
  "a",
  "b",
  ]
    endvar

`;
        const expected = `var data = [
  "a",
  "b",
  ]
endvar

`;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Incorrect multiline var: wrong endvar indent, bracket next line", () => {
        const text = `var data =
[
"a",
"b",
]
    endvar

`;
        const expected = `var data =
  [
  "a",
  "b",
  ]
endvar

`;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Correct multiline var: bracket next line", () => {
        const text = `var data =
  [
  "a",
  "b",
  ]
endvar

`;
        const expected = text;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Correct multiline var: parenthesis next line", () => {
        const text = `var data =
  (
  "a",
  "b",
  )
endvar

`;
        const expected = text;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Correct multiline var: braces next line", () => {
        const text = `var data =
  {
  "a",
  "b",
  }
endvar

`;
        const expected = text;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Correct multiline var: braces same line", () => {
        const text = `var data = {
  "a",
  "b",
  }
endvar

`;
        const expected = text;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });

    test("Incorrect multiline var: extra spaces after '=', braces same line", () => {
        const text = `var data =    {
  "a",
  "b",
  }
endvar

`;
        const expected = `var data = {
  "a",
  "b",
  }
endvar

`;
        const formatter = new Formatter(FORMATTING_OPTIONS);
        const actual = formatter.format(text);
        deepStrictEqual(actual, expected);
    });
});
