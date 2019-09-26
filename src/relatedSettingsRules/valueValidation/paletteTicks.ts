import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { requiredCondition } from "../utils/condition";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "Pallete-ticks display condition",
    check(section: Section): Diagnostic | void {

        if (!section.matchesConditions([
            requiredCondition("type", ["calendar", "treemap"])
        ])) {
            return;
        }

        const ticks: Setting = section.getSettingFromTree("palette-ticks");

        if (ticks === undefined) {
            return;
        }

        /**
         * Widget has > 2 series
         */
        const multipleSeries: boolean = section.children.filter(
            child => child.name === "series"
        ).length > 1;

        const noThresholds: boolean = section.getSettingFromTree("thresholds") === undefined;
        const noRangeMerge: boolean = getValueOfSetting("range-merge", section) !== "true";

        const noTicks: boolean = multipleSeries && noThresholds && noRangeMerge;

        if (noTicks) {
            return createDiagnostic(
                ticks.textRange,
                "Palette ticks will not be displayed if the widget contains multiple series with individual ranges. " +
                "Enable 'range-merge' or set common 'thresholds' to display ticks.",
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
