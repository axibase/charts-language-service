import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../../configTree/section";
import { ResourcesProviderBase } from "../../resourcesProviderBase";
import { Condition } from "./condition";

/**
 * Function, which performs check of the section.
 */
export type Check = (section: Section, resourcesProvider: ResourcesProviderBase) => Diagnostic | Diagnostic[] | void;

export interface RelatedSettingsRule {
    name?: string;
    check: Check;
}

export interface Requirement {
    conditions?: Condition[];
    requiredSetting: string | string[];
}
