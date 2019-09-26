import { deepStrictEqual } from "assert";
import { Formatter } from "../formatter";

suite("JavaScript block code formatting", () => {
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

`;
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Unformatted code inside script tag in [group]", () => {
    const text = `[group]
  script
    window.userFunction = function () {
    return Math.round(value / 10) * 10;
    };
  endscript

`;
    const expected = `[group]
  script
    window.userFunction = function () {
      return Math.round(value / 10) * 10;
    };
  endscript

`;
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const formatter = new Formatter();
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
    const expected = `script
   function round() {
   /* some comment */
   return return Math.round(value / 10) * 10;
   }
endscript

`;
    const formatter = new Formatter();
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
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Formatting syntactically incorrect code with initial zero indent", () => {
    const text = `script
function round() {
/* some comment */
return return Math.round(value / 10) * 10;
}
endscript

`;
    const expected = `script
   function round() {
   /* some comment */
   return return Math.round(value / 10) * 10;
   }
endscript

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Formatting syntactically incorrect code with initial non-zero indent", () => {
    const text = `script
      function round() {
    /* some comment */
          return return Math.round(value / 10) * 10;
    }
endscript

`;
    const expected = `script
   function round() {
   /* some comment */
   return return Math.round(value / 10) * 10;
   }
endscript

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});

suite("JavaScript inline code formatting", () => {
  test("Incorrect: missing spaces inside script contents", () => {
    const text = `script = var hello= value()`;
    const expected = `script = var hello = value()

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: script indents inside [widget]", () => {
    const text = `[configuration]

[group]

  [widget]
    script = var hello= value()`;
    const expected = `[configuration]

[group]

  [widget]
    script = var hello = value()

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct: script indents inside [configuration]", () => {
    const text = `[configuration]
  script = var hello = value()

`;
    const expected = text;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: extra spaces inside script contents", () => {
    const text = `script = var hello      =     value()

`;
    const expected = `script = var hello = value()

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: extra spaces around '=' in script declaration", () => {
    const text = `script     =     var hello = value()

`;
    const expected = `script = var hello = value()

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: script contents and setting indent", () => {
    const text = `[configuration]
    script =   alert ( 'Key: ' + key + ' value: ' + menu[key])`;
    const expected = `[configuration]
  script = alert('Key: ' + key + ' value: ' + menu[key])

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Correct: doesn't delete spaces inside quotation marks", () => {
    const text = `[configuration]
  script = alert('Key:   ' + key + ' value:     ' + menu[key])

`;
    const expected = text;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: two consequent incorrect scripts", () => {
    const text = `script = if (a    > b) console.log('hello')
    script = console.log(  result)

`;
    const expected = `script = if (a > b) console.log('hello')
script = console.log(result)

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });

  test("Incorrect: two consequent scripts, second is correct", () => {
    const text = `script = if (a    > b) console.log('hello')
script = console.log(result)

`;
    const expected = `script = if (a > b) console.log('hello')
script = console.log(result)

`;
    const formatter = new Formatter();
    const actual = formatter.format(text);
    deepStrictEqual(actual, expected);
  });
});
