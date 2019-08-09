import { Condition } from "../relatedSettingsRules/utils/condition";
import { Setting } from "../setting";
import { TextRange } from "../textRange";
/**
 * ConfigTree node.
 */
export declare class Section {
    name: string;
    settings: Setting[];
    parent: Section;
    children: Section[];
    range: TextRange;
    /**
     * Caches frequently used settings to reduce search in tree.
     */
    private scope;
    /**
     * @param range - The text (name of section) and the position of the text
     * @param settings - Section settings
     */
    constructor(range: TextRange, settings: Setting[]);
    applyScope(): void;
    /**
     * Returns setting from this section by it's displayName.
     *
     * @param name - Setting.displayName
     * @returns Setting with displayname equal to `settingName`
     */
    getSetting(name: string): Setting | undefined;
    /**
     * Returns setting with specified display name. If setting is frequently used, tries to get it from section's scope,
     * otherwise searches setting in the tree by it's displayName,
     * starting from the current section and ending root, returns the closest one.
     *
     * @param settingName - Setting.displayName
     * @returns Setting with displayname equal to `settingName`
     */
    getSettingFromTree(settingName: string): Setting | undefined;
    getScopeSetting(settingName: string): Setting;
    /**
     * Returns true if section passes all of conditions, otherwise returns false.
     *
     * @param conditions - Array of conditions, for which section must be checked
     * @returns Result of `conditions` checks.
     */
    matchesConditions(conditions: Condition[]): boolean;
}
