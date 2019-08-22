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

  test("Comments are not deleted in formatted code", () => {
    const text = `[configuration]
  script
    widget.loader.on('reqload', function (resp, props) {
      props.forEach(function (prop) {
        /**
         * Hack: override entity to allow to join by f1.
         */
        prop.entity = prop.key.sec_code || prop.tags.код_бумаги;
      });
      widget.tbodyData(props);
      widget.redraw(true);
    });
  endscript

`;
    const expected = text;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Comments are not deleted in unformatted code", () => {
    const text = `[configuration]
  script
    widget.loader.on('reqload', function (resp, props) {
    props.forEach(function (prop) {
        /**
         * Hack: override entity to allow to join by f1.
         */
        prop.entity = prop.key.sec_code || prop.tags.код_бумаги;
      });
      widget.tbodyData(props);
      widget.redraw(true);
    });
  endscript`;
  const expected = `[configuration]
  script
    widget.loader.on('reqload', function (resp, props) {
      props.forEach(function (prop) {
        /**
         * Hack: override entity to allow to join by f1.
         */
        prop.entity = prop.key.sec_code || prop.tags.код_бумаги;
      });
      widget.tbodyData(props);
      widget.redraw(true);
    });
  endscript

`;
    const formatter = new Formatter(FORMATTING_OPTIONS);
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
