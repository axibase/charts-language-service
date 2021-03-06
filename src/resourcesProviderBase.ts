import { Range } from "vscode-languageserver-types";
import { ExternalValueCompleters } from "./completionProvider";
import { DefaultSetting } from "./defaultSetting";
import { Setting } from "./setting";

interface SectionRequirements {
    sections?: string[][];
}

export abstract class ResourcesProviderBase {

    public static widgetRequirementsByType: Map<string, SectionRequirements> = new Map([
        ["console", {
            sections: [],
        }],
        ["page", {
            sections: [],
        }],
        ["property", {
            sections: [
                ["property"],
            ],
        }],
        ["graph", {
            sections: [
                ["series", "node", "link"]
            ],
        }],
    ]);

    /**
     * Key is section name, value is array of parent sections for the key section
     */
    public static parentSections: Map<string, string[]> = new Map([
        ["axis", ["widget", "group", "configuration"]],
        ["widget", ["group", "configuration"]],
        ["series", ["widget", "link"]],
        ["tag", ["series"]],
        ["tags", ["series"]],
        ["column", ["widget"]],
        ["node", ["widget"]],
        ["link", ["widget"]],
        ["option", ["dropdown"]]
    ]);

    public static sectionDepthMap: { [section: string]: number } = {
        "configuration": 0,

        "group": 1,

        "widget": 2,

        "axis": 3,
        "column": 3,
        "dropdown": 3,
        "keys": 3,
        "link": 3,
        "node": 3,
        "other": 3,
        "placeholders": 3,
        "property": 3,
        "series": 3,
        "threshold": 3,

        "option": 4,
        "properties": 4,
        "tag": 4,
        "tags": 4,
    };

    /**
     * Contains names of sections which can appear at depth `1..max_depth`, where
     * `max_depth` is a value from `sectionDepthMap`
     */
    public static inheritableSections: Set<string> = new Set([
        "axis", "keys", "tags"
    ]);

    /**
     * Returns map of required sections for each section.
     */
    public static getRequiredSectionSettingsMap(): Map<string, SectionRequirements> {
        return new Map<string, SectionRequirements>([
            ["configuration", {
                sections: [
                    ["group"],
                ],
            }],
            ["group", {
                sections: [
                    ["widget"],
                ],
            }],
            ["widget", {
                sections: [
                    ["series"],
                ]
            }]
        ]);
    }

    /**
     * @returns array of parent sections for the section
     */
    public static getParents(section: string): string[] {
        let parents: string[] = [];
        const found: string[] | undefined = ResourcesProviderBase.parentSections.get(section);
        if (found !== undefined) {
            for (const father of found) {
                // JS recursion is not tail-optimized, replace if possible
                parents = parents.concat(father, this.getParents(father));
            }
        }

        return parents;
    }

    /**
     * @returns true if the current section is nested in the previous section
     */
    public static isNestedToPrevious(currentName: string, previousName: string): boolean {
        if (currentName === undefined || previousName === undefined) {
            return false;
        }

        return ResourcesProviderBase.getParents(currentName).includes(previousName);
    }

    /**
     * Tests if the provided setting complete or not
     * @param setting the setting to test
     * @returns true, if setting is complete, false otherwise
     */
    protected static isCompleteSetting(setting?: Partial<Setting>): boolean {
        return setting !== undefined &&
            setting.displayName !== undefined &&
            setting.type !== undefined &&
            setting.example !== undefined;
    }
    public settingsMap: Map<string, DefaultSetting>;

    constructor() {
        this.settingsMap = this.createSettingsMap();
    }

    /**
     * Clears the passed argument and looks for a setting with the same name
     * @param name name of the wanted setting
     * @param range TextRange of the setting in text.
     * @returns the wanted setting or undefined if not found
     */
    public getSetting(name: string, range?: Range): Setting | undefined {
        const clearedName: string = Setting.clearSetting(name);

        const defaultSetting = this.settingsMap.get(clearedName);
        if (defaultSetting === undefined) {
            return undefined;
        }
        const setting = new Setting(defaultSetting);
        if (range) {
            setting.textRange = range;
        }
        return setting;
    }

    /**
     * Reads snippets from "snippets.json" file
     * @returns snippets JSON contents
     */
    public abstract readSnippets(): string;

    /**
     * Provides custom completion for setting values, e.g. values received from ATSD instance
     */
    public abstract getExternalValueCompleters(): ExternalValueCompleters;

    /**
     * Reads dictionary from "dictionary.json" file
     * @returns array of settings from the file
     */
    protected abstract readSettings(): Setting[];

    /**
     * Reads descriptions from "descriptions.md" file
     * @returns map of settings names and descriptions
     */
    protected abstract readDescriptions(): Map<string, string>;

    /**
     * @returns map of settings, key is the setting name, value is instance of Setting
     */
    protected createSettingsMap(): Map<string, DefaultSetting> {
        const descriptions: Map<string, string> = this.readDescriptions();
        const settings: Setting[] = this.readSettings();
        const map: Map<string, Setting> = new Map();
        for (const setting of settings) {
            if (ResourcesProviderBase.isCompleteSetting(setting)) {
                const name: string = Setting.clearSetting(setting.displayName);
                Object.assign(setting, { name, description: descriptions.get(name) });
                const completeSetting: Setting = new Setting(setting);
                map.set(completeSetting.name, completeSetting);
            }
        }

        return map;
    }
}
