import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const unknownToken = "startime is unknown.";
suite("Spelling checks", () => {
    test("starttime", () => {
        const config = `[configuration]
startime = 2018
	[group]
	[widget]
	type = page`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "startime".length, 1), unknownToken)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("tags ignored", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = page
	[tags]
	startime = 2018`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("tags ignoring finished with new section", () => {
        const config = `[configuration]
	[group]
[tags]
	startime = 2018
[widget]
	type = page
startime = 2018
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "startime".length, 6), unknownToken)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("tags ignoring finished with whitespace", () => {
        const config = `[configuration]
	[group]
	[widget]
	type = chart
[series]
  entity = server
  metric = cpu_busy
  [tags]
    startime = 2018

startime = 2018`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "startime".length, 10), unknownToken)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Space after section name", () => {
        // tslint:disable-next-line:no-trailing-whitespace
        const config = `[configuration] 
	[group]
	[widget]
	type = page
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Space before section name", () => {
        const config = ` [configuration]
	[group]
	[widget]
	type = page
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Column setting", () => {
        const config = `[configuration]
	[group]
	[widget]
  type = table
  column-metric = null
  column-value = null
  [series]
  entity = a
  metric = b
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct: no errors about spaces and custom names in settings of [properties]", () => {
        const config = `[configuration]
	[group]
	[widget]
  type = table
  [series]
  entity = a
  metric = b
[properties]
  Data Center = Cuperito
  Site = California
  Function = SAP DB
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Unclosed section", () => {
        const config = `[configuration]
	[group]
[widget]
	type = chart
[series
entity = nurswgvml006
metric = cpu_iowait
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("[".length, "series".length, 4), "Section tag is unclosed"),
            createDiagnostic(createRange("[".length, "widget".length, 2), "Required section [series] is not declared.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Warn about setting with whitespaces", () => {
        const config = `[configuration]
vertical grid = true
	[group]
	[widget]
	type = chart
[series]
entity = nurswgvml006
metric = cpu_iowait
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "vertical grid".length, 1),
                    `The setting "vertical grid" contains whitespaces.\nReplace spaces with hyphens.`,
                    DiagnosticSeverity.Warning)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
