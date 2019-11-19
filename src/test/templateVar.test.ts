import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = (str1: string, str2: string) => {
    return `[configuration]
    [group]
    [widget]
      type = chart
      ${str1}
      ${str2}
      [series]
          entity = a
          metric = b`;
};

suite("Template var tests", () => {
    test("Correct: variable template used in start-time setting", () => {
        const config = baseConfig("var base_date = previous_day", "start-time = @{base_date} + 1 * hour");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: variable and time-unit with same name", () => {
        const config = baseConfig("var day = 0", "start-time = current_day - ${day} * day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: {variable} template", () => {
        const config = baseConfig("var something = 0", "start-time = current_day - {something} * minute");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Correct: two variables in start-time template", () => {
        const config = baseConfig(
            "var base_date = previous_day\n    var unit = hour",
            "start-time = @{base_date} + 1 * @{unit}"
        );
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });

    test("Incorrect: misspelled variable in template", () => {
        const config = baseConfig("var base_date = previous_day", "start-time = ${basedate} + 1 * hour");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostics = [
            createDiagnostic(
                createRange(6, 10, 5),
                "Incorrect date template: ${basedate} + 1 * hour. " +
                "start-time must be a date or calendar expression, for example:\n" +
                " * current_hour + 1 minute\n * 2019-04-01T10:15:00Z"
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostics, `Config: \n${config}`);
    });

    test("Incorrect: one of two variables is misspelled", () => {
        const config = baseConfig(
            "var base_date = previous_day\n    var unit = hour",
            "start-time = ${basedate} + 1 * ${unit}"
        );
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostics = [
            createDiagnostic(
                createRange(6, 10, 6),
                "Incorrect date template: ${basedate} + 1 * hour. " +
                "start-time must be a date or calendar expression, for example:\n" +
                " * current_hour + 1 minute\n * 2019-04-01T10:15:00Z"
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostics, `Config: \n${config}`);
    });

    test("Incorrect: variable declaration after template", () => {
        const config = baseConfig("start-time = ${base_date} + 1 * hour", "var base_date = previous_day");
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostics = [
            createDiagnostic(
                createRange(6, 10, 4),
                "Incorrect date template: ${base_date} + 1 * hour. " +
                "start-time must be a date or calendar expression, for example:\n" +
                " * current_hour + 1 minute\n * 2019-04-01T10:15:00Z"
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostics, `Config: \n${config}`);
    });
});
