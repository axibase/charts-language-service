import { readFileSync } from "fs";
import { join } from "path";
import { ExternalValueCompleters } from "../../completionProvider";
import { ResourcesProviderBase } from "../../resourcesProviderBase";
import { Setting } from "../../setting";

interface IDictionary { $schema: string; settings: Setting[]; }

export class ResourcesProvider extends ResourcesProviderBase {
    constructor() {
        super();
    }

    /**
     * Reads snippets from "snippets.json" file
     * @returns snippets JSON contents
     */
    public readSnippets(): string {
        const snippetsPath: string = join(__dirname, "../../..", "src/resources/snippets/snippets.json");
        return require(snippetsPath);
    }
    /**
     * Reads dictionary from "dictionary.json" file
     * @returns array of settings from the file
     */
    protected readSettings(): Setting[] {
        const dictionaryFilePath: string = join(__dirname, "../../..", "src/resources/dictionary.json");
        const jsonContent: string = readFileSync(dictionaryFilePath, "utf-8");
        const dictionary: IDictionary = JSON.parse(jsonContent) as IDictionary;

        return dictionary.settings;
    }

    /**
     * Reads descriptions from "descriptions.md" file
     * @returns map of settings names and descriptions
     */
    protected readDescriptions(): Map<string, string> {
        const descriptionsPath: string = join(__dirname, "../../..", "src/resources/descriptions.md");
        const content: string = readFileSync(descriptionsPath, "utf-8");
        const map: Map<string, string> = new Map();
        // ## settingname\n\nsetting description[url](hello#html)\n
        const regExp: RegExp = /\#\# ([a-z]+?)  \n  \n([^\s#][\S\s]+?)  (?=\n  (?:\n(?=\#)|$))/g;
        let match: RegExpExecArray | null = regExp.exec(content);
        while (match !== null) {
            const [, name, description] = match;
            map.set(name, description);
            match = regExp.exec(content);
        }

        return map;
    }

    // TODO Add ATSD-side completion if needed, discuss in #8
    public getExternalValueCompleters(): ExternalValueCompleters {
        return {};
    }
}
