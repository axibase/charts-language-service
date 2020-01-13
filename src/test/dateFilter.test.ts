import * as assert from "assert";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { supportedUnits } from "../messageUtil";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Incorrect date setting", () => {
    function buildExpectedDiagnostic(specificMsg: string): Diagnostic[] {
        return [
            createDiagnostic(createRange(0, "start-time".length, 1),
                    specificMsg +
                    " start-time must be a date or calendar expression, for example:" +
                    "\n * current_hour + 1 minute\n * 2019-04-01T10:15:00Z")
        ];
    }

    function buildConfig(template: string) {
        return `[configuration]
start-time = ${template}
  [group]
    [widget]
      type = chart
      [series]
        entity = a
        metric = b`;
    }

    test("2018-12-31T15:43:32U", () => {
        const template = "2018-12-31T15:43:32U";
        const config = buildConfig(template);
        const validator = new Validator(config);
        const expected = buildExpectedDiagnostic(
                "Incorrect date template: 2018-12-31t15:43:32u.");
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test("previos_week", () => {
        const template = "previos_week";
        const config = buildConfig(template);
        const validator = new Validator(config);
        const expected = buildExpectedDiagnostic(
                "Incorrect date template: previos_week.");
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
    test(".5 * week", () => {
        const template = "current_month + .5 * week";
        const config = buildConfig(template);
        const validator = new Validator(config);
        const expected = buildExpectedDiagnostic(
                "Incorrect date template: current_month + .5 * week.");
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
});

suite("Correct date setting", () => {
    test("ISO and calendar formats", () => {
        const buildConfig = (value) => {
            return `[configuration]
  start-time = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = [
            "2018",
            "2018-12",
            "2018-12-31",
            "2018-12-31 15:43",
            "2018-12-31 15:43:32",
            "2018-12-31T15:43:32Z",
            "2018-12-31T15:43:32.123Z",
            "2018-12-31T15:43:32.123+0400",
            "2018-12-31T15:43:32.123-0400",
            "2018-12-31T15:43:32.123-04:00",
            "2018-12-31T15:43:32.123+04:00",
            "2018-12-31T15:43:32+04:00",
            "2018-12-31T15:43:32-04:00",
            "previous_week",
            "current_month",
            "current_month + 5 * day",
            "current_month + 0.5 * hour"
        ];
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
});

suite("Interval setting", () => {
    test("Correct", () => {
        const buildConfig = (value) => {
            return `[configuration]
  disconnect-interval = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["1 minute", "20 hour", "15 month", "0.25 year", ".25 year", "all"];
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Incorrect", () => {
        const buildConfig = (value) => {
            return `[configuration]
  disconnect-interval = ${value}
[group]
  [widget]
    type = page
`;
        };
        const values = ["1 minutes", "20 hours", "month", "year 0.25", ". year", "auto"];
        const msg = `disconnect-interval should be set as \`count unit\`.
For example, 1 minute. ${supportedUnits()}`;
        for (const v of values) {
            const config = buildConfig(v);
            const validator = new Validator(config);
            const expected = [
                createDiagnostic(createRange("  ".length, "disconnect-interval".length, 1), msg)
            ];
            const actual = validator.lineByLine();
            assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
        }
    });
    test("Deprecated", () => {
        const config = `[configuration]
  update-interval = 10
[group]
  [widget]
    type = page
`;
        const validator = new Validator(config);
        const expected = [
            createDiagnostic(createRange("  ".length, "update-interval".length, 1),
                    `Specifying the interval in seconds is deprecated.
Use \`count unit\` format.
For example, 5 minute. ${supportedUnits()}`, DiagnosticSeverity.Warning)
        ];
        const actual = validator.lineByLine();
        assert.deepStrictEqual(actual, expected, `Config:\n${config}`);
    });
});
