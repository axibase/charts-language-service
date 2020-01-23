import { deepStrictEqual } from "assert";
import { Validator } from "../validator";

suite("[property] section tests", () => {
    test("Correct: any value can be assigned to type", () => {
        const config = `
[configuration]
entity = a
metric = b
[group]
[widget]
  type = property
  [property]
     type = cpu`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
