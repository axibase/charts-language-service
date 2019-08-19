import assert = require("assert");
import { FormattingOptions } from "vscode-languageserver-types";
import { Formatter } from "../formatter";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const base = `[configuration]
entity = d
metric = t
[group]
[widget]
type=chart`;

suite("Validator: expr tests", () => {
    test("Correct expr block", () => {
        const conf = `${base}
expr
  expr_1;
endexpr
[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [], `Config: \n${conf}`);
    });

    test("Incorrect expr blocks: no endexpr", () => {
        const conf = `${base}
expr
  expr_1;
endexp

expr
  expr_2;
endexpr
[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [
          createDiagnostic(createRange(0, "expr".length, 6), `expr has no matching endexpr`)
        ], `Config: \n${conf}`);
    });

    test("Incorrect expr block: no expr", () => {
        const conf = `${base}
exp
  expr_1;
endexpr
[series]`;
        let validator = new Validator(conf);
        let diags = validator.lineByLine();
        assert.deepStrictEqual(diags, [
            createDiagnostic(createRange(0, "endexpr".length, 8), `endexpr has no matching expr`)
        ], `Config: \n${conf}`);
    });

    test("Incorrect expr block: no linefeed", () => {
      const conf = `${base}
expr  expr_1;
endexpr
[series]`;
      let validator = new Validator(conf);
      let diags = validator.lineByLine();
      assert.deepStrictEqual(diags, [
          createDiagnostic(createRange(0, "endexpr".length, 7), `endexpr has no matching expr`),
          createDiagnostic(createRange(0, "expr".length, 6), `A linefeed character after 'expr' keyword is required`)
      ], `Config: \n${conf}`);
  });

});

suite("Formatter: expr indents tests", () => {
    const config =
        "  [widget]\n" +
        "    type = chart\n" +
        "    expr\n" +
        "      expr_1;\n" +
        "    endexpr\n" +
        "    [series]\n";
    const formatter = new Formatter(config, FormattingOptions.create(2, true));
    assert.deepStrictEqual(formatter.lineByLine(), [], `Config: \n${config}`);
});
