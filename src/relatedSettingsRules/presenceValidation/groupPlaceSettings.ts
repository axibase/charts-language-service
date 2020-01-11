import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Setting } from "../../setting";
import { createDiagnostic } from "../../util";
import { Rule } from "../utils/interfaces";

const rule: Rule = {
    name: "group-place-* settings requirements",
    check(section: Section): Diagnostic[] | void {
        const constraint = section.getSettingFromTree("group-place-constraint");
        const method = section.getSettingFromTree("group-place-method");
        const minimize = section.getSettingFromTree("group-place-minimize");
        const entities = section.getSettingFromTree("group-place-entities");
        const entityGroup = section.getSettingFromTree("group-place-entity-group");
        const entityExpression = section.getSettingFromTree("group-place-entity-expression");
        const diagnostic: Diagnostic[] = [];
        if (entities || entityGroup || entityExpression) {
            if (!constraint) {
                diagnostic.push(
                    createDiagnostic(
                        section.range.range,
                        `group-place-constraint is required if place operation is used.`
                    )
                );
            }
            if (minimize) {
                diagnostic.push(
                    createDiagnostic(
                        minimize.textRange,
                        `group-place-minimize is ignored if place is used for packing problem.`,
                        DiagnosticSeverity.Warning
                    )
                );
            }
        } else if (minimize) {
            if (!constraint) {
                diagnostic.push(
                    createDiagnostic(
                        section.range.range,
                        `group-place-constraint is required if place operation is used.`
                    )
                );
            }
            if (method) {
                diagnostic.push(
                    createDiagnostic(
                        method.textRange,
                        `group-place-method is ignored if place is used for partitioning problem.`,
                        DiagnosticSeverity.Warning
                    )
                );
            }
        } else {
            const count: Setting = section.getSettingFromTree("group-place-count");
            [count, constraint].forEach(s => {
                if (s) {
                    diagnostic.push(
                        createDiagnostic(
                            s.textRange,
                            `${s.displayName} is ignored if 'minimize' or 'entities' are not specified.`,
                            DiagnosticSeverity.Warning
                        )
                    );
                }
            });
            if (method) {
                diagnostic.push(
                    createDiagnostic(
                        method.textRange,
                        `group-place-method is ignored if 'entities' are not specified.`,
                        DiagnosticSeverity.Warning
                    )
                );
            }
        }
        return diagnostic;
    }
};

export default rule;
