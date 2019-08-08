import { Range } from "vscode-languageserver-types";
import { unknownToken } from "../messageUtil";
import { createDiagnostic } from "../util";
import { Test } from "./test";

suite("for in ... tests", () => {
    const tests: Test[] = [
        new Test(
            "Correct one-line list, correct for",
            `list servers = 'srv1', 'srv2'
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct one-line list, incorrect for",
            `list servers = 'srv1', 'srv2'
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(1, "for srv in ".length, 1, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct one-line var(array), incorrect for",
            `var servers = ['srv1', 'srv2']
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(1, "for srv in ".length, 1, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct one-line var(array), correct for",
            `var servers = ['srv1', 'srv2']
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct one-line var(props), incorrect for",
            `var servers = {'srv1': 'srv2'}
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(1, "for srv in ".length, 1, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct one-line var(props), correct for",
            `var servers = {'srv1': 'srv2'}
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct multi-line list, correct for",
            `list servers = 'srv1',
   'srv2'
endlist
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct multi-line list, incorrect for",
            `list servers = 'srv1',
   'srv2'
endlist
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(3, "for srv in ".length, 3, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct multi-line var(array), incorrect for",
            `var servers = ['srv1',
   'srv2'
]
endvar
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(4, "for srv in ".length, 4, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct multi-line var(array), correct for",
            `var servers = ['srv1',
   'srv2'
]
endvar
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct multi-line var(props), incorrect for",
            `var servers = {
   'srv1': 'srv2'
}
endvar
for srv in server
   #do something
endfor`,
            [createDiagnostic(
                Range.create(4, "for srv in ".length, 4, "for srv in ".length + "server".length),
                unknownToken("server"),
            )],
        ),
        new Test(
            "Correct multi-line var(props), correct for",
            `var servers = {
   'srv1': 'srv2'
}
endvar
for srv in servers
   #do something
endfor`,
            [],
        ),
        new Test(
            "Correct multi-line var(props), correct for before var",
            `for srv in servers
   #do something
endfor
var servers = {
   'srv1': 'srv2'
}
endvar`,
            [createDiagnostic(
                Range.create(0, "for srv in ".length, 0, "for srv in ".length + "servers".length),
                unknownToken("servers"),
            )],
        ),
        new Test(
            "Undeclared var, correct for before var",
            `for srv in servers
   #do something
endfor
var servers = {
   'srv1': 'srv2'
}
endvar`,
            [createDiagnostic(
                Range.create(0, "for srv in ".length, 0, "for srv in ".length + "servers".length),
                unknownToken("servers"),
            )],
        ),
        new Test(
            "Undeclared var, incorrect for with empty in",
            `for srv in
   #do something
endfor`,
            [createDiagnostic(
                Range.create(0, "for srv ".length, 0, "for srv ".length + "in".length),
                "Empty 'in' statement",
            )],
        ),
        new Test(
            "Correct Object.keys() after in keyword",
            `var apps = {
  "abc"	: {"Region": "ABC", "App": "app1"},
  "cde"	: {"Region": "CDE", "App": "app2"}
}
endvar

for agent in Object.keys(apps)
  [series]
    entity = @{agent}
    metric = @{agent}
endfor`,
            [],
        ),
        new Test(
            "Incorrect Object.keys() after in keyword",
            `var apps = {
  "abc"	: {"Region": "ABC", "App": "app1"},
  "cde"	: {"Region": "CDE", "App": "app2"}
}
endvar

for agent in Object.keys(pps)
  [series]
    entity = @{agent}
    metric = @{agent}
endfor`,
            [createDiagnostic(
                Range.create(
                    6, "for agent in Object.keys(".length, 6, "for agent in Object.keys(".length + "pps".length,
                ),
                "pps is unknown.",
            )],
        ),
        new Test(
            "Correct Object.keys() with access via dot",
            `var seriesList = getSeries('df.bytes.percentused', 'nurswgvml006')

            for sobj in seriesList
                [tags]
                for tagName in Object.keys(sobj.tags)
                  "@{tagName}" = @{sobj.tags[tagName]}
                endfor
            endfor`,
            [],
        ),
        new Test(
            "Correct: index after collection name",
            `var host = [
  ["abc","/app",["dm-3","dm-2"]],
  ["cde","/db",["dm-1","dm-0"]]
]
endvar
for dm in host[2]
  [series]
    entity = @{host[0]}:LZ
    table = KLZ_IO_Ext
    attribute = Avg_svc_time
endfor`,
            [],
        ),
        new Test(
            "Correct: inline declaration",
            `for widgetType in ['chart', 'calendar']
            do something
  endfor`,
            [],
        ),
        new Test(
            "Incorrect: inline declaration, broken array",
            `for widgetType in ['chart', 'calendar'
            do something
  endfor`,
            [createDiagnostic(
                Range.create(
                    0, "for widgetType in ".length, 0, "for widgetType in ".length + "['chart', 'calendar'".length,
                ),
                "Incorrect collection declaration.",
            )],
        ),
        new Test(
            "Correct: call values() on csv",
            `csv hosts = Name,Region
    nurswgvml006,EUR
  endcsv
  for opt in hosts.values('Name')
    do something
  endfor`,
            [],
        ),
        new Test(
            "Incorrect: call values() on undeclared csv",
            `for opt in hosts.values('Name')
    do something
  endfor`, [createDiagnostic(
      Range.create(
          0, "for opt in ".length, 0, "for opt in ".length + "hosts".length,
      ),
      "hosts is unknown.",
  )]
        )
    ];

    tests.forEach((test: Test) => { test.validationTest(); });

});
