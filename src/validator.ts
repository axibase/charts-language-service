import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver-types";
import { Config } from "./config";
import { ConfigTree } from "./configTree/configTree";
import { ConfigTreeValidator } from "./configTree/configTreeValidator";
import { DefaultSetting } from "./defaultSetting";
import { KeywordHandler } from "./keywordHandler";
import { LanguageService } from "./languageService";
import {
    deprecatedTagSection,
    getCsvErrorMessage,
    illegalSetting,
    noMatching,
    settingNameInTags,
    settingsWithWhitespaces,
    tagNameWithWhitespaces,
    unknownToken
} from "./messageUtil";
import {
    BLANK_LINE_PATTERN,
    CSV_FROM_URL_PATTERN,
    CSV_INLINE_HEADER_PATTERN,
    CSV_KEYWORD_PATTERN,
    CSV_NEXT_LINE_HEADER_PATTERN,
    SECTIONS_EXCEPTIONS_REGEXP,
    TAG_REGEXP,
    VAR_CLOSE_BRACKET,
    VAR_OPEN_BRACKET,
} from "./regExpressions";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { SectionStack } from "./sectionStack";
import { Setting } from "./setting";
import { TextRange } from "./textRange";
import {
    countCsvColumns,
    createDiagnostic,
    createRange,
    getSetting,
    isAnyInArray,
    isEmpty,
    isInMap,
    repetitionDiagnostic
} from "./util";

const placeholderContainingSettings = [
    "url", "urlparameters"
];

/**
 * Performs validation of a whole document line by line.
 */
export class Validator {
    /**
     * Array of declared aliases in the current widget
     */
    private readonly aliases: string[] = [];
    /**
     * Number of CSV columns in the current CSV header
     */
    private csvColumns?: number;
    /**
     * TextRange containing name and position of the current section declaration
     */
    private currentSection?: TextRange;
    /**
     * Contains sections hierarchy from configuration
     */
    private readonly sectionStack: SectionStack = new SectionStack();
    /**
     * Array of settings declared in current section
     */
    private currentSettings: Setting[] = [];
    /**
     * Array of de-aliases (value('alias')) in the current widget
     */
    private readonly deAliases: TextRange[] = [];
    /**
     * The last found keyword (script, csv, var, for...) and the position
     */
    private foundKeyword?: TextRange;
    /**
     * Map of settings declared in if statement.
     * Key is line number and keyword. For example, "70if server == 'vps'", "29else".
     * Index is used to distinguish statements from each other
     */
    private readonly ifSettings: Map<string, Setting[]> = new Map<string, Setting[]>();
    /**
     * Stack of nested keywords. For example, if can be included to a for.
     */
    private readonly keywordsStack: TextRange[] = [];
    /**
     * Result of last regexp execution
     */
    private match?: RegExpExecArray | null;
    /**
     * Map of settings declared in parent sections. Keys are section names.
     */
    private readonly parentSettings: Map<string, Setting[]> = new Map<string, Setting[]>();
    /**
     * Position of declaration of previous section and the name of the section
     */
    private previousSection?: TextRange;
    /**
     * Settings declared in the previous section
     */
    private previousSettings: Setting[] = [];
    /**
     * Settings required to declare in the current section
     */
    private requiredSettings: DefaultSetting[][] = [];
    /**
     * Validation result
     */
    private readonly result: Diagnostic[] = [];
    /**
     * Map of settings in the current widget and their values
     */
    private readonly settingValues: Map<string, string> = new Map<string, string>();
    /**
     * Map of defined variables, where key is type (for, var, csv...)
     */
    private readonly variables: Map<string, string[]> = new Map([
        ["freemarker", ["entity", "entities", "type"]],
    ]);
    /**
     * Type of the current widget
     */
    private currentWidget?: string;
    /**
     * Line number of last "endif" keyword
     */
    private lastEndIf: number = undefined;

    /**
     * Stores sections with corresponding settings in tree order.
     */
    private configTree: ConfigTree;

    private config: Config;

    private keywordHandler: KeywordHandler;

    public constructor(text: string) {
        this.configTree = new ConfigTree();
        this.config = new Config(text);
        this.keywordHandler = new KeywordHandler(this.config, this.keywordsStack);
    }

