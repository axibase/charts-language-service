import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const unknownToken: string = "script has no matching endscript";

suite("Script endscript tests", () => {
    test("Correct empty script", () => {
        const config = `script
endscript`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Unclosed empty script", () => {
        const config = `script
endscrpt`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "script".length, 0), unknownToken)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Two correct scripts", () => {
        const config = `script
	for (let i = 0, i < 5, i+) {}
endscript
script
	for (let i = 0, i < 5, i+) {}
endscript`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Two unclosed scripts", () => {
        const config = `script
endscrpt
script
endscrpt`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "script".length, 2), unknownToken),
            createDiagnostic(createRange(0, "script".length, 0), unknownToken)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line script = ", () => {
        const config = `script = if (!config.isDialog) c = widget`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line script = and a setting after", () => {
        const config = `[configuration]
[group]
   [widget]
script = if (!config.isDialog) c = widget
type = chart
    [series]
   entity = hello
   metric = hello`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line script = ", () => {
        const config = `script = if
script =		(!config.isDialog)
script =			c = widget`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect empty one-line script = ", () => {
        const config = "script = ";
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "script".length, 0), "script can not be empty")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line script = with endscript", () => {
        const config = `script = if (!config.isDialog) c = widget
endscript`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "endscript".length, 1), "endscript has no matching script")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect script/endscript declaration", () => {
        const config = `script alert("Hello, world!")
endscript`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "endscript".length, 1), "endscript has no matching script"),
            createDiagnostic(createRange(0, "script".length, 0),
                    "A linefeed character after 'script' keyword is required")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Handle '\\r' character properly", () => {
        const config = `script = if (!config.isDialog) c = widget\r\n`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
