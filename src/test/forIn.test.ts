import { deepStrictEqual } from "assert";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("for in ... tests", () => {
    test("Correct one-line list, correct for", () => {
        const config = `list servers = 'srv1', 'srv2'
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line list, incorrect for", () => {
        const config = `list servers = 'srv1', 'srv2'
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 1), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line var(array), incorrect for", () => {
        const config = `var servers = ['srv1', 'srv2']
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 1), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line var(array), correct for", () => {
        const config = `var servers = ['srv1', 'srv2']
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line var(props), incorrect for", () => {
        const config = `var servers = {'srv1': 'srv2'}
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 1), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct one-line var(props), correct for", () => {
        const config = `var servers = {'srv1': 'srv2'}
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line list, correct for", () => {
        const config = `list servers = 'srv1',
   'srv2'
endlist
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line list, incorrect for", () => {
        const config = `list servers = 'srv1',
   'srv2'
endlist
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 3), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line var(array), incorrect for", () => {
        const config = `var servers = ['srv1',
   'srv2'
]
endvar
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 4), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line var(array), correct for", () => {
        const config = `var servers = ['srv1',
   'srv2'
]
endvar
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line var(props), incorrect for", () => {
        const config = `var servers = {
   'srv1': 'srv2'
}
endvar
for srv in server
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "server".length, 4), "server is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line var(props), correct for", () => {
        const config = `var servers = {
   'srv1': 'srv2'
}
endvar
for srv in servers
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct multi-line var(props), correct for before var", () => {
        const config = `for srv in servers
   #do something
endfor
var servers = {
   'srv1': 'srv2'
}
endvar`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "servers".length, 0), "servers is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Undeclared var, correct for before var", () => {
        const config = `for srv in servers
   #do something
endfor
var servers = {
   'srv1': 'srv2'
}
endvar`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv in ".length, "servers".length, 0), "servers is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Undeclared var, incorrect for with empty in", () => {
        const config = `for srv in
   #do something
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for srv ".length, "in".length, 0), "Empty 'in' statement")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct Object.keys() after in keyword", () => {
        const config = `var apps = {
  "abc"	: {"Region": "ABC", "App": "app1"},
  "cde"	: {"Region": "CDE", "App": "app2"}
}
endvar

for agent in Object.keys(apps)
    entity = @{agent}
    metric = @{agent}
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect Object.keys() after in keyword", () => {
        const config = `var apps = {
  "abc"	: {"Region": "ABC", "App": "app1"},
  "cde"	: {"Region": "CDE", "App": "app2"}
}
endvar

for agent in Object.keys(pps)
    entity = @{agent}
    metric = @{agent}
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for agent in Object.keys(".length, "pps".length, 6), "pps is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct Object.keys() with access via dot", () => {
        const config = `var seriesList = getSeries('df.bytes.percentused', 'nurswgvml006')

            for sobj in seriesList
                for tagName in Object.keys(sobj.tags)
                  "@{tagName}" = @{sobj.tags[tagName]}
                endfor
            endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct: index after collection name", () => {
        const config = `var host = [
  ["abc","/app",["dm-3","dm-2"]],
  ["cde","/db",["dm-1","dm-0"]]
]
endvar
for dm in host[2]
    entity = @{host[0]}:LZ
    table = KLZ_IO_Ext
    attribute = Avg_svc_time
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct: inline declaration", () => {
        const config = `for widgetType in ['chart', 'calendar']
            do something
  endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct: call values() on csv", () => {
        const config = `csv hosts = Name,Region
    nurswgvml006,EUR
  endcsv
  for opt in hosts.values('Name')
    do something
  endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Incorrect: call values() on undeclared csv", () => {
        const config = `for opt in hosts.values('Name')
    do something
  endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for opt in ".length, "hosts".length, 0), "hosts is unknown.")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
