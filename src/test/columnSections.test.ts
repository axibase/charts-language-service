import assert = require("assert");
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (setting: string) => `[configuration]
[group]
    [widget]
        type = chart
        [column]
          ${setting}
        [series]
            metric = a
            entity = b`;

suite("[column] section tests", () => {
    test("Incorrect: 'sort' is [widget] setting", () => {
        const config = baseConfig(`sort = command
        `);
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [
            createDiagnostic(
                createRange(10, "sort".length, 5),
                "sort setting is not allowed here."
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct: 'columns' gives no warning", () => {
        const config = baseConfig(`columns = a, b
        `);
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("Correct: duplicate 'columns' are allowed", () => {
        const config = baseConfig(`columns = a, b
        columns = c, d
        `);
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });

    test("[column] is not interpreted as [tags]", () => {
        const config = `[configuration]
      [group]
        [widget]
          type = console
          [column]
            summary-text = row.date`;
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
