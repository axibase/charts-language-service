import assert = require("assert");
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
    /**
     * Here is a temporary warning suppression. Now we cannot refer setting to parent section.
     * Probably, this will be changed, when syntax tree is build.
     */
    test("Correct: no warning for 'columns' after [column]", () => {
        const config = baseConfig(`columns = quantity, trade_num, order_num`);
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
