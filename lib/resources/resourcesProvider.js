"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const resourcesProviderBase_1 = require("../resourcesProviderBase");
class ResourcesProvider extends resourcesProviderBase_1.ResourcesProviderBase {
    constructor() {
        super();
    }
    /**
     * Reads snippets from "snippets.json" file
     * @returns snippets JSON contents
     */
    readSnippets() {
        return require("../../snippets/snippets.json");
    }
    /**
     * Reads dictionary from "dictionary.json" file
     * @returns array of settings from the file
     */
    readSettings() {
        const dictionaryFilePath = path_1.join(__dirname, "..", "dictionary.json");
        const jsonContent = fs_1.readFileSync(dictionaryFilePath, "UTF-8");
        const dictionary = JSON.parse(jsonContent);
        return dictionary.settings;
    }
    /**
     * Reads descriptions from "descriptions.md" file
     * @returns map of settings names and descriptions
     */
    readDescriptions() {
        const descriptionsPath = path_1.join(__dirname, "..", "descriptions.md");
        const content = fs_1.readFileSync(descriptionsPath, "UTF-8");
        const map = new Map();
        // ## settingname\n\nsetting description[url](hello#html)\n
        const regExp = /\#\# ([a-z]+?)  \n  \n([^\s#][\S\s]+?)  (?=\n  (?:\n(?=\#)|$))/g;
        let match = regExp.exec(content);
        while (match !== null) {
            const [, name, description] = match;
            map.set(name, description);
            match = regExp.exec(content);
        }
        return map;
    }
}
exports.ResourcesProvider = ResourcesProvider;
