import { deepStrictEqual } from "assert";
import { unknownToken } from "../messageUtil";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const baseConfig = `[configuration]
    entity = d
    metric = t

    [group]

        [widget]
            type = chart`;
const firstVar: string = "serv";
const secondVar: string = "server";
const thirdVar: string = "srv";

suite("Undefined variable in for loop", () => {
    test("One correct loop", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("One correct loop with comment", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${firstVar} /* this is a comment */ in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Two correct  loops", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("One incorrect loop", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(26, firstVar.length, 12),
                unknownToken(firstVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Two incorrect loops", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${secondVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(26, firstVar.length, 12),
                unknownToken(firstVar)
            ),
            createDiagnostic(
                createRange(26, secondVar.length, 17),
                unknownToken(secondVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("One incorrect loop, one correct loop", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(26, firstVar.length, 12),
                unknownToken(firstVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("One correct nested loop", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${secondVar}}
           for ${firstVar} in servers
               [series]
                   metric = placeholder
                   entity = @{${secondVar}}
               [series]
                   metric = placeholder
                   entity = @{${firstVar}}
           endfor
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("One incorrect nested loop", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${secondVar}}
           for ${firstVar} in servers
               [series]
                   metric = placeholder
                   entity = @{${thirdVar}}
               [series]
                   metric = placeholder
                   entity = @{${firstVar}}
           endfor
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(30, thirdVar.length, 16),
                unknownToken(thirdVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Arithmetic expression with correct var", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${firstVar}  ${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Arithmetic expression with incorrect var", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${firstVar} in servers
           [series]
               metric = placeholder
               entity = @{${secondVar}  ${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(26, secondVar.length, 12),
                unknownToken(secondVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Function correct var", () => {
        const config = `${baseConfig}\n list servers = 's1v1', 's1v2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{keepAfterLast(${secondVar}, '1')}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Property of a correct var", () => {
        const config = `${baseConfig}\n var servers = [ { name: 'srv1' }, { name: 'srv2' } ]
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{${secondVar}.name}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("String", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{keepAfterLast(${secondVar}, 'v')}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Several statements, second incorrect", () => {
        const config = `${baseConfig}\n list servers = 'srv1', 'srv2'
        for ${secondVar} in servers
           [series]
               metric = placeholder
               entity = @{keepAfterLast(${secondVar}, 'v')}, @{${firstVar}}
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(57, firstVar.length, 12),
                unknownToken(firstVar)
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });

    test("Space between list name and equals sign is absent", () => {
        const config = `${baseConfig}\n list servers= server1, server2
        for server in servers
            [series]
                metric = a
                entity = b
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Correct CSV variable in for loop", () => {
        const config = `[configuration]
        csv metrics = 
            name,tag,format,sort,statistic,change
        endcsv
        
        [group]
        for mtr in metrics
            [widget]
                type = table
                [series]
                    entity = a
                    metric = b
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        deepStrictEqual(actualDiagnostics, []);
    });

    test("Undefined CSV variable in for loop", () => {
        const config = `[configuration]
        csv metrics_ = 
            name,tag,format,sort,statistic,change
        endcsv
        
        [group]
        for mtr in metrics
            [widget]
                type = table
                [series]
                    entity = a
                    metric = b
        endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expectedDiagnostic = [
            createDiagnostic(
                createRange(19, 'metrics'.length, 6),
                unknownToken('metrics')
            )
        ];
        deepStrictEqual(actualDiagnostics, expectedDiagnostic);
    });
});
