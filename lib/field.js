(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Represents a field in a script setting.
     * For example, `max` is a field in `alert-expression` setting
     */
    class Field {
        constructor(type, name, description = "", args = [], required = true) {
            this.type = type;
            this.name = name;
            this.args = args;
            this.description = description;
            this.required = required;
        }
    }
    exports.Field = Field;
});
