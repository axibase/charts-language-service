import { Diagnostic } from "vscode-languageserver-types";
import validationRules from "../rules";
import { ConfigTree } from "./configTree";
import { Section } from "./section";

export class ConfigTreeValidator {
    /**
     * Goes through validationRules and performs checks on corresponding sections.
     *
     * @param configTree - Configuration tree
     * @returns Diagnostics about problems in sections
     */
    public static validate(configTree: ConfigTree): Diagnostic[] {
        const walker = new ConfigTreeWalker(configTree);
        const diagnostics: Diagnostic[] = [];
        validationRules.forEach((rulesForSection, sectionName) => {
            const sectionsToCheck: Section[] = walker.getSectionsByName(sectionName);
            if (sectionsToCheck.length > 0) {
                sectionsToCheck.forEach(section => {
                    rulesForSection.forEach(rule => {
                        const diag: Diagnostic | Diagnostic[] | void = rule.check(section);
                        if (diag) {
                            if (Array.isArray(diag)) {
                                diagnostics.push(...diag);
                            } else {
                                diagnostics.push(diag);
                            }
                        }
                    });
                });
            }
        });
        return diagnostics;
    }
}

// tslint:disable-next-line:max-classes-per-file
class ConfigTreeWalker {
    private tree: ConfigTree;
    private requestedSections: Section[];

    constructor(configTree: ConfigTree) {
        this.tree = configTree;
    }

    /**
     * Triggers bypass of ConfigTree and returns array with specified sections.
     *
     * @param sectionName - Name of sections to be returned
     * @returns Array of sections with name `sectionName`
     */
    public getSectionsByName(sectionName: string): Section[] {
        this.requestedSections = [];

        if (this.tree.getRoot) {
            this.walk(sectionName, this.tree.getRoot);
        }
        return this.requestedSections;
    }

    /**
     * Recursively bypasses the ConfigTree starting from `startSection` and
     * adds every section with name `targetSection` to the `requestedSections` array.
     *
     * @param targetSection - Name of sections to be added to `requestedSections` array
     * @param startSection - Section, from which the walk must begin
     */
    private walk(targetSection: string, startSection: Section) {
        for (let section of startSection.children) {
            if (section.name === targetSection) {
                this.requestedSections.push(section);
            } else {
                this.walk(targetSection, section);
            }
        }
    }
}
