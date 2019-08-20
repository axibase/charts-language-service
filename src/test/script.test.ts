import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Test } from "./test";

const unknownToken: string = "script has no matching endscript";

suite("Script endscript tests", () => {
    const tests: Test[] = [
        new Test(
            "Correct empty script",
            `script
endscript`,
            [],
        ),
        new Test(
            "Unclosed empty script",
            `script
endscrpt`,
            [createDiagnostic(
                Range.create(Position.create(0, 0), Position.create(0, "script".length)),
                unknownToken,
            )],
        ),
        new Test(
            "Script with unclosed for",
            `script
	for (let i = 0, i < 5, i+) {}
endscript`,
            [],
        ),
        new Test(
            "Two correct scripts",
            `script
	for (let i = 0, i < 5, i+) {}
endscript
script
	for (let i = 0, i < 5, i+) {}
endscript`,
            [],
        ),
        new Test(
            "Two unclosed scripts",
            `script
endscrpt
script
endscrpt`,
            [
                createDiagnostic(createRange(0, "script".length, 2), unknownToken),
                createDiagnostic(createRange(0, "script".length, 0), unknownToken)
            ],
        ),
        new Test(
            "Correct one-line script = ",
            "script = if (!config.isDialog) c = widget",
            [],
        ),
        new Test(
            "Correct one-line script = and a setting after",
            `[widget]
script = if (!config.isDialog) c = widget
type = chart`,
            [],
        ),
        new Test(
            "Correct multi-line script = ",
            `script = if
script =		(!config.isDialog)
script =			c = widget`,
            [

                createDiagnostic(
                    Range.create(1, 0, 1, "script".length),
                    "Multi-line scripts are deprecated.\nGroup multiple scripts into blocks:\nscript\nendscript",
                    DiagnosticSeverity.Warning,
                ),
                createDiagnostic(
                    Range.create(2, 0, 2, "script".length),
                    "Multi-line scripts are deprecated.\nGroup multiple scripts into blocks:\nscript\nendscript",
                    DiagnosticSeverity.Warning,
                ),
            ],
        ),
        new Test(
            "Incorrect empty one-line script = ",
            "script = ",
            [createDiagnostic(Range.create(0, 0, 0, "script".length), `script can not be empty`)],
        ),
        new Test(
            "Correct one-line script = with endscript ",
            `script = if (!config.isDialog) c = widget
endscript`,
            [createDiagnostic(
                Range.create(1, 0, 1, "endscript".length),
                "endscript has no matching script",
            )],
        ),
        new Test(
            "Incorrect script/endscript declaration",
            `script alert("Hello, world!")
endscript`,
            [
                createDiagnostic(
                    createRange(0, "endscript".length, 1), "endscript has no matching script"),
                createDiagnostic(
                    createRange(0, "script".length, 0), "A linefeed character after 'script' keyword is required")
            ],
        ),
        new Test(
            "Handle '\\r' character properly",
            "script = if (!config.isDialog) c = widget\r\n",
            [],
        ),
        new Test(
            "Script content must be ignored",
            `[widget]
  type = chart
  script
    stylesheet.innerHTML = "text"
  endscript`,
            [],
        ),
    ];

    tests.forEach((test: Test) => { test.validationTest(); });

});
