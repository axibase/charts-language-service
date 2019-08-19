import { deepStrictEqual } from "assert";
import { FormattingOptions, Position, Range, TextEdit } from "vscode-languageserver-types";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("Blank lines formatting", () => {
    test("Delete extra blank lines between sections", () => {
        const text = `[configuration]
  offset-right = 50


[group]`;
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const expected = `[configuration]
  offset-right = 50

[group]`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });

    test("Insert blank line between sections", () => {
        const text = `[configuration]
  offset-right = 50
[group]`;
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const expected = `[configuration]
  offset-right = 50

[group]`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });

    test("Correct config that doesn't need formatting", () => {
        const text = `[configuration]
  offset-right = 50

[group]`;
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const expected = text;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });

    test("Delete blank line between settings", () => {
        const text = `[configuration]
  entity = nurswgvml007

  metric = cpu_busy
[group]`;
        const options: FormattingOptions = FORMATTING_OPTIONS();
        const expected = `[configuration]
  entity = nurswgvml007
  metric = cpu_busy

[group]`;
        const formatter = new Formatter(text, options);
        const actual = formatter.lineByLine().pop().newText;
        deepStrictEqual(actual, expected);
    });
});