    /**
     * Iterates over the document content line by line
     * @returns diagnostics for all found mistakes
     */
    public lineByLine(): Diagnostic[] {
        for (const line of this.config) {
            /**
             * At the moment 'csv <name> from <url>' supports unclosed syntax
             */
            let canBeSingle = false;

            if (CSV_KEYWORD_PATTERN.test(line)) {
                canBeSingle = !CSV_INLINE_HEADER_PATTERN.test(line) && !CSV_NEXT_LINE_HEADER_PATTERN.test(line);
            }

            this.foundKeyword = TextRange.parse(line, this.config.currentLineNumber, canBeSingle);

            if (this.isNotKeywordEnd("var")) {
                /**
                 * Lines in multiline script and var sections
                 * will be checked in JavaScriptValidator.processScript() and processVar().
                 */
                continue;
            }
            if (this.isNotKeywordEnd("csv")) {
                this.validateCsv();
            }
            this.eachLine();
            if (this.foundKeyword !== undefined) {
                if (/\b(if|for|csv)\b/i.test(this.foundKeyword.text)) {
                    this.keywordsStack.push(this.foundKeyword);
                }
                this.switchKeyword();
            }
        }
        this.checkAliases();
        this.diagnosticForLeftKeywords();
        this.checkRequredSettingsForSection();
        this.checkUrlPlaceholders();
        this.setSectionToStackAndTree(null);
        /**
         * Apply checks, which require walking through the ConfigTree.
         */
        let rulesDiagnostics: Diagnostic[] = ConfigTreeValidator.validate(this.configTree);
        /**
         * Ugly hack. Removes duplicates from rulesDiagnostics.
         */
        rulesDiagnostics = [
            ...rulesDiagnostics.reduce(
                ((allItems, item) => allItems.has(item.range) ? allItems : allItems.set(item.range, item)),
                new Map()).values()
        ];
        this.result.push(...rulesDiagnostics);
        return this.result.concat(this.keywordHandler.diagnostics);
    }

    /**
     * Checks whether has the keyword ended or not
     * @param keyword keyword which is expected to end
     */
    private isNotKeywordEnd(keyword: string): boolean {
        return this.areWeIn(keyword) && (this.foundKeyword === undefined || this.foundKeyword.text !== `end${keyword}`);
    }

    /**
     * Adds all current section setting to parent
     * if they're required by a section
     */
    private addCurrentToParentSettings(): void {
        if (this.currentSection !== undefined) {
            for (const setting of this.currentSettings) {
                this.addToParentsSettings(this.currentSection.text, setting);
            }
        }
    }

    /**
     * Adds new entry to settingValue map and new Setting to SectionStack
     * based on this.match, also sets value for setting.
     * @param setting setting to which value will be set
     */
    private addSettingValue(setting: Setting): void {
        if (this.match == null) {
            throw new Error("Trying to add new entry to settingValues map and sectionStack based on undefined");
        }
        const value: string = Setting.clearValue(this.match[3]);
        setting.value = value;
        this.settingValues.set(setting.name, value);
    }

    /**
     * Adds a setting based on this.match to array
     * or creates a new diagnostic if setting is already present
     * @param array the target array
     * @returns the array containing the setting from this.match
     */
    private addToSettingArray(variable: Setting, array?: Setting[]): Setting[] {
        const result: Setting[] = (array === undefined) ? [] : array;
        if (this.match == null) {
            return result;
        }
        const [, indent, name] = this.match;
        if (variable === undefined) {
            return result;
        }
        const declaredAbove = result.find(v => v.name === variable.name);
        if (declaredAbove !== undefined) {
            const range: Range = this.createRange(indent.length, name.length);
            this.result.push(repetitionDiagnostic(range, declaredAbove, variable));
        } else {
            result.push(variable);
        }

        return result;
    }

    /**
     * Adds a setting based on this.match to the target map
     * or creates a new diagnostic if setting is already present
     * @param key the key, which value will contain the setting
     * @param setting which setting to add
     * @returns the map regardless was it modified or not
     */
    private addToParentsSettings(key: string, setting: Setting): void {
        let array: Setting[] | undefined = this.parentSettings.get(key);
        if (array === undefined) {
            array = [setting];
        } else {
            array.push(setting);
        }
        this.parentSettings.set(key, array);
    }

    /**
     * Adds a string based on this.match to the array
     * or creates a diagnostic if the string is already present
     * @param array  the target array
     * @returns the array regardless was it modified or not
     */
    private addToStringArray(array: string[]): string[] {
        const result: string[] = array;
        if (this.match == null) {
            return result;
        }
        const [, indent, variable] = this.match;
        if (array.includes(variable)) {
            this.result.push(createDiagnostic(
                this.createRange(indent.length, variable.length),
                `${variable} is already defined`,
            ));
        } else {
            result.push(variable);
        }

        return result;
    }

    /**
     * Adds a string based on this.match to a value of the provided key
     * @param map the target map
     * @param key the key which value will contain the setting
     * @returns the map regardless was it modified or not
     */
    private addToStringMap(map: Map<string, string[]>, key: string): Map<string, string[]> {
        if (this.match == null) {
            return map;
        }
        const [, indent, variable] = this.match;
        if (isInMap(variable, map)) {
            const startPosition: number = this.match.index + indent.length;
            this.result.push(createDiagnostic(
                this.createRange(startPosition, variable.length),
                `${variable} is already defined`,
            ));
        } else {
            let array: string[] | undefined = map.get(key);
            if (array === undefined) {
                array = [variable];
            } else {
                array.push(variable);
            }
            map.set(key, array);
        }

        return map;
    }

    /**
     * Tests if keywordsStack contain the provided name or not
     * @param name the target keyword name
     * @return true, if stack contains the keyword, false otherwise
     */
    private areWeIn(name: string): boolean {
        return this.keywordsStack
            .some((textRange: TextRange): boolean => textRange.text === name);
    }

    /**
     * Checks that each de-alias has corresponding alias
     */
    private checkAliases(): void {
        this.deAliases.forEach((deAlias: TextRange) => {
            if (!this.aliases.includes(deAlias.text)) {
                this.result.push(createDiagnostic(deAlias.range, unknownToken(deAlias.text)));
            }
        });
    }

