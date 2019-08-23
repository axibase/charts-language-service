import { deepStrictEqual } from "assert";
import { Formatter, FORMATTING_OPTIONS } from "../formatter";

suite("JavaScript code formatting", () => {
  test("Unformatted code inside script tag alone", () => {
    const text = `script
        window.userFunction = function () {
        return Math.round(value / 10) * 10;
        };
endscript

`;
    const expected = `script
  window.userFunction = function () {
    return Math.round(value / 10) * 10;
  };
endscript

`
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Code written in one line", () => {
    const text = `script
        window.userFunction = function () {return Math.round(value / 10) * 10;};
endscript

`;
    const expected = `script
  window.userFunction = function () {
    return Math.round(value / 10) * 10;
  };
endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Unformatted code inside script tag in [configuration]", () => {
    const text = `[configuration]
  script
    window.userFunction = function () {
    return Math.round(value / 10) * 10;
    };
  endscript

`;
    const expected = `[configuration]
  script
    window.userFunction = function () {
      return Math.round(value / 10) * 10;
    };
  endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Unformatted code inside script tag in [group]", () => {
    const text = `
[group]
  script
    window.userFunction = function () {
    return Math.round(value / 10) * 10;
    };
  endscript
  
  `;
    const expected = `
[group]
  script
    window.userFunction = function () {
      return Math.round(value / 10) * 10;
    };
  endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct code that doesn't need formatting", () => {
    const text = `[configuration]

  [widget]
    script
      window.userFunction = function () {
        return Math.round(value / 10) * 10;
      };
    endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete block comment from formatted code", () => {
    const text = `script
  function round() {
    /* some comment */
    return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete block comment from unformatted code", () => {
    const text = `script
  function round() {
    /* some comment */
      return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = `script
  function round() {
    /* some comment */
    return Math.round(value / 10) * 10;
  }
endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete multiline block comment from formatted code", () => {
    const text = `script
  function round() {
    /*
     * some multiline 
     * comment
     */
    return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete multiline block comment from unformatted code", () => {
    const text = `script
  function round() {
    /*
     * some multiline 
     * comment
     */
      return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = `script
  function round() {
    /*
     * some multiline 
     * comment
     */
    return Math.round(value / 10) * 10;
  }
endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete block comment from formatted syntactically incorrect code", () => {
    const text = `script
  function round() {
    /* some comment */
    return return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Doesn't delete block comment from unformatted syntactically incorrect code", () => {
    const text = `script
  function round() {
    /* some comment */
      return return Math.round(value / 10) * 10;
  }
endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
