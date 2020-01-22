import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const deprecationMessage: string = `Freemarker expressions are deprecated.
Use a native collection: list, csv table, var object.` +
        `\nMigration examples are available at https://axibase.com/docs/charts/syntax/freemarker.html`;

suite("Freemarker templates", () => {
    test("Freemarker assign rises warning on open and close tags", () => {
        const config = `
<#assign foo= ['bar', baz']>
    entity = e
</#assign>
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#assign foo= ['bar', baz']>".length, 1),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "</#assign>".length, 3),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker list rises warning on open and close tags", () => {
        const config = `
<#list foo as bar>
    entity = e
</#list>
        `;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#list foo as bar>".length, 1),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "</#list>".length, 3),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker if rises warning on open and close tags", () => {
        const config = `
<#if condition>
    entity = e
</#if>
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#if condition>".length, 1),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "</#if>".length, 3),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker if-else rises warning on all tags", () => {
        const config = `
<#if condition>
    entity = e
<#else>
    metric=c
</#if>
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#if condition>".length, 1),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "<#else>".length, 3),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "</#if>".length, 5),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker list rises warning on open tag only", () => {
        const config = `
<#list foo as bar>
 entity = e
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#list foo as bar>".length, 1),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker list rises warning on close tag only", () => {
        const config = `
entity = e
</#list>
`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "</#list>".length, 2),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Freemarker does not rise warning on variable interpolation", () => {
        const config = `entity = \${entity1235}`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("De-alias doesn't raise an error", () => {
        const config = `value = 0 <#list sid[1]?split(",") as lpar> + value('\$\{lpar\}:PX')</#list>`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange("value = 0 ".length, "<#list sid[1]?split(\",\") as lpar>".length, 0),
                    deprecationMessage,
                    DiagnosticSeverity.Information)
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Alias doesn't exist, error", () => {
        const config = `value = 0 <#list sid[1]?split(",") as lpar> + value('\${lpr}:PX')</#list>`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange("value = 0 ".length, "<#list sid[1]?split(\",\") as lpar>".length, 0),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange("value = 0 <#list sid[1]?split(\",\") as lpar> + value('\${".length, "lpr".length, 0),
                    "lpr is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("No issues except warning", () => {
        const config = `<#list lpars as lpar>
type = chart
title = [$\{lpar[2]}] [CEC agent:- $\{lpar[0]}] [Frame:- \${lpar[1]}]
timespan = 7 day
</#list>
    `;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(
                    createRange(0, "<#list lpars as lpar>".length, 0),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
            createDiagnostic(
                    createRange(0, "</#list>".length, 4),
                    deprecationMessage,
                    DiagnosticSeverity.Information),
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
