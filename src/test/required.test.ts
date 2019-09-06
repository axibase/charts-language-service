import { deepStrictEqual } from "assert";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";
import { Test } from "./test";

suite("Required settings for sections - simple cases", () => {

    test("Correct: required settings are in current section", () => {
        const config = `[configuration]
   [group]
   [widget]
   type = chart
   [series]
   entity = hello
   metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: required setting is in parent section", () => {
        const config = `[configuration]
   [group]
   [widget]
   type = chart
   entity = hello
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: required setting is in grandparent section", () => {
        const config = `[configuration]
        [group]
   entity = hello
[widget]
   type = chart
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: required setting is in greatgrandparent section", () => {
        const config = `[configuration]
   entity = hello
[group]
[widget]
   type = chart
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: required setting is in greatgrandparent section after empty line", () => {
        const config = `[configuration]

   entity = hello
[group]
[widget]
   type = chart
   [series]
       metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Incorrect: several required settings are not declared", () => {
        const config = `[configuration]
   [group]
   [widget]
   type = chart
[series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required"),
            createDiagnostic(createRange("[".length, "series".length, 4), "metric is required")
        ], `Config: \n${config}`);
    });

    test("Incorrect: required setting is not declared in tree (one branch)", () => {
        const config = `[configuration]
   [group]
   [widget]
   type = chart
[series]
   metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required")
        ], `Config: \n${config}`);
    });

    test("Incorrect: required setting is not declared in current tree branch", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
       entity = hello
       [series]
           metric = hello

   [widget]
   type = chart
[series]
           metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [
            createDiagnostic(createRange("[".length, "series".length, 10), "entity is required")
        ], `Config: \n${config}`);
    });

    test("Incorrect: required setting is not declared in both tree branches", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
[series]
           metric = hello

   [widget]
   type = chart
[series]
    entity = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [
            createDiagnostic(createRange("[".length, "series".length, 4), "entity is required"),
            createDiagnostic(createRange("[".length, "series".length, 9), "metric is required")
        ], `Config: \n${config}`);
    });

    test("Correct: setting is specified in if statement", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
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
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    /**
     * Branch handling needs proper support.
     * @see https://github.com/axibase/charts-language-service/issues/44
     * @see https://github.com/axibase/charts-language-service/issues/47
     */
    test.skip("Incorrect: setting is specified only in if-elseif statements", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
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
        deepStrictEqual(actualDiagnostics, [
            createDiagnostic(createRange("[".length, "series".length, 6), "entity is required")
        ], `Config: \n${config}`);
    });

    test("Correct: only value is required for derived series", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
[series]
  entity = server
  metric = cpu_busy
  alias = srv
[series]
  value = value('srv')`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: entities instead of entity", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
[series]
  entities = server
  metric = cpu_busy`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: entity-expression instead of entity", () => {
        const config = `[configuration]
        [group]
   [widget]
   type = chart
[series]
  entity-expression = server*
  metric = cpu_busy`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: table and attribute are declared in a grandparent section", () => {
        const config = `[configuration]
  table = abc
  attribute = cde
[group]
  [widget]
    type = calendar
    [series]
      entity = ent1`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: common entity in group", () => {
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
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

});

suite("Required settings for sections - specific cases", () => {
    suite("[series] declared inside if", () => {

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
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
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
    endif
    `;
            const validator = new Validator(config);
            const actualDiagnostics = validator.lineByLine();
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
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
            deepStrictEqual(actualDiagnostics, [
                createDiagnostic(
                    createRange("[".length, "series".length, 5), "metric is required")
            ], `Config: \n${config}`);
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
            deepStrictEqual(actualDiagnostics, [
                createDiagnostic(
                    createRange("[".length, "series".length, 5), "metric is required")
            ], `Config: \n${config}`);
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
    endif
    `;
            const validator = new Validator(config);
            const actualDiagnostics = validator.lineByLine();
            deepStrictEqual(actualDiagnostics, [
                createDiagnostic(
                    createRange("[".length, "series".length, 5), "metric is required")
            ], `Config: \n${config}`);
        });
    });

    suite("no duplicate errors with [tags]", () => {
        test("[tags] at EOF in [widget] without type", () => {
            const config = `[configuration]
    entity = atsd
    metric = a
  [group]
[widget]
    [tags]
      host = *
      `;
            const validator = new Validator(config);
            const actualDiagnostics = validator.lineByLine();
            deepStrictEqual(actualDiagnostics, [
                createDiagnostic(
                    createRange("[".length, "widget".length, 4),
                    "Required section [series] is not declared."),
                createDiagnostic(
                    createRange("[".length, "widget".length, 4), "type is required")
            ],
                `Config: \n${config}`);
        });

        test("[tags] in [widget] without type", () => {
            const config = `[configuration]
    entity = atsd
    metric = a
  [group]
[widget]
    [tags]
      host = *
  [series]`;
            const validator = new Validator(config);
            const actualDiagnostics = validator.lineByLine();
            deepStrictEqual(actualDiagnostics, [
                createDiagnostic(
                    createRange("[".length, "widget".length, 4), "type is required")
            ],
                `Config: \n${config}`);
        });
    });

    suite("change-field value contains metric", () => {

        test("Correct: no metric is required - dropdown is before series", () => {
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
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
        });

        test("Correct: no metric is required - dropdown is after series", () => {
            const config = `[configuration]
    entity = atsd
  [group]
    [widget]
      type = chart
  [series]
  [dropdown]
    change-field = metric`;
            const validator = new Validator(config);
            const actualDiagnostics = validator.lineByLine();
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
        });
    });

    suite("UDF settings", () => {
        test("Incorrect: evaluate-expression is missing", () => {
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
            deepStrictEqual(actualDiagnostics, [expectedDiagnostic], `Config: \n${config}`);
        });

        test("Correct: evaluate-expression is present", () => {
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
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
        });

        test("Correct: expr block is present", () => {
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
            deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
        });
    });
});
