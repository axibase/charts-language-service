import assert = require("assert");
import { Formatter } from "../formatter";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const base = `[configuration]
entity = d
metric = t

[group]

[widget]
type=chart`;

suite("Validator: SQL tests", () => {
    test("Correct SQL block", () => {
        const conf = `${base}
sql
  SELECT 1
  endsql

[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [], `Config: \n${conf}`);
    });

    test("Incorrect SQL block: no endsql", () => {
        const conf = `${base}
sql
 SELECT 1
endsq

[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [
            createDiagnostic(createRange(1, "widget".length, 6),
                "Required section [series] is not declared."),
            createDiagnostic(createRange(0, "sql".length, 8), `sql has no matching endsql`),
        ], `Config: \n${conf}`);
    });

    test("Incorrect SQL block: no sql", () => {
        const conf = `${base}
sq
 SELECT 1
endsql

[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [
            createDiagnostic(createRange(0, "endsql".length, 10), `endsql has no matching sql`)
        ], `Config: \n${conf}`);
    });

    test("Incorrect SQL block: no linefeed", () => {
        const conf = `${base}
sql SELECT 1
endsql

[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [
            createDiagnostic(createRange(0, "endsql".length, 9), `endsql has no matching sql`),
            createDiagnostic(createRange(0, "sql".length, 8), `A linefeed character after 'sql' keyword is required`)
        ], `Config: \n${conf}`);
    });
});

suite("Formatter: SQL indents tests", () => {
    test("Correct sql indents", () => {
        const config = `  [widget]
    type = chart
    sql = SELECT time, entity, value FROM cpu_busy
    sql = WHERE /* time */ > now - 5 * minute

    [series]

  [widget]
    type = chart

    sql
      SELECT time, entity, value FROM cpu_busy
      WHERE /* time */ > now - 5 * minute
    endsql

    [series]

`;
        const expected = config;
        const formatter = new Formatter();
        const actual = formatter.format(config);
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
