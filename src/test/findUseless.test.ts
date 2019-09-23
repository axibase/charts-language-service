import { deepStrictEqual } from "assert";
import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { uselessScope } from "../messageUtil";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

interface NegativeStyleTestCase {
  expected: Diagnostic[];
  mode?: string;
  type: string;
}

suite("Validator for negative-style setting", () => {
  const testCases: NegativeStyleTestCase[] = [
    {
      expected: [],
      mode: "column",
      type: "chart"
    },
    {
      expected: [],
      mode: "column-stack",
      type: "chart"
    },
    {
      expected: [
        createDiagnostic(Range.create(Position.create(7, 0),
          Position.create(7, "negative-style".length)),
          uselessScope("negative-style",
            "mode is one of column-stack, column"),
          DiagnosticSeverity.Warning)
      ],
      mode: "stack",
      type: "chart"
    },
    {
      expected: [],
      type: "chart"
    },
  ];

  testCases.forEach(tCase => {
    test(`should allowed setting for chart widget in ${tCase.mode} mode with type = ${tCase.type}`, () => {
      const config = `[configuration]
      metric = a
      entity = b
    [group]
      [widget]
        ${tCase.mode ? `mode = ${tCase.mode}` : ""}

negative-style = fill: magenta
        type = ${tCase.type}
        [series]`;
      const validator = new Validator(config);
      deepStrictEqual(validator.lineByLine(), tCase.expected,
        `Should not raise warnings for type ${tCase.type}, mode ${tCase.mode}.\n Config: ${config}`);
    });
  });

  testCases.forEach(tCase => {
    test(`should allowed setting for chart widget in ${tCase.mode} mode with type = ${tCase.type}`, () => {
      const config = `[configuration]
      metric = a
      entity = b
    [group]
      [widget]
        type = ${tCase.type}
        ${tCase.mode ? `mode = ${tCase.mode}` : ""}
negative-style = fill: magenta
        [series]`;
      const validator = new Validator(config);
      deepStrictEqual(validator.lineByLine(), tCase.expected,
        `Should not raise warnings for type ${tCase.type}, mode ${tCase.mode}.\n Config: ${config}`);
    });
  });

  testCases.forEach(tCase => {
    test(`should allowed setting for chart widget in ${tCase.mode} mode with type = ${tCase.type}`, () => {
      const config = `[configuration]
      metric = a
      entity = b
    [group]
      [widget]


negative-style = fill: magenta
        type = ${tCase.type}
        ${tCase.mode ? `mode = ${tCase.mode}` : ""}
        [series]`;
      const validator = new Validator(config);
      deepStrictEqual(validator.lineByLine(), tCase.expected,
        `Should not raise warnings for type ${tCase.type}, mode ${tCase.mode}.\n Config: ${config}`);
    });
  });
});

const treemapConfig = (setting: string, condition: string = "") => `[configuration]
[group]
[widget]
  type = treemap
  ${condition}
  ${setting}
[series]
  metric = a
  entity = b`;

suite("Treemap useless settings tests", () => {
  test("Incorrect: 'size-name' is useless if 'display-total' is false", () => {
    const config = treemapConfig("size-name = Memory in Server", "display-total = false");
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = [
      createDiagnostic(
        createRange(2, 9, 5),
        "size-name setting is applied only if display-total is true.",
        DiagnosticSeverity.Warning,
      )
    ];
    deepStrictEqual(actualDiagnostics, expectedDiagnostic);
  });

  test("Incorrect: 'format-size' is useless if 'display-total' is false", () => {
    const config = treemapConfig("format-size = kilobytes", "display-total = false");
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = [
      createDiagnostic(
        createRange(2, 11, 5),
        "format-size setting is applied only if display-total is true.",
        DiagnosticSeverity.Warning,
      )
    ];
    deepStrictEqual(actualDiagnostics, expectedDiagnostic);
  });

  test("Correct: 'format-size' is not useless, 'display-total' is true by default", () => {
    const config = treemapConfig("format-size = kilobytes");
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = [];
    deepStrictEqual(actualDiagnostics, expectedDiagnostic);
  });

  test("Incorrect: useless 'size-name' because 'display-total' is disabled", () => {
    const config = treemapConfig("size-name = memory", "display-total = false");
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = [
      createDiagnostic(
        createRange(2, 9, 5),
        `size-name setting is applied only if display-total is true.`,
        DiagnosticSeverity.Warning
      )
    ];
    deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
  });

  test("Correct: 'size-name' is not useless because 'display-total = true' by default", () => {
    const config = treemapConfig("size-name = memory");
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = [];
    deepStrictEqual(actualDiagnostics, expectedDiagnostic, `Config: \n${config}`);
  });
});
