import { ResourcesProviderBase } from "../resourcesProviderBase";
import { Setting } from "../setting";
export declare class ResourcesProvider extends ResourcesProviderBase {
    constructor();
    /**
     * Reads snippets from "snippets.json" file
     * @returns snippets JSON contents
     */
    readSnippets(): string;
    /**
     * Reads dictionary from "dictionary.json" file
     * @returns array of settings from the file
     */
    protected readSettings(): Setting[];
    /**
     * Reads descriptions from "descriptions.md" file
     * @returns map of settings names and descriptions
     */
    protected readDescriptions(): Map<string, string>;
}
