import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const unknownToken: string = "list has no matching endlist";

suite("Unfinished list", () => {
    test("One correct one line list", () => {
        const config = `list servers = vps, vds`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One correct multiline list", () => {
        const config = `list servers = vps,
  vds
endlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect multiline list", () => {
        const config = `list servers = vps,
	vds
edlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [createDiagnostic(createRange(0, "list".length, 0), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect multiline list with comment before", () => {
        const config = `/* this is
a comment
to check correct range */

list servers = vps,
	vds
edlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [createDiagnostic(createRange(0, "list".length, 4), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect multiline list with comment on the line", () => {
        const config = `/* test */ list servers = vps,
	vds
edlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("/* test */ ".length, "list".length, 0), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect multiline list with comments", () => {
        const config = `/* this is
a comment
to check correct range */

/* test */ list servers = vps,
	vds
edlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("/* test */ ".length, "list".length, 4), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Three lists, one incorrect", () => {
        const config = `list servers1 = vps,
	vds
endlist
list servers2 = vps,
	vds
edlist
list servers3 = vps,
	vds
endlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "list".length, 3), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multiline list, comma on next line", () => {
        const config = `list servers = vps
	,vds
endlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect multiline list, comma on next line", () => {
        const config = `list servers = vps
	,vds
edlist`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "list".length, 0), unknownToken)];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
