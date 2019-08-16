import { deepStrictEqual } from "assert";
import { FormattingOptions, Position, Range, TextEdit } from "vscode-languageserver-types";
import { FORMATTING_OPTIONS, Formatter } from "../formatter";

suite("JavasScript code formatting", () => {
  test("Unformatted code inside script tag alone", () => {
    const text = `script
        window.userFunction = function () {
        return Math.round(value / 10) * 10;
        };
endscript`;
    const options: FormattingOptions = FORMATTING_OPTIONS();
    const expected: TextEdit[] = [
      TextEdit.replace(Range.create(
        Position.create(1, 0),
        Position.create(3, 10)),
        "  window.userFunction = function () {\n    return Math.round(value / 10) * 10;\n  };"
      )
    ];
    const formatter = new Formatter(text, options);
    const actual = formatter.lineByLine();
    deepStrictEqual(actual, expected);
  });

  test("Code written in one line", () => {
    const text = `script
        window.userFunction = function () {return Math.round(value / 10) * 10;};
endscript`;
    const options: FormattingOptions = FORMATTING_OPTIONS();
    const expected: TextEdit[] = [
      TextEdit.replace(Range.create(
        Position.create(1, 0),
        Position.create(1, 80)),
        "  window.userFunction = function () {\n    return Math.round(value / 10) * 10;\n  };"
      )
    ];
    const formatter = new Formatter(text, options);
    const actual = formatter.lineByLine();
    deepStrictEqual(actual, expected);
  });

  test("Unformatted code inside script tag in [configuration]", () => {
    const text = `[configuration]
  script
    window.userFunction = function () {
    return Math.round(value / 10) * 10;
    };
  endscript`;
    const options: FormattingOptions = FORMATTING_OPTIONS();
    const expected: TextEdit[] = [
      TextEdit.replace(Range.create(
        Position.create(2, 0),
        Position.create(4, 6)),
        "    window.userFunction = function () {\n      return Math.round(value / 10) * 10;\n    };"
      )
    ];
    const formatter = new Formatter(text, options);
    const actual = formatter.lineByLine();
    deepStrictEqual(actual, expected);
  });

  test("Unformatted code inside script tag in [group]", () => {
    const text = `
[group]
  script
    window.userFunction = function () {
    return Math.round(value / 10) * 10;
    };
  endscript`;
    const options: FormattingOptions = FORMATTING_OPTIONS();
    const expected: TextEdit[] = [
      TextEdit.replace(Range.create(
        Position.create(3, 0),
        Position.create(5, 6)),
        "    window.userFunction = function () {\n      return Math.round(value / 10) * 10;\n    };"
      )
    ];
    const formatter = new Formatter(text, options);
    const actual = formatter.lineByLine();
    deepStrictEqual(actual, expected);
  });

  test("Correct code that doesn't need formatting", () => {
    const text = `[configuration]

  [widget]
    script` +
      `        window.userFunction = function () {` +
      + `  return Math.round(value / 10) * 10;` +
      `};`
      + `endscript`;
    const options: FormattingOptions = FORMATTING_OPTIONS();
    const expected: TextEdit[] = [];
    const formatter = new Formatter(text, options);
    const actual = formatter.lineByLine();
    deepStrictEqual(actual, expected);
  });
});
