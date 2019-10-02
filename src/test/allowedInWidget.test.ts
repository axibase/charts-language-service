import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const textWidgetConfig = (setting: string) => `[configuration]
[group]
[widget]
    type = text
    metric = a
    entity = b
    [series]
      icon = 'server_black_04.svg'
      ${setting}`;

suite("Text widget tests", () => {
    test("Incorrect: 'icon-alert-expression' is not allowed", () => {
        const config = textWidgetConfig(`icon-alert-expression = value > 10`);
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(6, 21, 8),
                "icon-alert-expression is not allowed in text widget"
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });
});
