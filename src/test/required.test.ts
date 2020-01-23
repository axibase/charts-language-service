import { deepStrictEqual } from "assert";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Required settings for sections tests", () => {
    test("Correct series without parent settings", () => {
        const config = `[configuration]
[group]
  [widget]
    type = chart
    [series]
   entity = hello
   metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect series without parent settings", () => {
        const config = `[configuration]
[group]
  [widget]
    type = chart
[series]
   metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct series with parent section", () => {
        const config = `[configuration]
[group]
  [widget]
   type = chart
   entity = hello
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct series with grandparent section", () => {
        const config = `[configuration]
[group]
   entity = hello
[widget]
   type = chart
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct series with greatgrandparent section and empty line", () => {
        const config = `[configuration]
   entity = hello
[group]
[widget]
   type = chart
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect series with closed parent section", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
       entity = hello
       [series]
           metric = hello

   [widget]
[series]
           metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 9), "entity is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Two incorrect series without parent categories", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
[series]
   metric = hello
[series]
   entity = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required"),
            createDiagnostic(createRange("[".length, "series".length, 6), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Setting is specified in if statement", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
list servers = vps, vds
for server in servers
   [series]
       metric = cpu_busy
       if server == 'vps'
           entity = vds
       else
           entity = vps
       endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Setting is specified only in if-elseif statements", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
list servers = vps, vds
for server in servers
[series]
       metric = cpu_busy
       if server == 'vps'
           entity = vds
       elseif server = 'vds'
           entity = vps
       endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 6), "entity is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Derived series", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
[series]
  entity = server
  metric = cpu_busy
  alias = srv
[series]
  value = value('srv')`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Entities instead of entity", () => {
        const config = `[configuration]
[group]
   type = chart
   [widget]
[series]
  entities = server
  metric = cpu_busy`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Do not raise error if both column-metric and column-value are null", () => {
        const config = `[configuration]
[group]
   type = chart
[widget]
  type = table
  column-metric = null
  column-value = null
  [series]
    entity = a`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Raise error if column-metric is not null", () => {
        const config = `[configuration]
[group]
   type = chart
[widget]
  type = table
  column-metric = undefined
  column-value = null
[series]
    entity = a`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 7), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Raise error if column-value is not specified", () => {
        const config = `[configuration]
[group]
   type = chart
[widget]
  type = table
  column-metric = null
[series]
    entity = a`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 6), "metric is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct handling of complex configuration", () => {
        const config = `[configuration]
[group]
  entity = \${entity}
[widget]
  type = table
  [series]
    metric = nmon.processes.asleep_diocio
[widget]
  type = table
  metric = nmon.jfs_filespace_%used
  [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Allow entity-expression as an alternative to entity", () => {
        const config = `[configuration]
      width-units = 6.2
[group]
  [widget]
    type = chart
    [series]
      entity-expression = entity-1, e-2
      metric = metric-1`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});

suite("Required: [series] declared inside if", () => {
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

suite("Required: No metric is required if change-field value contains \"metric\"", () => {
    test("Correct, no errors should be raised", () => {
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
});

suite("Required: No duplicate errors with [tags]", () => {
    test("[tags] at EOF in [widget] without type", () => {
        const config = `[configuration]
    entity = atsd
    metric = b
  [group]
[widget]
[series]
    [tags]
      host = *`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "widget".length, 4), "type is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("[tags] in [widget] without type", () => {
        const config = `[configuration]
    entity = atsd
    metric = b
  [group]
[widget]
    [tags]
      host = *
  [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "widget".length, 4), "type is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});

suite("UDF settings tests", () => {
    test("Required evaluate-expression is missing", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  metrics = c, d, e`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = createDiagnostic(
                Range.create(Position.create(6, 19), Position.create(6, 25)),
                "If metrics is specified, either evaluate-expression or expr block is required",
                DiagnosticSeverity.Error
        );
        deepStrictEqual(actualDiagnostics, [expectedDiagnostic]);
    });

    test("No error: evaluate-expression is present", () => {
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
        deepStrictEqual(actualDiagnostics, []);
    });

    test("No error: expr block is present", () => {
        const config = `[configuration]
          [group]
          [widget]
              type = chart
              metric = a
              [column]
                  [series]
                  entity = b
                  metrics = c, d, e
                  expr
                    c LIKE 'cpu*'
                  endexpr`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
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

suite("Treemap required settings tests", () => {
    test("Incorrect: 'gradient-count' is specified, but required 'thresholds' is missing", () => {
        const config = treemapConfig("gradient-count = 2");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                    createRange(5, 6, 6),
                    "thresholds is required if gradient-count is specified",
                    DiagnosticSeverity.Error
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Correct: both 'gradient-count' and 'thresholds' are specified", () => {
        const config = treemapConfig("gradient-count = 2", "thresholds = 0, 10, 25");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });
});

const textWidgetConfig = (setting: string, condition: string = "") => `[configuration]
[group]
[widget]
    type = text
    metric = a
    entity = b
    [series]
      icon = 'server_black_04.svg'
      ${condition}
      ${setting}`;

suite("Text widget required settings tests", () => {
    test("Incorrect: icon-color is missing", () => {
        const config = textWidgetConfig("icon-alert-style = fill: red;", `alert-expression = value > 60`);
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                    createRange(5, 6, 6),
                    "Set icon-color to apply the same color to series icons when alert is off.",
                    DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Incorrect: 'alert-expression' and 'icon-color' are missing", () => {
        const config = textWidgetConfig("icon-alert-style = fill: red;");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                    createRange(5, 6, 6),
                    "Set icon-color to apply the same color to series icons when alert is off.",
                    DiagnosticSeverity.Warning
            ),
            createDiagnostic(
                    createRange(6, 16, 9),
                    "alert-expression is required if icon-alert-style is specified"
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });
});
