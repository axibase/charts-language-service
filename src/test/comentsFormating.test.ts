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

  test("Two commented settings in [configuration]", () => {
    const text = `[configuration]
  /*  height-units = 4
  width-units = 1 */`;
    const expected = `[configuration]
  /*
    height-units = 4
    width-units = 1
  */

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Commented setting value", () => {
    const text = `height-units = /* 4 */

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Two commented sections", () => {
    const text = `[configuration]
    /* [group]
    [widget] */`;
    const expected = `[configuration]
  /*
    [group]
       [widget]
  */

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Commented script", () => {
    const text = `/*  script
    window.userFunction = function () {
      hello();
    };
  endscript*/

`;
const expected = `/*
  script
    window.userFunction = function () {
      hello();
    };
  endscript
*/

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
