import { Condition } from "../rules/utils/condition";
import { Setting } from "../setting";
import { TextRange } from "../textRange";

/**
 * Settings, that are frequently used in conditions checks,
 * see otherSettings.ts, uselessSettings.ts and date checks.
 */
const sectionScopeSettings: string[] = ["type", "mode", "endtime", "timezone"];

/**
 * ConfigTree node.
 */
export class Section {
    public name: string;
    public settings: Setting[];
    public parent: Section;
    public children: Section[] = [];
    public range: TextRange;
    public hasExprBlock = false;
    /**
     * Caches frequently used settings to reduce search in tree.
     */
    private scope: Map<string, Setting> = new Map<string, Setting>();

    /**
     * @param range - The text (name of section) and the position of the text
     * @param settings - Section settings
     */
    public constructor(range: TextRange, settings: Setting[]) {
        this.range = range;
        this.name = range.text;
        this.settings = settings;
    }

    public applyScope() {
        if (this.parent !== undefined) {
            /**
             * We are not at [configuration]. Inherit parent scope.
             */
            this.scope = new Map(this.parent.scope);
        }
        for (const setting of this.settings) {
            /**
             * Override parent scope.
             */
            if (sectionScopeSettings.includes(setting.name)) {
                this.scope.set(setting.name, setting);
            }
        }
    }

    /**
     * Returns setting from this section by it's name.
     *
     * @param settingName - Setting.name
     * @returns Setting with name equal to `settingName`
     */
    public getSetting(settingName: string): Setting | undefined {
        return this.settings.find(s => s.name === settingName);
    }

    /**
     * Searches setting in neighbour sections, matching specified name.
     *
     * @param settingName - Setting.name
     * @param neighbourName - Name of section, in which setting is need to be searched
     * @returns Setting with name equal to `settingName`
     */
    public getSettingFromNeighbours(settingName: string, neighbourName: string): Setting | undefined {
        const neighbours = this.parent.children;
        for (const neighbour of neighbours) {
            if (neighbour.name === neighbourName) {
                const targetSetting: Setting = neighbour.getSetting(settingName);
                if (targetSetting !== undefined) {
                    return targetSetting;
                }
            }
        }
    }

    /**
     * Returns setting with specified display name. If setting is frequently used, tries to get it from section's scope,
     * otherwise searches setting in the tree by it's displayName,
     * starting from the current section and ending root, returns the closest one.
     *
     * @param settingName - Setting.displayName
     * @returns Setting with display name equal to `settingName`
     */
    public getSettingFromTree(settingName: string): Setting | undefined {
        settingName = Setting.clearSetting(settingName);
        let value = this.getScopeSetting(settingName);
        if (value != null) {
            return value;
        }
        let currentSection: Section = this;
        while (currentSection) {
            value = currentSection.getSetting(settingName);
            if (value !== void 0) {
                return value;
            }
            currentSection = currentSection.parent;
        }
        return undefined;
    }

    public getScopeSetting(settingName: string): Setting {
        const cleared = Setting.clearSetting(settingName);
        return this.scope.get(cleared);
    }

    /**
     * Returns true if section passes all of conditions, otherwise returns false.
     *
     * @param conditions - Array of conditions, for which section must be checked
     * @returns Result of `conditions` checks.
     */
    public matchesConditions(conditions: Condition[]): boolean {
        const section: Section = this;

        if (conditions === undefined) {
            return true;
        }
        for (const condition of conditions) {
            const currCondition = condition(section);
            if (!currCondition) {
                return false;
            }
        }
        return true;
    }
}
