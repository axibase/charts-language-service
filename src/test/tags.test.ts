import { deepStrictEqual } from "assert";
import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import {
    deprecatedTagSectionDefault,
    settingNameInTags,
    tagNameWithWhitespaces,
} from "../messageUtil";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";
import { Test } from "./test";

const errorMessage: (setting: string) => string = (setting: string): string =>
    `${setting} is interpreted as a series tag and is sent to the\nserver. ` +
    `Move the setting outside of the [tags] section or
enclose in double-quotes to send it to the server without\na warning.`;

suite("Warn about setting interpreted as a tag", () => {
    const tests: Test[] = [
        new Test(
            "Is not double-quoted",
            `[tags]
	starttime = 20 second
	startime = 30 minute`,
            [createDiagnostic(
                Range.create(Position.create(1, "	".length), Position.create(1, "	".length + "starttime".length)),
                errorMessage("starttime"), DiagnosticSeverity.Information,
            )],
        ),
        new Test(
            "Is double-quoted",
            `[tags]
	"starttime" = 20 second
	startime = 30 minute`,
            [],
        ),
        new Test(
            "Is upper-case with dash",
            `[tags]
	stArt-time = 20 second
	startime = 30 minute`,
            [createDiagnostic(
                Range.create(Position.create(1, "	".length), Position.create(1, "	".length + "stArt-time".length)),
                errorMessage("start-time"), DiagnosticSeverity.Information,
            )],
        ),
        new Test(
            "Error is not raised if the setting is not allowed in the widget",
            `[widget]
  type = box
  entity = test
  metric = cpu_busy
  [series]
    display = false
    [tags]
      Disk_Name = *
      Parent = *`,
            [],
        ),
    ];

    tests.forEach((test: Test) => {
        test.validationTest();
    });

});

suite("Warn about tag keys with whitespaces that not wrapped in double quotes", () => {
    const expectedDiagnostic: Diagnostic =
        createDiagnostic(Range.create(Position.create(1, 2),
            Position.create(1, 11)),
            tagNameWithWhitespaces("two words"),
            DiagnosticSeverity.Warning);
    [
        new Test("Tag not wrapped in double-quote",
            `[tags]
  two words  = a
  "two words" = b
            `, [expectedDiagnostic]),
    ].forEach((test: Test) => test.validationTest());
});

suite("Information about settingName in tags", () => {
    const expectedDiagnostic: Diagnostic =
        createDiagnostic(Range.create(Position.create(1, 0),
            Position.create(1, 5)),
            settingNameInTags("value"),
            DiagnosticSeverity.Information);
    [
        new Test("setting as tag value in [tag] section",
            `[tags]
value = key`,
            [expectedDiagnostic]),
        new Test("setting name is correct for tag section",
            `[tag]
value = correct`,
            [createDiagnostic(
                Range.create(Position.create(0, 1),
                    Position.create(0, 4)),
                deprecatedTagSectionDefault, DiagnosticSeverity.Warning,
            )]),
    ].forEach((test: Test) => test.validationTest());
});

const baseConfig = (settings: string) => `[configuration]
[group]
  [widget]
    type = chart
    [series]
      entity = a
      metric = b
      ${settings}`;

suite("Warn about deprecated [tag] section", () => {
    test("Single [tag] section, both name and value specified", () => {
        const config = baseConfig(`[tag]
        name = hello
        value = fc1`);
        const validator = new Validator(config);
        const actualDiagnostic: Diagnostic[] = validator.lineByLine();
        const expectedDiagnostic: Diagnostic[] = [
            createDiagnostic(
                createRange(7, 3, 7),
                "[tag] section is deprecated and will be removed in future releases.\nUse [tags] section instead.\n\n" +
                "[tag]\n  name = hello\n  value = fc1\n\n[tags]\n  hello = fc1",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Single [tag] section, name contains spaces", () => {
        const config = baseConfig(`[tag]
        name = hello world
        value = fc1`);
        const validator = new Validator(config);
        const actualDiagnostic: Diagnostic[] = validator.lineByLine();
        const expectedDiagnostic: Diagnostic[] = [
            createDiagnostic(
                createRange(7, 3, 7),
                "[tag] section is deprecated and will be removed in future releases.\n" +
                "Use [tags] section instead.\n\n" +
                "[tag]\n  name = hello world\n  value = fc1\n\n[tags]\n  \"hello world\" = fc1",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Single [tag] section, only name specified", () => {
        const config = baseConfig(`[tag]
        name = hello world`);
        const validator = new Validator(config);
        const actualDiagnostic: Diagnostic[] = validator.lineByLine();
        const expectedDiagnostic: Diagnostic[] = [
            createDiagnostic(
                createRange(7, 3, 7),
                deprecatedTagSectionDefault,
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Single [tag] section containing blank lines", () => {
        const config = baseConfig(`[tag]

        name = hello world

        value = fc1`);
        const validator = new Validator(config);
        const actualDiagnostic: Diagnostic[] = validator.lineByLine();
        const expectedDiagnostic: Diagnostic[] = [
            createDiagnostic(
                createRange(7, 3, 7),
                "[tag] section is deprecated and will be removed in future releases.\n" +
                "Use [tags] section instead.\n\n" +
                "[tag]\n  name = hello world\n  value = fc1\n\n[tags]\n  \"hello world\" = fc1",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });

    test("Multiple [tag] sections, both name and value specified", () => {
        const config = baseConfig(`[tag]
        name = hello
        value = fc1

      [tag]
        name = world
        value = fc1`);
        const validator = new Validator(config);
        const actualDiagnostic: Diagnostic[] = validator.lineByLine();
        const expectedDiagnostic: Diagnostic[] = [
            createDiagnostic(
                createRange(7, 3, 7),
                "[tag] section is deprecated and will be removed in future releases.\n" +
                "Use [tags] section instead.\n\n[tag]\n  name = hello\n  value = fc1\n\n[tags]\n  hello = fc1",
                DiagnosticSeverity.Warning
            ),
            createDiagnostic(
                createRange(7, 3, 11),
                "[tag] section is deprecated and will be removed in future releases.\n" +
                "Use [tags] section instead.\n\n[tag]\n  name = world\n  value = fc1\n\n[tags]\n  world = fc1",
                DiagnosticSeverity.Warning
            )
        ];
        deepStrictEqual(actualDiagnostic, expectedDiagnostic, `Config: \n${config}`);
    });
});
