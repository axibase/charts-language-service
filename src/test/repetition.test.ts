import { deepStrictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

suite("Repetition of variables or settings tests", () => {
    test("Repetition of var name in 'var' and 'list'", () => {
        const config = `list servers = 'srv1', 'srv2'
var servers = 'srv1', 'srv2'`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("var ".length, "servers".length, 1), "servers is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of var name in 'for' and 'list'", () => {
        const config = `list servers = 'srv1', 'srv2'
for servers in servers
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("for ".length, "servers".length, 1), "servers is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of var name in 'csv' and 'list'", () => {
        const config = `list servers = 'srv1', 'srv2'
csv servers = vps, vds
  true, false
endcsv`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("csv ".length, "servers".length, 1), "servers is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of var name in 'list' and 'csv'", () => {
        const config = `csv servers = vps, vds
   true, false
endcsv
list servers = 'srv1', 'srv2'`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("list ".length, "servers".length, 3), "servers is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of var name in 'for' and 'var'", () => {
        const config = `list servers = 'srv1', 'srv2'
for srv in servers
endfor
var srv = ['srv1', 'srv2']`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of setting name", () => {
        const config = `
   entity = srv
   entity = srv2
   metric = status`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("   ".length, "entity".length, 2), "entity is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of aliases", () => {
        const config = `
[configuration]
[group]
[widget]
type=chart
[series]
   entity = srv
   metric = temp
   alias = server
[series]
   entity = srv
   metric = temp
   alias = server`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("   alias = ".length, "server".length, 12), "server is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of aliases in different widgets", () => {
        const config = `
[configuration]
[group]
[widget]
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
   alias = server`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of aliases in different widgets", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list server = 'srv1', 'srv2'
[series]
   entity = srv
   metric = temp
   alias = server`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of declared settings in if", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("           ".length, "color".length, 12), "color is already defined"),
            createDiagnostic(createRange("           ".length, "color".length, 14), "color is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of settings in if", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("           ".length, "color".length, 12), "color is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of settings in else", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("           ".length, "color".length, 14), "color is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of settings in if elseif else", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [
            createDiagnostic(createRange("           ".length, "color".length, 16), "color is already defined")
        ];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of settings in if else next section", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Repetition of settings in if else next section without if", () => {
        const config = `
[configuration]
[group]
[widget]
   type = chart
list servers = 'srv1', 'srv2'
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
endfor`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("script can be multi-line", () => {
        const config = `script =  var stylesheet = document.createElement("style");
script = stylesheet.innerHTML = ".axi-calendarchart .axi-chart-series rect:not([fill]) {fill:red}";
script = document.head.appendChild(stylesheet);`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Correct nodes and links", () => {
        const config = `[configuration]
[group]
[widget]
   type = graph
   [series]
   metric = a
   entity = b
        [node]
      id = mgr_B805B19C
      label = MQMGR01.QM
      parent = MQMGR01

    [node]
      id = DPOWER004

    [node]
      id = DP.QM2
      parent = DPOWER004

    [link]
      label = SWIFT.WPS.1.CH`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("Allow *style repetitions", () => {
        const config = `[configuration]
[group]
[widget]
  type = chart
  entity = a
  metric = b
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
  negative-style = color:red
  negative-style = color:red
  row-alert-style = color:red
  row-alert-style = color:red
  row-style = color: red
  row-style = color: red
  style = color: red
  style = color: red
  table-header-style = color: red
  table-header-style = color: red
  tags-dropdowns-style = color: red
  tags-dropdowns-style = color: red
  [series]`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
    test("evaluate-expression can be multi-line", () => {
        const config = `[configuration]
[group]
  [widget]
    type = chart
    [series]
      entity = a
      metric = b
      evaluate-expression = @{logr_expr}; @{std_expr};
      evaluate-expression = wa = wavg(A, B, '1 minute');`;
        const validator = new Validator(config);
        const actualDiagnostics = validator.lineByLine();
        const expected = [];
        deepStrictEqual(actualDiagnostics, expected, `Config: \n${config}`);
    });
});
