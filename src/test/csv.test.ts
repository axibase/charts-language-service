import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("CSV tests", () => {
    test("Correct inline csv(header next line)", () => {
        const config = `csv countries =
   name, value1, value2
   Russia, 65, 63
   USA, 63, 63
endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });
    test("Correct inline csv (header this line)", () => {
        const config = `csv countries = name, value1, value2
   Russia, 65, 63
   USA, 63, 63
endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
    });
    test("Unclosed csv (header this line)", () => {
        const config = `csv countries = name, value1, value2
   Russia, 65, 63
   USA, 63, 63
encsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "encsv".length, 3), "Expected 3 columns, but found 1"),
            createDiagnostic(createRange(0, "csv".length, 0), "csv has no matching endcsv")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Unclosed csv (header next line)", () => {
        const config = `csv countries =
   name, value1, value2
   Russia, 65, 63
   USA, 63, 63
encsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "encsv".length, 4), "Expected 3 columns, but found 1"),
            createDiagnostic(createRange(0, "csv".length, 0), "csv has no matching endcsv")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect csv", () => {
        const config = `csv countries = name, value1, value2
   Russia, 65, 63
   USA, 63, 63, 63
endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "   Russia, 65, 63\n".length, 2), "Expected 3 columns, but found 4")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv with escaped whitespaces and commas", () => {
        const config = `csv countries = name, value1, value2
                Russia, "6,5", 63
                USA, 63, "6 3"
            endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv with not escaped whitespaces", () => {
        const config = `csv index =
                president,inauguration
                Gerald Ford, 1974
            endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv with *", () => {
        const config = `csv values =
        names, ids
        All Countries, *
        Top 10 Countries, value >= top(10)
        endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv with spaces and + ", () => {
        const config = `csv dbmetrics = metric              ,isSize ,isRate
            mssql.active_transactions            ,       ,
            mssql.backup_restore_throughput      ,       ,   +
            endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv with keyword 'from'", () => {
        const config = `csv rows from https://raw.githubusercontent.com/axibase/atsd-use-cases/visa-refusal.csv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect csv with missing keyword 'from'", () => {
        const config = `csv rows https://raw.githubusercontent.com/axibase/atsd-use-cases/visa-refusal.csv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "csv".length, 0), "The line should contain a '=' or 'from' keyword")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect csv 'from' with missing entity name", () => {
        const config = `csv from https://raw.githubusercontent.com/axibase/atsd-use-cases/visa-refusal.csv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange(0, "csv".length, 0), `<name> in 'csv <name> from <url>' is missing`)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct csv 'from' with for loop", () => {
        const config = `csv rows from http://example.com
            for row in rows
            endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
