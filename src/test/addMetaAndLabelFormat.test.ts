import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("label-format and add-meta", () => {
    test("Correct: add-meta = true", () => {
        const config = `[configuration]
    entity = a
    metric = b
  [group]
    [widget]
      type = chart
      label-format = meta.entity.tags
      add-meta = true
      [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });
    test("Incorrect: add-meta = false", () => {
        const config = `[configuration]
    entity = a
    metric = b
  [group]
    [widget]
      type = chart
      label-format = meta.entity.tags
      add-meta = false
      [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [ createDiagnostic(
                createRange(6, "label-format".length, 6),
                "If label-format contains 'meta', add-meta must be true"
        )], `Config: \n${config}`);
    });
});
