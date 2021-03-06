import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { Condition } from "./condition";

/**
 * Function, which performs check of the section.
 */
export type Check = (section: Section) => Diagnostic | Diagnostic[] | void;

export interface Rule {
    name?: string;
    check: Check;
}

export interface Requirement {
    conditions?: Condition[];
    requiredSetting: string | string[];
}
