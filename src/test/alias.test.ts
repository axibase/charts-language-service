import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (addition: string) => `[configuration]
[group]
  [widget]
      type = chart
        ${addition}`;

suite("Incorrect dealias tests", () => {
  test("One alias, one correct dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = s1
  [series]
    metric = temp
    entity = srv
    value = value('s1') * 2`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("One alias, one incorrect dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = s1
  [series]
    metric = temp
    entity = srv
    value = value('s2') * 2`);
    const validator = new Validator(config);
    const expected = [
      createDiagnostic(
        createRange(19, 2, 11),
        "s2 is unknown."
      )
    ];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("One alias, one correct dealias before the declaration", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    value = value('s1') * 2
  [series]
    metric = temp
    entity = srv
    alias = s1`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("One alias, two incorrect dealiases", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = s1
  [series]
    metric = temp
    entity = srv
    value = value('s2') * 2
  [series]
    metric = temp
    entity = srv
    value = value('s3') * 2`);
    const validator = new Validator(config);
    const expected = [
      createDiagnostic(
        createRange(19, 2, 11),
        "s2 is unknown."
      ),
      createDiagnostic(
        createRange(19, 2, 15),
        "s3 is unknown."
      )
    ];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Two aliases, two correct dealiases", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = s1
  [series]
    metric = temp
    entity = srv
    alias = s2
  [series]
    metric = temp
    entity = srv
    value = value('s1') * 2
  [series]
    metric = temp
    entity = srv
    value = value('s2') * 2`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Two aliases, one incorrect dealias. one correct dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = s1
  [series]
    metric = temp
    entity = srv
    alias = s2
  [series]
    metric = temp
    entity = srv
    value = value('s3') * 2
  [series]
    metric = temp
    entity = srv
    value = value('s2') * 2`);
    const validator = new Validator(config);
    const expected = [
      createDiagnostic(
        createRange(19, 2, 15),
        "s3 is unknown."
      )
    ];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Declared series, indents are used, correct alias and dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = src
  [series]
    metric = temp
    entity = srv
    value = value('src')`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Derived series, indents are used, correct alias and dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = src
  [series]
    metric = temp
    entity = srv
    alias = free
  [series]
    metric = temp
    entity = srv
    value = value('src') - value('free')
  [series]
    metric = temp
    entity = srv`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Derived series, indents are used, correct alias and incorrect dealias", () => {
    const config = baseConfig(`[series]
    metric = temp
    entity = srv
    alias = src
  [series]
    metric = temp
    entity = srv
    alias = free
  [series]
    metric = temp
    entity = srv
    value = value('sc') - value('free')
  [series]
    metric = temp
    entity = srv`);
    const validator = new Validator(config);
    const expected = [
      createDiagnostic(
        createRange(19, 2, 15),
        "sc is unknown."
      )
    ];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Two de-aliases per string without spaces", () => {
    const config = baseConfig(`[series]
    entity = @{server}
    metric = cpu_busy
    alias = avail_cpu_pool

  [series]
    entity = @{server}
    metric = cpu_busy
    alias = cpu_total

  [series]
    entity = @{server}
    value = (value('avail_cpu_pool')*100)/(value('cpu_total'))`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Alias of previously declared series", () => {
    const config = `[configuration]
[group]
  [widget]
    type = bar
    entity  = 123
    [series]
      metric = linux.disk.fs.space_used
      alias = used
    [series]
      metric = linux.disk.fs.space_free
      alias = free
      alert-expression = value('free')/value('used') < 0.1/0.9`;
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("Missing alias with same name as setting `value =`", () => {
    const config = baseConfig(`[series]
    entity = @{server}
    metric = cpu_busy
    alias = avail_cpu_pool

  [column]
    key = LogValue via value
    value = Math.log(value('value'))`);
    const validator = new Validator(config);
    const expected = [
      createDiagnostic(
        createRange(28, 5, 11),
        "value is unknown."
      )
    ];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });

  test("No alias check in non-script setting", () => {
    const config = baseConfig(`[series]
    entity = @{server}
    metric = cpu_busy
    title = size = value('alias')`);
    const validator = new Validator(config);
    const expected = [];
    const actual = validator.lineByLine();
    deepStrictEqual(actual, expected, `Config: \n${config}`);
  });
});
