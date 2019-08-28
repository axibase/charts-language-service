import { deepStrictEqual } from "assert";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("Сomments formatting tests", () => {
  test("Multiline comment alone", () => {
    const text = `/*
    one
    two
    three
*/

`;
    const expected = text
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
