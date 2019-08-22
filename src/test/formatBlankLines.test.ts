import { deepStrictEqual } from "assert";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("Blank lines formatting", () => {
  test("Delete extra blank lines between sections", () => {
    const text = `[configuration]
  offset-right = 50


[group]

`;
    const expected = `[configuration]
  offset-right = 50

[group]

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Insert blank line between sections", () => {
    const text = `[configuration]
  offset-right = 50
[group]`;
    const expected = `[configuration]
  offset-right = 50

[group]

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct config that doesn't need formatting", () => {
    const text = `[configuration]
  offset-right = 50

[group]

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Delete blank line between settings", () => {
    const text = `[configuration]
  entity = nurswgvml007

  metric = cpu_busy
[group]

`;
    const expected = `[configuration]
  entity = nurswgvml007
  metric = cpu_busy

[group]

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Insert two blank lines at the end of the document", () => {
    const text = `[configuration]
  entity = nurswgvml007
  metric = cpu_busy

[group]`;
    const expected = `[configuration]
  entity = nurswgvml007
  metric = cpu_busy

[group]

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
