import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Unmatched endfor tests", () => {
    test("One correct loop", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
   do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });
    test("Two correct loops", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
   do something
endfor
for server in servers
   do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });
    test("One incorrect loop", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
   do something`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "for".length, 1), "for has no matching endfor")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Two incorrect loops", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
   do something
for srv in servers
   do something`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "for".length, 1), "for has no matching endfor"),
            createDiagnostic(createRange(0, "for".length, 3), "for has no matching endfor")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect loop, one correct loop", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
   do something
for srv in servers
   do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "for".length, 1), "for has no matching endfor")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
