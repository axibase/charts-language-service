import { deepStrictEqual } from "assert";
import { FormattingOptions, Position, Range, TextEdit } from "vscode-languageserver-types";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("JavaScript code formatting", () => {
    test("Unformatted code inside script tag alone", () => {
        const text = `script
        window.userFunction = function () {
        return Math.round(value / 10) * 10;
        };
endscript`;
        const expected = `script
  window.userFunction = function () {
    return Math.round(value / 10) * 10;
  };
endscript`
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });

    test("Code written in one line", () => {
        const text = `script
        window.userFunction = function () {return Math.round(value / 10) * 10;};
endscript`;
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const expected = `script
  window.userFunction = function () {
    return Math.round(value / 10) * 10;
  };
endscript`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
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
        const expected = `[configuration]
  script
    window.userFunction = function () {
      return Math.round(value / 10) * 10;
    };
  endscript`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
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
        const expected = `
[group]
  script
    window.userFunction = function () {
      return Math.round(value / 10) * 10;
    };
  endscript`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
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
        const expected = text;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });
});
