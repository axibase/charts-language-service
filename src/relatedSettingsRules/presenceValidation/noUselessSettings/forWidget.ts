import { Condition, isNotUselessIf } from "../../utils/condition";

/**
 * If key is declared in the section and the section doesn't match any of conditions, then key is useless.
 */
const checks: Map<string, Condition[]> = new Map<string, Condition[]>([
    [
        "negative-style",
        /**
         * If "mode" is NOT "column-stack" or "column",
         * settings "negative-style" and "current-period-style" are useless.
         */
        [
            isNotUselessIf("mode", ["column-stack", "column"])]
    ],
    [
        "current-period-style", [
            isNotUselessIf("mode", ["column-stack", "column"])]
    ],
    [
        "moving-average", [
            isNotUselessIf("server-aggregate", ["false"])]
    ],
    [
        "palette-ticks", [
            isNotUselessIf("type", ["calendar", "treemap"])
        ]
    ],
    [
        "size-name", [
            isNotUselessIf("display-total", ["true"])
        ]
    ],
    [
        "format-size", [
            isNotUselessIf("display-total", ["true"])
        ]
    ],
    [
        "color-range", [
            isNotUselessIf("mode", ["half", "default"])]
    ],
    [
        "gradient-count", [
            isNotUselessIf("mode", ["half", "default"])]
    ]
]);

export default checks;
