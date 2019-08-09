(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../setting"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const setting_1 = require("../setting");
    /**
     * Settings, that are frequently used in conditions checks,
     * see requiredSettings.ts, uselessSettings.ts and date checks.
     */
    const sectionScopeSettings = ["type", "mode", "endtime", "timezone"];
    /**
     * ConfigTree node.
     */
    class Section {
        /**
         * @param range - The text (name of section) and the position of the text
         * @param settings - Section settings
         */
        constructor(range, settings) {
            this.children = [];
            /**
             * Caches frequently used settings to reduce search in tree.
             */
            this.scope = new Map();
            this.range = range;
            this.name = range.text;
            this.settings = settings;
        }
        applyScope() {
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
         * Returns setting from this section by it's displayName.
         *
         * @param name - Setting.displayName
         * @returns Setting with displayname equal to `settingName`
         */
        getSetting(name) {
            const cleared = setting_1.Setting.clearSetting(name);
            return this.settings.find(s => s.name === cleared);
        }
        /**
         * Returns setting with specified display name. If setting is frequently used, tries to get it from section's scope,
         * otherwise searches setting in the tree by it's displayName,
         * starting from the current section and ending root, returns the closest one.
         *
         * @param settingName - Setting.displayName
         * @returns Setting with displayname equal to `settingName`
         */
        getSettingFromTree(settingName) {
            let value = this.getScopeSetting(settingName);
            if (value != null) {
                return value;
            }
            let currentSection = this;
            while (currentSection) {
                value = currentSection.getSetting(settingName);
                if (value !== void 0) {
                    return value;
                }
                currentSection = currentSection.parent;
            }
            return undefined;
        }
        getScopeSetting(settingName) {
            const cleared = setting_1.Setting.clearSetting(settingName);
            return this.scope.get(cleared);
        }
        /**
         * Returns true if section passes all of conditions, otherwise returns false.
         *
         * @param conditions - Array of conditions, for which section must be checked
         * @returns Result of `conditions` checks.
         */
        matchesConditions(conditions) {
            const section = this;
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
    exports.Section = Section;
});
