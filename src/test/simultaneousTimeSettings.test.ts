import { deepStrictEqual } from "assert";
import { DiagnosticSeverity, Position, Range } from "vscode-languageserver-types";
import { simultaneousTimeSettingsWarning } from "../messageUtil";
import { createDiagnostic, createRange } from "../util";
import { Validator } from "../validator";

const sameSectionAllSettings =
  `[configuration]
  [group]
  [widget]
    type = chart
    start-time = 2017-04-22 01:00:00
    end-time = 2018-07-05 13:00:00
    timespan = 1 hour
    [series]
        entity = a
        metric = b`;

const differentSectionAllSettings =
  `[configuration]
  start-time = 2017-04-22 01:00:00
[group]
[widget]
  type = chart
  end-time = 2018-07-05 13:00:00
  timespan = 1 hour
  [series]
      entity = a
      metric = b`;

const differentSectionSomeSettings =
  `[configuration]
  start-time = 2017-04-22 01:00:00
[group]
[widget]
  type = chart
  timespan = 1 hour
  [series]
      entity = a
      metric = b`;

const oneSectionCorrect =
  `[configuration]
  start-time = 2017-04-22 01:00:00
  entity = a
  metric = b
[group]
  [widget]
  type = chart
    end-time = 2018-04-22 01:00:00
    timespan = 1 hour
    [series]
  [widget]
  type = chart
    end-time = 2018-04-22 01:00:00
    [series]`;

suite("Simultaneous start-time, end-time and timespan", () => {
  test("Start-time, end-time and timespan in same section", () => {
    const config = sameSectionAllSettings;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = createDiagnostic(
      Range.create(Position.create(2, 3), Position.create(2, 9)),
      simultaneousTimeSettingsWarning(),
      DiagnosticSeverity.Warning
    );
    deepStrictEqual(actualDiagnostics, [expectedDiagnostic], `Config: \n${config}`);
  });

  test("Start-time, end-time and timespan in different sections", () => {
    const config = differentSectionAllSettings;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = createDiagnostic(createRange(1, 6, 3),
      simultaneousTimeSettingsWarning(),
      DiagnosticSeverity.Warning
    );
    deepStrictEqual(actualDiagnostics, [expectedDiagnostic], `Config: \n${config}`);
  });

  test("Multiple sections containing settings, one section is correct", () => {
    const config = oneSectionCorrect;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    const expectedDiagnostic = createDiagnostic(createRange(3, 6, 5),
      simultaneousTimeSettingsWarning(),
      DiagnosticSeverity.Warning
    );
    deepStrictEqual(actualDiagnostics, [expectedDiagnostic], `Config: \n${config}`);
  });

  test("Start-time and timespan in different sections. No end-time", () => {
    const config = differentSectionSomeSettings;
    const validator = new Validator(config);
    const actualDiagnostics = validator.lineByLine();
    deepStrictEqual(actualDiagnostics, [], `Config: \n${config}`);
  });
});
