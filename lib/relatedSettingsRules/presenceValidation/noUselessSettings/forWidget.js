(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../utils/condition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const condition_1 = require("../../utils/condition");
    /**
     * If key is declared in the section and the section doesn't match any of conditions, then key is useless.
     */
    const checks = new Map([
        [
            "negative-style",
            /**
             * If "type!=chart" OR "mode" is NOT "column-stack" or "column",
             * settings "negative-style" and "current-period-style" are useless.
             */
            [
                condition_1.isNotUselessIf("type", ["chart"]),
                condition_1.isNotUselessIf("mode", ["column-stack", "column"])
            ]
        ],
        [
            "current-period-style", [
                condition_1.isNotUselessIf("type", ["chart"]),
                condition_1.isNotUselessIf("mode", ["column-stack", "column"])
            ]
        ],
        [
            "moving-average", [
                condition_1.isNotUselessIf("type", ["chart"]),
                condition_1.isNotUselessIf("server-aggregate", ["false"])
            ]
        ],
        [
            "palette-ticks", [
                condition_1.isNotUselessIf("type", ["calendar", "treemap"])
            ]
        ],
        [
            "color-range", [
                condition_1.isNotUselessIf("type", ["calendar", "treemap", "gauge"]),
                condition_1.isNotUselessIf("mode", ["half", "default"])
            ]
        ],
        [
            "gradient-count", [
                condition_1.isNotUselessIf("type", ["calendar", "treemap", "gauge"]),
                condition_1.isNotUselessIf("mode", ["half", "default"])
            ]
        ]
    ]);
    exports.default = checks;
});
