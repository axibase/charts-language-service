import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const errorMessage: (setting: string) => string = (setting: string): string =>
        `${setting} is interpreted as a series tag and is sent to the\nserver. ` +
        `Move the setting outside of the [tags] section or
enclose in double-quotes to send it to the server without\na warning.`;

suite("Warn about setting interpreted as a tag", () => {
    test("Is not double-quoted", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = page
[tags]
starttime = 20 second
	startime = 30 minute`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "starttime".length, 5),
                    errorMessage("starttime"), DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Is double-quoted", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = page
[tags]
	"starttime" = 20 second
	startime = 30 minute`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Is upper-case with dash", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = page
[tags]
stArt-time = 20 second
	startime = 30 minute`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [createDiagnostic(createRange(0, "start-time".length, 5),
                errorMessage("start-time"), DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});

suite("Deprecated [tag] section", () => {
    test("Warning", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = chart
	[series]
	entity = a
	metric = b
[tag]
  name = a
  value = b`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [createDiagnostic(createRange("[".length, "tag".length, 7),
                "Section [tag] is deprecated, use [tags] instead", DiagnosticSeverity.Warning)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