    /**
     * Tests that user has finished a corresponding keyword
     * For instance, user can write "endfor" instead of "endif"
     * @param expectedEnd What the user has finished?
     */
    private checkEnd(expectedEnd: string): void {
        if (this.foundKeyword === undefined) {
            return;
        }
        const lastKeyword: string | undefined = this.getLastKeyword();
        if (lastKeyword === expectedEnd) {
            this.keywordsStack.pop();

            return;
        }
        if (!this.areWeIn(expectedEnd)) {
            this.result.push(createDiagnostic(
                this.foundKeyword.range, noMatching(this.foundKeyword.text, expectedEnd)
            ));
        } else {
            const index: number =
                this.keywordsStack.findIndex((keyword: TextRange) => keyword.text === expectedEnd);
            this.keywordsStack.splice(index, 1);
            this.result.push(createDiagnostic(
                this.foundKeyword.range,
                `${expectedEnd} has finished before ${lastKeyword}`,
            ));
        }
    }

    /**
     * Check that the section does not contain settings
     * Which are excluded by the specified one
     * @param setting the specified setting
     */
    private checkExcludes(setting: Setting): void {
        if (this.match == null) {
            return;
        }
        const [, indent, name] = this.match;
        for (const item of this.currentSettings) {
            if (setting.excludes.includes(item.displayName)) {
                const range: Range = this.createRange(indent.length, name.length);
                this.result.push(createDiagnostic(
                    range,
                    `${setting.displayName} can not be specified simultaneously with ${item.displayName}`,
                ));
            }
        }
    }

    private checkFreemarker(): void {
        const line: string = this.config.getCurrentLine();
        this.match = /<\/?#.*?\/?>/.exec(line);
        if (this.match !== null) {
            this.result.push(createDiagnostic(
                this.createRange(this.match.index, this.match[0].length),
                `Freemarker expressions are deprecated.\nUse a native collection: list, csv table, var object.` +
                `\nMigration examples are available at ` +
                `https://axibase.com/docs/charts/syntax/freemarker.html`,
                DiagnosticSeverity.Information,
            ));
            this.match = /(as\s*(\S+)>)/.exec(line);
            if (this.match) {
                this.addToStringArray(this.aliases);
            }
        }
    }

    /**
     * Creates diagnostics if the current section does not contain required settings.
     */
    private checkRequredSettingsForSection(): void {
        if (this.currentSection === undefined) {
            return;
        }
        if (this.previousSection && TAG_REGEXP.test(this.currentSection.text)) {
            /**
             * [tags] has finished, perform checks for parent section.
             */
            this.currentSettings = this.previousSettings;
            this.currentSection = this.previousSection;
        }
        const settingsMap = LanguageService.getResourcesProvider().settingsMap;
        const sectionRequirements = ResourcesProviderBase.getRequiredSectionSettingsMap(settingsMap)
            .get(this.currentSection.text);

        if (!sectionRequirements) {
            return;
        }
        const required: DefaultSetting[][] | undefined = sectionRequirements.settings;
        if (required !== undefined) {
            this.requiredSettings = required.concat(this.requiredSettings);
        }
        const notFound: string[] = [];
        required: for (const options of this.requiredSettings) {
            const displayName: string = options[0].displayName;
            if (displayName === "metric") {
                const columnMetric: string | undefined = this.settingValues.get("columnmetric");
                const columnValue: string | undefined = this.settingValues.get("columnvalue");
                if (columnMetric === "null" && columnValue === "null") {
                    continue;
                }
                const changeField: string | undefined = this.settingValues.get("changefield");
                if (/metric/.test(changeField)) {
                    continue;
                }
            }
            const optionsNames = options.map(s => s.name);
            if (isAnyInArray(optionsNames, this.currentSettings.map(s => s.name))) {
                continue;
            }
            for (const array of this.parentSettings.values()) {
                // Trying to find in this section parents
                if (isAnyInArray(optionsNames, array.map(s => s.name))) {
                    continue required;
                }
            }
            if (this.ifSettings.size > 0) {
                for (const array of this.ifSettings.values()) {
                    // Trying to find in each one of if-elseif-else... statement
                    if (!isAnyInArray(optionsNames, array.map(s => s.name))) {
                        notFound.push(displayName);
                        continue required;
                    }
                }
                const curSectLine = this.currentSection.range.end.line;
                const lastCondLine = parseInt(this.keywordHandler.lastCondition.match(/^\d+/)[0], 10);
                if (// if-elseif-else statement inside the section
                    this.areWeIn("if") ||
                    // section inside the if-elseif-else statement
                    curSectLine < this.lastEndIf && curSectLine > lastCondLine) {
                    continue;
                }
                let ifCounter: number = 0;
                let elseCounter: number = 0;
                for (const statement of this.ifSettings.keys()) {
                    if (/\bif\b/.test(statement)) {
                        ifCounter++;
                    } else if (/\belse\b/.test(statement)) {
                        elseCounter++;
                    }
                }
                if (ifCounter === elseCounter) {
                    continue;
                }
            }
            notFound.push(displayName);
        }
        for (const option of notFound) {
            this.result.push(createDiagnostic(this.currentSection.range, `${option} is required`));
        }
        this.requiredSettings.splice(0, this.requiredSettings.length);
    }

