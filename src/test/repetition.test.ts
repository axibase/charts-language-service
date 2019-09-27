import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { createDiagnostic } from "../util";
import { Test } from "./test";

suite("Repetition of variables or settings tests", () => {
    const tests: Test[] = [
        new Test(
            "Repetition of var name in 'var' and 'list'",
            `list servers = 'srv1', 'srv2'
var servers = 'srv1', 'srv2'`,
            [createDiagnostic(
                Range.create(Position.create(1, "var ".length), Position.create(1, "var ".length + "servers".length)),
                "servers is already defined",
            )],
        ),
        new Test(
            "Repetition of var name in 'for' and 'list'",
            `list servers = 'srv1', 'srv2'
for servers in servers
endfor`,
            [createDiagnostic(
                Range.create(Position.create(1, "for ".length), Position.create(1, "for ".length + "servers".length)),
                "servers is already defined",
            )],
        ),
        new Test(
            "Repetition of var name in 'csv' and 'list'",
            `list servers = 'srv1', 'srv2'
csv servers = vps, vds
  true, false
endcsv`,
            [createDiagnostic(
                Range.create(Position.create(1, "csv ".length), Position.create(1, "csv ".length + "servers".length)),
                "servers is already defined",
            )],
        ),
        new Test(
            "Repetition of var name in 'list' and 'csv'",
            `csv servers = vps, vds
   true, false
endcsv
list servers = 'srv1', 'srv2'`,
            [createDiagnostic(
                Range.create(Position.create(3, "list ".length), Position.create(3, "list ".length + "servers".length)),
                "servers is already defined",
            )],
        ),
        new Test(
            "Repetition of var name in 'for' and 'var'",
            `list servers = 'srv1', 'srv2'
for srv in servers
endfor
var srv = ['srv1', 'srv2']`,
            [],
        ),
        new Test(
            "Repetition of setting name",
            `[series]
   entity = srv
   entity = srv2
   metric = status`,
            [createDiagnostic(
                Range.create(Position.create(2, "   ".length), Position.create(2, "   ".length + "entity".length)),
                "entity is already defined",
            )],
        ),
        new Test(
            "Repetition of aliases",
            `[series]
   entity = srv
   metric = temp
   alias = server
[series]
   entity = srv
   metric = temp
   alias = server`,
            [createDiagnostic(
                Range.create(Position.create(7, "   alias = ".length), Position.create(7, "   alias = server".length)),
                "server is already defined",
            )],
        ),
        new Test(
            "Repetition of aliases in different widgets",
            `[widget]
   type = chart
[series]
   entity = srv
   metric = temp
   alias = server
[widget]
   type = chart
[series]
   entity = srv
   metric = temp
   alias = server`,
            [],
        ),
        new Test(
            "Same name for alias and list",
            `list server = 'srv1', 'srv2'
[series]
   entity = srv
   metric = temp
   alias = server`,
            [],
        ),
        new Test(
            "Repetition of declared settings in if",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       color = 'yellow'
       if server == 'srv1'
           color = 'red'
       else
           color = 'green'
       endif
endfor`,
            [
                createDiagnostic(
                    Range.create(7, "           ".length, 7, "           color".length),
                    "color is already defined",
                ),
                createDiagnostic(
                    Range.create(9, "           ".length, 9, "           color".length),
                    "color is already defined",
                )],
        ),
        new Test(
            "Repetition of settings in if then",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
           color = 'red'
       else
           color = 'green'
       endif
endfor`,
            [createDiagnostic(
                Range.create(7, "           ".length, 7, "           color".length),
                "color is already defined",
            )],
        ),
        new Test(
            "Repetition of settings in if else",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
       else
           color = 'red'
           color = 'green'
       endif
endfor`,
            [createDiagnostic(
                Range.create(9, "           ".length, 9, "           color".length),
                "color is already defined",
            )],
        ),
        new Test(
            "Repetition of settings in if elseif",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
       elseif server == 'srv2'
           color = 'black'
       else
           color = 'red'
           color = 'green'
       endif
endfor`,
            [createDiagnostic(
                Range.create(11, "           ".length, 11, "           color".length),
                "color is already defined",
            )],
        ),
        new Test(
            "Repetition of settings in if else next section",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
       elseif server == 'srv2'
           color = 'black'
       else
           color = 'green'
       endif
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
       else
           color = 'green'
       endif
endfor`,
            [],
        ),
        new Test(
            "Repetition of settings in if else next section without if",
            `list servers = 'srv1', 'srv2'
for server in servers
   [series]
       entity = srv
       metric = temp
       if server == 'srv1'
           color = 'yellow'
       elseif server == 'srv2'
           color = 'black'
       else
           color = 'green'
       endif
   [series]
       entity = srv
       metric = temp
       color = 'yellow'
endfor`,
            [],
        ),
        new Test(
            "script can be multi-line",
            `script =  var stylesheet = document.createElement("style");
script = stylesheet.innerHTML = ".axi-calendarchart .axi-chart-series rect:not([fill]) {fill:red}";
script = document.head.appendChild(stylesheet);`,
            [
                createDiagnostic(
                    Range.create(1, 0, 1, "script".length),
                    "Multi-line scripts are deprecated.\nGroup multiple scripts into blocks:\nscript\nendscript",
                    DiagnosticSeverity.Warning,
                ),
                createDiagnostic(
                    Range.create(2, 0, 2, "script".length),
                    "Multi-line scripts are deprecated.\nGroup multiple scripts into blocks:\nscript\nendscript",
                    DiagnosticSeverity.Warning,
                ),
            ],
        ),
        new Test(
            "Correct nodes and links",
            `[node]
      id = mgr_B805B19C
      label = MQMGR01.QM
      parent = MQMGR01

    [node]
      id = DPOWER004

    [node]
      id = DP.QM2
      parent = DPOWER004

    [link]
      label = SWIFT.WPS.1.CH`,
            [],
        ),
        new Test(
            "Allow *style repetitions",
            `[widget]
  type = chart
  mode = column
  data-type=forecast
  alert-expression=true
  caption=path/img.svg
  icon=null
  alert-row-style = color:red
  alert-row-style = color:red
  alert-style = color:red
  alert-style = color:red
  caption-style = color:red
  caption-style = color:red
  current-period-style = color:red
  current-period-style = color:red
  forecast-style = color:red
  forecast-style = color:red
  header-style = color:red
  header-style = color:red
  icon-alert-style = color:red
  icon-alert-style = color:red
  link-alert-style = color:red
  link-alert-style = color:red
  negative-style = color:red
  negative-style = color:red
  node-alert-style = color:red
  node-alert-style = color:red
  row-alert-style = color:red
  row-alert-style = color:red
  row-style = color: red
  row-style = color: red
  severity-style = row
  severity-style = column
  style = color: red
  style = color: red
  table-header-style = color: red
  table-header-style = color: red
  tags-dropdowns-style = color: red
  tags-dropdowns-style = color: red`,
            [],
        ),
        new Test(
            "evaluate-expression can be multi-line",
            `[widget]
            type = chart
            [series]
              entity = a
              metric = b
              evaluate-expression = @{logr_expr}; @{std_expr};
              evaluate-expression = wa = wavg(A, B, '1 minute');`,
            [],
        ),
    ];

    tests.forEach((test: Test) => { test.validationTest(); });

});
