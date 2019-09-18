import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic, getValueOfSetting } from "../../util";
import { requiredCondition } from "../utils/condition";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "calendar pallete-ticks display condition",
    check(section: Section): Diagnostic | void {

        if (!section.matchesConditions([
            requiredCondition("type", ["calendar"])
        ])) {
            return;
        }

        const ticks: Setting = section.getSettingFromTree("palette-ticks");

        if (ticks === undefined) {
            return;
        }

        /**
         * Calendar has > 2 series
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
                `For multiple series with no 'range-merge' and no 'thresholds' specified ticks won't show`,
                DiagnosticSeverity.Warning
            );
        }
    }
};

export default rule;