    /**
     * Creates a new diagnostic if the provided setting is defined
     * @param setting the setting to perform check
     */
    private checkRepetition(setting: Setting): void {
        if (this.match == null) {
            return;
        }
        const [, indent, name] = this.match;
        const range: Range = this.createRange(indent.length, name.length);

        const lastCondition = this.keywordHandler.lastCondition;
        if (this.areWeIn("if")) {
            if (lastCondition == null) {
                throw new Error("We are in if, but last condition is undefined");
            }
            let array: Setting[] | undefined = this.ifSettings.get(lastCondition);
            array = this.addToSettingArray(setting, array);
            this.ifSettings.set(lastCondition, array);
            const declaredAbove = this.currentSettings.find(v => v.name === setting.name);
            if (declaredAbove !== undefined) {
                // The setting was defined before if
                this.result.push(repetitionDiagnostic(range, declaredAbove, setting));
                return;
            }
        } else {
            this.addToSettingArray(setting, this.currentSettings);
        }
        this.sectionStack.insertCurrentSetting(setting);
    }

    /**
     * Creates diagnostics for all unclosed keywords
     */
    private diagnosticForLeftKeywords(): void {
        for (const nestedConstruction of this.keywordsStack) {
            if (nestedConstruction.canBeUnclosed) {
                continue;
            }

            this.result.push(createDiagnostic(
                nestedConstruction.range, noMatching(nestedConstruction.text, `end${nestedConstruction.text}`),
            ));
        }
    }

