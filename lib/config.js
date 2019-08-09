(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const util_1 = require("./util");
    /**
     * Stores config lines as array, removes comments.
     */
    class Config {
        constructor(text) {
            this.currentLineNumber = -1;
            this.lines = util_1.deleteComments(text)
                .toLowerCase()
                .split("\n");
        }
        getCurrentLine() {
            return this.currentLine;
        }
        /**
         * Returns lowercased config line with specified index.
         *
         * @param line - Index of line to be returned
         * @returns Lowercased line of config with index equal to `line`
         */
        getLine(line) {
            return (line < this.lines.length && line >= 0) ? this.lines[line] : null;
        }
        *[Symbol.iterator]() {
            for (let line of this.lines) {
                this.currentLine = line;
                this.currentLineNumber++;
                yield line;
            }
        }
    }
    exports.Config = Config;
});
