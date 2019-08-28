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

//   test("Commented section + 2 settings", () => {
//     const text = `/*[configuration]
//     height-units = 4
//     width-units = 1*/

// `;
//     const expected = text
//     const formatter = new Formatter(FORMATTING_OPTIONS);
//     const actual = formatter.format(text);
//     deepStrictEqual(actual, expected);
//   });
});