    /**
     * Handles every line in the document, calls corresponding functions
     */
    private eachLine(): void {
        this.checkFreemarker();
        const line: string = this.config.getCurrentLine();
        this.match = /(^[\t ]*\[)(\w+)\][\t ]*/.exec(line);
        if ( // Section declaration, for example, [widget]
            this.match !== null ||
            /**
             * We are in [tags] section and current line is empty - [tags] section has finished
             */
            (isEmpty(line) && this.currentSection && this.currentSection.text === "tags")) {
            // We met start of the next section, that means that current section has finished
            if (this.match !== null) {
                this.spellingCheck();
            }
            this.handleSection();
        } else {
            this.match = /(^\s*)([a-z].*?[a-z])\s*=\s*(.*?)\s*$/.exec(line);
            if (this.match !== null) {
                // Setting declaration, for example, width-units = 6.2
                this.checkSettingsWhitespaces();
                this.handleSettings();
                if (this.areWeIn("for")) {
                    this.validateFor();
                }
            }
            this.match = /(^\s*\[)(\w+)\s*$/.exec(line);
            if (this.match !== null) {
                this.result.push(createDiagnostic(
                    this.createRange(this.match[1].length, this.match[2].length),
                    "Section tag is unclosed",
                ));
            }
        }
    }

    /**
     * Adds all de-aliases from the line to the corresponding array
     */
    private findDeAliases(): void {
        const line: string = this.config.getCurrentLine();
        const regexp: RegExp = /value\((['"])(\S+?)\1\)/g;
        const deAliasPosition: number = 2;
        let freemarkerExpr: RegExpExecArray | null;
        let deAlias: string;
        this.match = regexp.exec(line);
        while (this.match !== null) {
            deAlias = this.match[deAliasPosition];
            freemarkerExpr = /(\$\{(\S+)\})/.exec(deAlias);
            if (freemarkerExpr) {
                // extract "lpar" from value('${lpar}PX')
                deAlias = freemarkerExpr[deAliasPosition];
            }
            this.deAliases.push(new TextRange(deAlias, this.createRange(line.indexOf(deAlias), deAlias.length)));
            this.match = regexp.exec(line);
        }
    }

    /**
     * Returns the keyword from the top of keywords stack without removing it
     * @returns the keyword which is on the top of keywords stack
     */
    private getLastKeyword(): string | undefined {
        if (this.keywordsStack.length === 0) {
            return undefined;
        }
        const stackHead: TextRange = this.keywordsStack[this.keywordsStack.length - 1];

        return stackHead.text;
    }

    /**
     * Creates a diagnostic about unknown setting name or returns the setting
     * @returns undefined if setting is unknown, setting otherwise
     */
    private getSettingCheck(): Setting | undefined {
        if (this.match == null) {
            return undefined;
        }
        const settingName: string = this.match[2];
        let setting: Setting | undefined = this.getSetting(settingName);

        if (setting === undefined) {
            if (/column-/.test(settingName)) {
                return undefined;
            }
            if (TextRange.KEYWORD_REGEXP.test(settingName)) {
                return undefined;
            }
            if (this.currentSection !== undefined && (this.currentSection.text === "placeholders" ||
                this.currentSection.text === "properties")) {
                /**
                 * Return Setting instead of undefined because SectionStack.getSectionSettings(),
                 * which is used in checkUrlPlaceholders(), returns Setting[] instead of Map<string, any>
                 */
                setting = new Setting(new DefaultSetting());
                Object.assign(setting, { name: settingName, section: this.currentSection.text });
                return setting;
            }
            const message: string = unknownToken(settingName);
            this.result.push(createDiagnostic(
                this.createRange(this.match[1].length, settingName.length),
                message,
            ));

            return undefined;
        }

        setting = setting.applyScope({
            section: this.currentSection ? this.currentSection.text.trim() : "",
            widget: this.currentWidget || "",
        }) as Setting;

        return setting;
    }

    /**
     * Calculates the number of columns in the found csv header
     */
    private handleCsv(): void {
        const line: string = this.config.getCurrentLine();
        let header: string | null = null;

        const inlineHeaderMatch = CSV_INLINE_HEADER_PATTERN.exec(line);

        if (inlineHeaderMatch) {
            let j: number = this.config.currentLineNumber + 1;
            header = this.config.getLine(j);
            while (header !== null && BLANK_LINE_PATTERN.test(header)) {
                header = this.config.getLine(++j);
            }
            this.match = inlineHeaderMatch;
        } else {
            let match = CSV_NEXT_LINE_HEADER_PATTERN.exec(line);
            if (!match) {
                match = CSV_FROM_URL_PATTERN.exec(line);
            }

            if (!match) {
                this.result.push(createDiagnostic(this.foundKeyword.range, getCsvErrorMessage(line)));
            } else {
                this.match = match;
                header = line.substring(this.match.index + 1);
            }
        }

        this.addToStringMap(this.variables, "csvNames");
        this.csvColumns = (header === null) ? 0 : countCsvColumns(header);
    }

    /**
     * Creates a diagnostic if `else` is found, but `if` is not
     * or `if` is not the last keyword
     */
    private handleElse(): void {
        if (this.foundKeyword === undefined) {
            throw new Error(`We're trying to handle 'else ', but foundKeyword is ${this.foundKeyword}`);
        }
        this.keywordHandler.setLastCondition();
        let message: string | undefined;
        if (!this.areWeIn("if")) {
            message = noMatching(this.foundKeyword.text, "if");
        } else if (this.getLastKeyword() !== "if") {
            message = `${this.foundKeyword.text} has started before ${this.getLastKeyword()} has finished`;
        }
        if (message !== undefined) {
            this.result.push(createDiagnostic(this.foundKeyword.range, message));
        }
    }

    /**
     * Removes the variable from the last `for`
     */
    private handleEndFor(): void {
        let forVariables: string[] | undefined = this.variables.get("forVariables");
        if (forVariables === undefined) {
            forVariables = [];
        } else {
            forVariables.pop();
        }
        this.variables.set("forVariables", forVariables);
    }

    /**
     * Creates diagnostics related to `for ... in _here_` statements
     * Like "for srv in servers", but "servers" is not defined
     * Also adds the new `for` variable to the corresponding map
     */
    private handleFor(): void {
        const line: string = this.config.getCurrentLine();
        // groups are used in addToStringMap
        this.match = /(^\s*for\s+)(\w+)\s+in\s*/m.exec(line);
        if (this.match != null) {
            const collection = line.substring(this.match[0].length).trim();
            if (collection !== "") {
                const regs: RegExp[] = [
                    /^Object\.keys\((\w+)(?:\.\w+)*\)$/i, // Object.keys(apps), Object.keys(apps.tags)
                    /^(\w+)\.values\((["'])\w+\2\)$/i, // hosts.values('SID')
                    /^(\w+)(\[\d+\])*$/i // apps, apps[1]
                ];
                let varName;
                for (const regex of regs) {
                    const matched = regex.exec(collection);
                    varName = matched ? matched[1] : null;
                    if (varName) { break; }
                }
                if (!varName) {
                    try {
                        /**
                         * Check for inline declaration, for example:
                         * for widgetType in ['chart', 'calendar']
                         */
                        Function(`return ${collection}`);
                    } catch (err) {
                        const start = line.indexOf(collection);
                        this.result.push(createDiagnostic(
                            this.createRange(start, collection.length),
                            "Incorrect collection declaration."));
                    }
                } else if (!isInMap(varName, this.variables)) {
                    const message: string = unknownToken(varName);
                    const start = line.lastIndexOf(varName);
                    this.result.push(createDiagnostic(this.createRange(start, varName.length), message));
                }
            } else {
                const start = this.match[0].indexOf("in");
                this.result.push(createDiagnostic(
                    this.createRange(start, "in".length),
                    "Empty 'in' statement",
                ));
            }
            this.addToStringMap(this.variables, "forVariables");
        }
    }

    /**
     * Adds new variable to corresponding map,
     * Pushes a new keyword to the keyword stack
     * If necessary (`list hello = value1, value2` should not be closed)
     */
    private handleList(): void {
        if (this.foundKeyword === undefined) {
            throw new Error(`We're trying to handle 'list', but foundKeyword is undefined`);
        }
        const line: string = this.config.getCurrentLine();
        this.match = /(^\s*list\s+)(\w+)\s*=/.exec(line);
        this.addToStringMap(this.variables, "listNames");
        if (/(=|,)[ \t]*$/m.test(line)) {
            this.keywordsStack.push(this.foundKeyword);
        } else {
            let j: number = this.config.currentLineNumber + 1;
            let nextLine: string | null = this.config.getLine(j);
            while (nextLine !== null && /^[ \t]*$/m.test(nextLine)) {
                nextLine = this.config.getLine(++j);
            }
            if (nextLine !== null && (/^[ \t]*,/.test(nextLine) || /\bendlist\b/.test(nextLine))) {
                this.keywordsStack.push(this.foundKeyword);
            }
        }
    }

    /**
     * Performs required operations after a section has finished.
     * Mostly empties arrays.
     */
    private handleSection(): void {
        if (this.match == null) {
            if (this.previousSection !== undefined) {
                this.currentSection = this.previousSection;
                this.currentSettings = this.previousSettings;
            }
            return;
        }
        const [, indent, name] = this.match;
        const nextIsTags = this.currentSection && /tag/i.test(name);

        if (!nextIsTags) {
            /**
             * If the next is [tags], no need to perform checks for current section now,
             * they will be done after [tags] section finished.
             */
            this.checkRequredSettingsForSection();
            this.addCurrentToParentSettings();
            if (/widget/i.test(name)) {
                this.checkAliases();
                this.deAliases.splice(0, this.deAliases.length);
                this.aliases.splice(0, this.aliases.length);
                this.settingValues.clear();
            }
            this.checkUrlPlaceholders();
            this.ifSettings.clear();
        }
        this.previousSettings = this.currentSettings.splice(0, this.currentSettings.length);
        this.previousSection = this.currentSection;
        this.currentSection = new TextRange(name, this.createRange(indent.length, name.length));
        this.parentSettings.delete(this.currentSection.text);
        this.setSectionToStackAndTree(this.currentSection);
    }

    /**
     * Attempts to add section to section stack, displays error if section
     * is out ouf hierarchy, unknown or has unresolved section dependencies
     * If section is null, finalizes section stack and return summary error
     * Adds last section of stack to ConfigTree.
     * @param section section to add or null
     */
    private setSectionToStackAndTree(section: TextRange | null): void {
        let sectionStackError: Diagnostic | null;
        const lastSection = this.sectionStack.getLastSection();
        if (lastSection) {
            this.configTree.addSection(lastSection.range,
                lastSection.settings, this.keywordHandler.exprBlockIsDeclared);
        }
        if (section == null) {
            sectionStackError = this.sectionStack.finalize();
        } else {
            sectionStackError = this.sectionStack.insertSection(this.currentSection);
        }
        if (sectionStackError) {
            this.result.push(sectionStackError);
        }
        this.keywordHandler.exprBlockIsDeclared = false;
    }

    /**
     * Calls functions in proper order to handle a found setting
     */
    private handleSettings(): void {
        if (this.match == null) {
            return;
        }
        const line: string = this.config.getCurrentLine();
        // tag(s)|key(s) — sections, whose settings are handled in different way
        if (this.currentSection === undefined || !SECTIONS_EXCEPTIONS_REGEXP.test(this.currentSection.text)) {
            this.handleRegularSetting();
        } else if (SECTIONS_EXCEPTIONS_REGEXP.test(this.currentSection.text) &&
            // We are in tags/keys section
            /(^[ \t]*)([a-z].*?[a-z])[ \t]*=/.test(line)) {
            this.match = /(^[ \t]*)([a-z].*?[a-z])[ \t]*=/.exec(line);
            if (this.match === null) {
                return;
            }
            const [, indent, name] = this.match;
            const setting: Setting | undefined = this.getSetting(name);
            if (this.isAllowedWidget(setting)) {
                this.result.push(createDiagnostic(
                    this.createRange(indent.length, name.length),
                    settingNameInTags(name), DiagnosticSeverity.Information,
                ));
            }
        }
    }

    /**
     * Checks whether the setting is defined and is allowed to be defined in the current widget
     * @param setting the setting to be checked
     */
    private isAllowedWidget(setting: Setting): boolean {
        return setting !== undefined
            && this.currentSection.text !== "tag"
            && (setting.widget == null
                || this.currentWidget === undefined
                || setting.widget === this.currentWidget);
    }

    /**
     * Return true if the setting is allowed to be defined in the current section.
     * @param setting The setting to be checked.
     */
    private isAllowedInSection(setting: Setting): boolean {
        if (setting.section == null || this.currentSection == null) {
            return true;
        }
        const currDepth: number = ResourcesProviderBase.sectionDepthMap[this.currentSection.text];
        if (setting.name === "mode") {
            if (this.currentWidget == null) {
                return true;
            }
            if (this.currentWidget === "chart") {
                if (setting.value === "column-stack") {
                    return currDepth <= ResourcesProviderBase.sectionDepthMap.widget;
                }
                return currDepth <= ResourcesProviderBase.sectionDepthMap.series;
            }
        }
        if (Array.isArray(setting.section)) {
            return setting.section.some(s => currDepth <= ResourcesProviderBase.sectionDepthMap[s]);
        } else {
            const reqDepth: number = ResourcesProviderBase.sectionDepthMap[setting.section];
            return currDepth <= reqDepth;
        }

    }

    /**
     * Processes a regular setting which is defined not in tags/keys section
     */
    private handleRegularSetting(): void {
        const line: string = this.config.getCurrentLine();
        const setting: Setting | undefined = this.getSettingCheck();
        if (setting === undefined) {
            return;
        }
        this.addSettingValue(setting);

        /**
         * Show hint if setting is deprecated
         */
        if (setting.deprecated) {
            this.result.push(createDiagnostic(
                setting.textRange,
                setting.deprecated,
                DiagnosticSeverity.Warning
            ));
        }

        if (!this.isAllowedInSection(setting)) {
            this.result.push(createDiagnostic(
                setting.textRange,
                illegalSetting(setting.displayName), DiagnosticSeverity.Error,
            ));
        }

        if (setting.name === "type") {
            this.currentWidget = this.match[3];
            let reqs = ResourcesProviderBase.widgetRequirementsByType.get(this.currentWidget);
            if (reqs && reqs.sections) {
                this.sectionStack.setSectionRequirements("widget", reqs.sections);
            }
        }

        if (setting.multiple) {
            this.checkMultipleSetting(setting);
        }

        if (!setting.multiLine) {
            this.checkRepetition(setting);
        } else {
            this.currentSettings.push(setting);
            this.sectionStack.insertCurrentSetting(setting);
        }
        if (!(this.currentSection && ["placeholders", "properties", "property"].includes(this.currentSection.text))) {
            this.typeCheck(setting);
            this.checkExcludes(setting);
            // Aliases
            if (setting.name === "alias") {
                this.match = /(^\s*alias\s*=\s*)(\S+)\s*$/m.exec(line);
                this.addToStringArray(this.aliases);
            }
            this.findDeAliases();
        }
    }

    /**
     * Check if settings or tag key contains whitespace and warn about it.
     * Ignore any settings in [properties] section.
     */
    private checkSettingsWhitespaces(): void {
        const line: string = this.config.getCurrentLine();
        const match: RegExpMatchArray = /(^\s*)((\w+\s+)+\w+)\s*=\s*(.+?)\s*$/.exec(line);
        if (match != null && match[2]) {
            const settingName: string = match[2];
            if (settingName && !this.foundKeyword && /^\w+(\s.*\w)+$/.test(settingName)) {
                const start: number = line.indexOf(settingName);
                const range: Range = this.createRange(start, settingName.length);
                if (this.currentSection.text === "tags") {
                    if (!/^["].+["]$/.test(settingName)) {
                        this.result.push(createDiagnostic(
                            range, tagNameWithWhitespaces(settingName), DiagnosticSeverity.Warning,
                        ));
                    }
                } else if (this.currentSection.text !== "properties") {
                    this.result.push(createDiagnostic(
                        range, settingsWithWhitespaces(settingName), DiagnosticSeverity.Warning,
                    ));
                }
            }
        }
    }

    /**
     * Checks spelling mistakes in a section name
     */
    private spellingCheck(): void {
        if (this.match == null) {
            return;
        }
        const indent: number = this.match[1].length;
        const word: string = this.match[2];
        const range: Range = this.createRange(indent, word.length);

        if (word === "tag") {
            this.result.push(createDiagnostic(range, deprecatedTagSection, DiagnosticSeverity.Warning));
        }
    }

    /**
     * Calls corresponding functions for the found keyword
     */
    private switchKeyword(): void {
        if (this.foundKeyword === undefined) {
            throw new Error(`We're trying to handle a keyword, but foundKeyword is undefined`);
        }
        const line: string = this.config.getCurrentLine();
        switch (this.foundKeyword.text) {
            case "endfor":
                this.handleEndFor();
            case "endif":
                this.lastEndIf = this.config.currentLineNumber;
            case "endvar":
            case "endcsv":
            case "endlist":
            case "endsql":
            case "endscript":
            case "endexpr": {
                const expectedEnd: string = this.foundKeyword.text.substring("end".length);
                this.checkEnd(expectedEnd);
                break;
            }
            case "else":
            case "elseif": {
                this.handleElse();
                break;
            }
            case "csv": {
                this.handleCsv();
                break;
            }
            case "var": {
                const nextLine = this.config.getLine(this.config.currentLineNumber + 1);
                const openBrackets: RegExpMatchArray | null = line.match(VAR_OPEN_BRACKET) ||
                    nextLine && (nextLine).match(VAR_OPEN_BRACKET);
                const closeBrackets: RegExpMatchArray | null = line.match(VAR_CLOSE_BRACKET);
                if (openBrackets) {
                    if (closeBrackets && openBrackets.map((s: string) => s.trim()).join("").length !==
                        closeBrackets.map((s: string) => s.trim()).join("").length
                        || closeBrackets === null) {
                        // multiline var
                        this.keywordsStack.push(this.foundKeyword);
                    }
                }
                this.match = /(var\s*)(\w+)\s*=/.exec(line);
                this.addToStringMap(this.variables, "varNames");
                break;
            }
            case "list": {
                this.handleList();
                break;
            }
            case "for": {
                this.handleFor();
                break;
            }
            case "import":
                break;
            default:
                this.keywordHandler.handle(this.foundKeyword);
        }
    }

    /**
     * Performs type checks for the found setting value
     * @param setting the setting to be checked
     */
    private typeCheck(setting: Setting): void {
        if (this.match == null) {
            return;
        }
        const range: Range = this.createRange(this.match[1].length, this.match[2].length);
        const diagnostic: Diagnostic | undefined = setting.checkType(range);
        if (diagnostic != null) {
            this.result.push(diagnostic);
        }
    }

    /**
     * Creates diagnostics for a CSV line containing wrong columns number
     */
    private validateCsv(): void {
        const line: string = this.config.getCurrentLine();
        const columns: number = countCsvColumns(line);
        if (columns !== this.csvColumns && !/^[ \t]*$/m.test(line)) {
            this.result.push(
                createDiagnostic(
                    this.createRange(0, line.length),
                    `Expected ${this.csvColumns} columns, but found ${columns}`,
                ));
        }
    }

    /**
     * Creates diagnostics for unknown variables in `for` keyword
     * like `for srv in servers setting = @{server} endfor`
     * but `server` is undefined
     */
    private validateFor(): void {
        const line: string = this.config.getCurrentLine();
        const atRegexp: RegExp = /@{.+?}/g;
        this.match = atRegexp.exec(line);
        while (this.match !== null) {
            const substr: string = this.match[0];
            const startPosition: number = this.match.index;
            const varRegexp: RegExp = /[a-zA-Z_]\w*(?!\w*["\('])/g;
            this.match = varRegexp.exec(substr);
            while (this.match !== null) {
                if (substr.charAt(this.match.index - 1) === ".") {
                    this.match = varRegexp.exec(substr);
                    continue;
                }
                const variable: string = this.match[0];
                if (!isInMap(variable, this.variables)) {
                    const position: number = startPosition + this.match.index;
                    const message: string = unknownToken(variable);
                    this.result.push(createDiagnostic(
                        this.createRange(position, variable.length),
                        message,
                    ));
                }
                this.match = varRegexp.exec(substr);
            }
            this.match = atRegexp.exec(line);
        }
    }

    private getSetting(name: string): Setting | undefined {
        const line = this.config.getCurrentLine();
        const start: number = line.indexOf(name);
        const range: Range = (start > -1) ? this.createRange(start, name.length) : undefined;
        return getSetting(name, range);
    }

    private checkUrlPlaceholders() {
        let phs = this.getUrlPlaceholders();
        if (phs.length > 0) {
            if (this.currentSection && this.currentSection.text.match(/widget/i)) {
                this.sectionStack.requireSections("widget", "placeholders");
            }
        }
        let placeholderRange = this.sectionStack.getSectionRange("placeholders");
        if (placeholderRange) {
            let phSectionSettings = this.sectionStack.getSectionSettings("placeholders", false);
            let missingPhs = phs.filter(key => {
                const cleared = Setting.clearValue(key);
                return phSectionSettings.find(s => s.name === cleared) == null;
            });
            if (missingPhs.length > 0) {
                this.result.push(createDiagnostic(
                    placeholderRange.range,
                    `Missing placeholders: ${missingPhs.join(", ")}.`,
                    DiagnosticSeverity.Error
                ));
            }
            let unnecessaryPhs = phSectionSettings.filter(s => !phs.includes(s.name)).map(s => s.name);
            if (unnecessaryPhs.length > 0) {
                this.result.push(createDiagnostic(
                    placeholderRange.range,
                    `Unnecessary placeholders: ${unnecessaryPhs.join(", ")}.`,
                    DiagnosticSeverity.Warning
                ));
            }
        }
    }

    /**
     * Check that multiple type setting has right value format
     * @param setting - config setting to test
     */
    private checkMultipleSetting(setting: Setting) {
        const { displayName, example, textRange, value } = setting;
        const validSingle = value.split(" ").length === 1;
        /**
         * Workaround in case some commas are missing
         * For example: disk_used, cpu_used mem_used
         */
        const validMultiple = value.split(",").length >= value.split(" ").length;
        /**
         * If multiple setting is not correct, create diagnostic
         */
        if (!validSingle && !validMultiple) {
            this.result.push(createDiagnostic(
                textRange,
                `${displayName} should be a comma separated list. For example, ${example}`,
                DiagnosticSeverity.Error,
            ));
        }
    }

    /**
     * Returns all placeholders declared before the current line.
     */
    private getUrlPlaceholders(): string[] {
        let result = new Set<string>();
        for (let setting of placeholderContainingSettings) {
            let currentSetting = this.sectionStack.getCurrentSetting(setting);
            if (currentSetting) {
                const regexp: RegExp = /{(.+?)}/g;
                let match = regexp.exec(currentSetting.value);
                while (match !== null) {
                    const cleared: string = Setting.clearSetting(match[1]);
                    result.add(cleared);
                    match = regexp.exec(currentSetting.value);
                }
            }
        }
        return [...result];
    }

    /**
     * Creates Range object for the current line.
     *
     * @param start - The starting position in the string
     * @param length - Length of the word to be highlighted
     * @returns Range object with start equal to `start` and end equal to `start+length`
     */
    private createRange(start: number, length: number) {
        return createRange(start, length, this.config.currentLineNumber);
    }
}
