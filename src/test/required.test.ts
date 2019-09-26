import { deepStrictEqual } from "assert";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";
import { Test } from "./test";

suite("Required settings for sections tests", () => {
  const tests: Test[] = [
    new Test(
      "correct series without parent section",
      `[series]
   entity = hello
   metric = hello`,
      [],
    ),
    new Test(
      "incorrect series without parent categories",
      `[series]
   metric = hello`,
      [
        createDiagnostic(
          Range.create(Position.create(0, "[".length), Position.create(0, "[".length + "series".length)),
          "entity is required",
        )],
    ),
    new Test(
      "correct series with parent section",
      `[widget]
   type = chart
   entity = hello
   [series]
       metric = hello`,
      [],
    ),
    new Test(
      "correct series with grandparent section",
      `[group]
   entity = hello
[widget]
   type = chart
   [series]
       metric = hello`,
      [],
    ),
    new Test(
      "correct series with greatgrandparent section",
      `[configuration]
   entity = hello
[group]
[widget]
   type = chart
   [series]
       metric = hello`,
      [],
    ),
    new Test(
      "correct series with greatgrandparent section and empty line",
      `[configuration]

   entity = hello
[group]
[widget]
   type = chart
   [series]
       metric = hello`,
      [],
    ),
    new Test(
      "incorrect series with closed parent section",
      `[group]
   type = chart
   [widget]
       entity = hello
       [series]
           metric = hello

   [widget]
       [series]
           metric = hello`,
      [
        createDiagnostic(
          Range.create(Position.create(8, "       [".length), Position.create(8, "       [series".length)),
          "entity is required",
        )],
    ),
    new Test(
      "two incorrect series without parent categories",
      `[series]
   metric = hello
[series]
   entity = hello`,
      [
        createDiagnostic(
          Range.create(Position.create(0, "[".length), Position.create(0, "[".length + "series".length)),
          "entity is required",
        ),
        createDiagnostic(
          Range.create(Position.create(2, "[".length), Position.create(2, "[".length + "series".length)),
          "metric is required",
        )],
    ),
    new Test(
      "A setting is specified in if statement",
      `list servers = vps, vds
for server in servers
   [series]
       metric = cpu_busy
       if server == 'vps'
           entity = vds
       else
           entity = vps
       endif
endfor`,
      [],
    ),
    new Test(
      "A setting is specified only in if-elseif statements",
      `list servers = vps, vds
for server in servers
   [series]
       metric = cpu_busy
       if server == 'vps'
           entity = vds
       elseif server = 'vds'
           entity = vps
       endif
endfor`,
      [
        createDiagnostic(
          Range.create(Position.create(2, "   [".length), Position.create(2, "   [".length + "series".length)),
          "entity is required",
        )],
    ),
    new Test(
      "Derived series",
      `[series]
  entity = server
  metric = cpu_busy
  alias = srv
[series]
  value = value('srv')`,
      [],
    ),
    new Test(
      "Entities instead of entity",
      `[series]
  entities = server
  metric = cpu_busy`,
      [],
    ),
    new Test(
      "Do not raise error if both column-metric and column-value are null",
      `list lpars = abc, cde, efg
[widget]
  type = table
  column-metric = null
  column-value = null
  [series]
    entity = @{lpar}`,
      [],
    ),
    new Test(
      "Raise error if column-metric is not null",
      `list lpars = abc, cde, efg
[widget]
  type = table
  column-metric = undefined
  column-value = null
  [series]
    entity = @{lpar}`,
      [
        createDiagnostic(
          Range.create(5, "  [".length, 5, "  [".length + "series".length),
          "metric is required",
        )],
    ),
    new Test(
      "Raise error if column-value is not specified",
      `list lpars = abc, cde, efg
[widget]
  type = table
  column-metric = null
  [series]
    entity = @{lpar}`,
      [
        createDiagnostic(
          Range.create(4, "  [".length, 4, "  [".length + "series".length),
          "metric is required",
        )],
    ),
    new Test(
      "Correct handling of complex configuration",
      `[configuration]
  entity = \${entity}
  [series]
    metric = nmon.processes.asleep_diocio
[widget]
  type = table
  metric = nmon.jfs_filespace_%used
  [series]`,
      [],
    ),
    new Test(
      "Table and attribute are declared in a grandparent section",
      `[configuration]
  table = abc
  attribute = cde
[group]
  [widget]
    type = calendar
    [series]
      entity = ent1`,
      [],
    ),
    new Test(
      "Allow entity-expression as an alternative to entity",
      `[configuration]
      width-units = 6.2
[group]
  [widget]
    type = chart
    [series]
      entity-expression = entity-1, e-2
      metric = metric-1`,
      [],
    ),
  ];

  tests.forEach((test: Test) => {
    test.validationTest();
  });

});

suite("Required: [series] declared inside if", () => {
  new Test("Correct: metric and entity are declared in [series], no [tags]",
    `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
        [series]
          entity = a
          metric = b
    endif`, []).validationTest();

  new Test("Correct: metric and entity are declared in [series] with [tags]",
    `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
        [series]
          entity = a
          metric = b
          [tags]
              a = b
    endif
    `, []).validationTest();

  new Test("Incorrect: no metric, no [tags]",
    `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
          entity = a
    endif`, [
    createDiagnostic(
      Range.create(5, 1, 5, "series]".length),
      "metric is required",
    )]).validationTest();

  new Test("Incorrect: no metric, [tags] at EOF - expected one error",
    `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
          entity = a
        [tags]
          a = b
    endif`, [
    createDiagnostic(
      Range.create(5, 1, 5, "series]".length),
      "metric is required",
    )]).validationTest();

  new Test("Incorrect: no metric, [tags] - expected one error",
    `[configuration]
    [group]
      [widget]
        type = bar
    if "a" == "a"
[series]
          entity = a
        [tags]
          a = b
    endif
    `, [
    createDiagnostic(
      Range.create(5, 1, 5, "series]".length),
      "metric is required",
    )]).validationTest();
});

suite("Required: No metric is required if change-field value contains \"metric\"", () => {
  new Test("Correct, no errors shoud be raised",
    `[configuration]
    entity = atsd
  [group]
    [widget]
      type = chart
  [dropdown]
    change-field = metric
  [series]`, []).validationTest();
});

suite("Required: No duplicate errors with [tags]", () => {
  new Test("[tags] at EOF in [widget] without type",
    `[widget]
    [tags]
      host = *
      `, [
    createDiagnostic(
      Range.create(0, 1, 0, "widget]".length),
      "type is required",
    )]).validationTest();

  new Test("[tags] in [widget] without type",
    `[widget]
    [tags]
      host = *`, [createDiagnostic(
      Range.create(0, 1, 0, "widget]".length),
      "type is required",
    )]).validationTest();
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
      DiagnosticSeverity.Error,
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
        DiagnosticSeverity.Error,
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
