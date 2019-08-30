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
    test("Correct: 'sort' gives no warning", () => {
        const config = baseConfig(`sort = command
        `);
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [];
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

    test("Incorrect: duplicate 'columns' setting", () => {
        const config = baseConfig(`columns = a, b
        columns = c, d
        `);
        const validator = new Validator(config);
        const actual = validator.lineByLine();
        const expected = [
            createDiagnostic(
                createRange(
                    8, "columns".length, 7
                ),
                "columns is already defined"
            )
        ];
        assert.deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
