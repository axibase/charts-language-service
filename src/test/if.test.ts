import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("If elseif else endif validation tests", () => {
    test("One correct if-elseif-endif", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    if server == 'srv1'
      color = red
    elseif server == 'srv2'
      color = yellow
    endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One correct if-else-endif", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    if server == 'srv1'
      color = red
    else
      color = yellow
    endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect elseif-endif", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    elseif server == 'srv1'
      color = yellow
    endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("    ".length, "elseif".length, 4), "elseif has no matching if"),
            createDiagnostic(createRange("    ".length, "endif".length, 6), "endif has no matching if")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect else-endif", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    else
      color = yellow
    endif
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("    ".length, "else".length, 4), "else has no matching if"),
            createDiagnostic(createRange("    ".length, "endif".length, 6), "endif has no matching if")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect else-endif with comment", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    /* this is a comment */ else
      color = yellow
    endif /* a comment */ # too
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("    /* this is a comment */ ".length, "else".length, 4),
                    "else has no matching if"),
            createDiagnostic(createRange("    ".length, "endif".length, 6), "endif has no matching if")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("One incorrect if-else", () => {
        const config = `list servers = 'srv1', 'srv2'
for server in servers
    metric = temp
    entity = @{server}
    if server == 'srv1'
      color = red
    else
      color = yellow
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("".length, "endfor".length, 8), "for has finished before if"),
            createDiagnostic(createRange("    ".length, "if".length, 4), "if has no matching endif")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
