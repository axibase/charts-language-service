import { deepStrictEqual } from "assert";
import { Formatter } from "../formatter";

suite("Сomments formatting tests", () => {
  test("Multiline comment alone", () => {
    const text = `/*
  one
  two
  three
*/

`;
    const expected = text;
    const formatter = new Formatter();
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
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Commented setting value", () => {
    const text = `height-units = /* 4 */

`;
    const expected = text;
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Preserves setting before comment", () => {
    const text = `offset-right = 40 /*
starttime = 2017-10-01T00:00:00Z
endtime = 2019
*/
markers = false`;
    const expected = `offset-right = 40
/*
  starttime = 2017-10-01T00:00:00Z
  endtime = 2019
*/
markers = false

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Preserves setting after comment", () => {
    const text = `offset-right = 40
/*
  starttime = 2017-10-01T00:00:00Z
  endtime = 2019
*/markers = false`;
    const expected = `offset-right = 40
/*
  starttime = 2017-10-01T00:00:00Z
  endtime = 2019
*/
markers = false

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Preserves setting before and after comment", () => {
    const text = `offset-right = 40/*
starttime = 2017-10-01T00:00:00Z
endtime = 2019
*/markers = false`;
    const expected = `offset-right = 40
/*
  starttime = 2017-10-01T00:00:00Z
  endtime = 2019
*/
markers = false

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Two block comments", () => {
    const text = `/* style = stroke-width: 2
 color = black */

  height-units = 4

  /* width-units = 4
 type = chart */
`;
    const expected = `/*
  style = stroke-width: 2
  color = black
*/
height-units = 4
/*
  width-units = 4
  type = chart
*/

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
