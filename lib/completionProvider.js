"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const constants_1 = require("./constants");
const languageService_1 = require("./languageService");
const util_1 = require("./util");
const _1 = require(".");
/**
 * Provides dynamic completion items.
 */
class CompletionProvider {
    constructor(textDocument, position) {
        const text = textDocument.getText().substr(0, textDocument.offsetAt(position));
        this.text = util_1.Util.deleteScripts(util_1.Util.deleteComments(text));
        let textList = this.text.split("\n");
        this.currentLine = textList[textList.length - 1];
    }
    /**
     * Creates completion items
     */
    getCompletionItems() {
        const valueMatch = /^\s*(\S+)\s*=\s*/.exec(this.currentLine);
        const bracketsMatch = /\s*(\[.*?)\s*/.exec(this.currentLine);
        if (valueMatch) {
            // completion requested at assign stage, i. e. type = <Ctrl + space>
            return this.completeSettingValue(valueMatch[1]);
        }
        else if (bracketsMatch) {
            // requested completion for section name in []
            return this.completeSectionName();
        }
        else {
            // completion requested at start of line (supposed that line is empty)
            return this.completeSnippets().concat(this.completeIf(), this.completeFor(), this.completeSettingName(), this.completeSectionName(), this.completeControlKeyWord(), this.completeEndKeyword());
        }
    }
    /**
     * Creates a completion item containing `for` loop.
     * `in` statement is generated based on previously declared lists and vars if any.
     * Variable name is generated based on `in` statement.
     * @returns completion item
     */
    completeFor() {
        const regexp = /^[ \t]*(?:list|var)[ \t]+(\S+)[ \t]*=/mg;
        let match = regexp.exec(this.text);
        let lastMatch;
        while (match) {
            lastMatch = match;
            match = regexp.exec(this.text);
        }
        let collection = "collection";
        let item = "item";
        if (lastMatch) {
            collection = lastMatch[1];
            if (collection.endsWith("s")) {
                item = collection.substr(0, collection.lastIndexOf("s"));
            }
        }
        const completion = vscode_languageserver_types_1.CompletionItem.create("for");
        completion.insertText = `
for \${1:${item}} in \${2:${collection}}
  \${3:entity = @{\${1:${item}}}}
  \${0}
endfor`;
        completion.detail = "For loop";
        completion.kind = vscode_languageserver_types_1.CompletionItemKind.Keyword;
        completion.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
        return completion;
    }
    /**
     * Creates an array of completion items containing section names.
     * @returns array containing snippets
     */
    completeControlKeyWord() {
        const items = [];
        for (let keyword of constants_1.CONTROL_KEYWORDS) {
            items.push(this.fillCompletionItem({
                detail: `Control keyword: ${keyword}`,
                insertText: `${keyword}`,
                kind: vscode_languageserver_types_1.CompletionItemKind.Keyword,
                name: keyword
            }));
        }
        return items;
    }
    /**
     * Completes keywords endings such as `endsql`, `endfor` etc
     */
    completeEndKeyword() {
        // detected `end`
        const endWordRegex = /^[ \t]*(end)[ \t]*/gm;
        // detected any control keyword in previous code
        const keywordsRegex = new RegExp(`^[ \t]*(?:${constants_1.CONTROL_KEYWORDS.join("|")})[ \t]*`, "mg");
        let completions = [];
        if (endWordRegex.test(this.text)) {
            let keywordMatch = keywordsRegex.exec(this.text);
            let keywordLastMatch;
            while (keywordMatch) {
                keywordLastMatch = keywordMatch;
                keywordMatch = keywordsRegex.exec(this.text);
            }
            if (keywordLastMatch) {
                const keyword = keywordLastMatch[0].trim();
                completions.push(this.fillCompletionItem({
                    detail: `Control keyword: ${keyword}`,
                    insertText: `end${keyword}`,
                    kind: vscode_languageserver_types_1.CompletionItemKind.Keyword,
                }));
            }
        }
        return completions;
    }
    /**
     * Creates an array of completion items containing `if` statement.
     * Conditions are generated based on previously declared `for` loops.
     * @returns array containing variants of `if` statement
     */
    completeIf() {
        const regexp = /^[ \t]*for[ \t]+(\w+)[ \t]+in/img;
        const endFor = /^[ \t]*endfor/img;
        let match = regexp.exec(this.text);
        let lastMatch;
        while (match) {
            const end = endFor.exec(this.text);
            if (!end || end.index < match.index) {
                lastMatch = match;
            }
            match = regexp.exec(this.text);
        }
        let item = "item";
        if (lastMatch) {
            item = lastMatch[1];
        }
        const ifString = vscode_languageserver_types_1.CompletionItem.create("if string");
        ifString.detail = "if item equals text";
        ifString.insertText = `
if @{\${1:${item}}} \${2:==} \${3:"item1"}
  \${4:entity} = \${5:"item2"}
else
  \${4:entity} = \${6:"item3"}
endif
\${0}`;
        const ifNumber = vscode_languageserver_types_1.CompletionItem.create("if number");
        ifNumber.insertText = `
if @{\${1:${item}}} \${2:==} \${3:5}
  \${4:entity} = \${5:"item1"}
else
  \${4:entity} = \${6:"item2"}
endif
\${0}`;
        ifNumber.detail = "if item equals number";
        const ifElseIf = vscode_languageserver_types_1.CompletionItem.create("if else if");
        ifElseIf.detail = "if item equals number else if";
        ifElseIf.insertText = `
if @{\${1:${item}}} \${2:==} \${3:5}
  \${4:entity} = \${5:"item1"}
elseif @{\${1:${item}}} \${6:==} \${7:6}
  \${4:entity} = \${8:"item2"}
else
  \${4:entity} = \${9:"item3"}
endif
\${0}`;
        return [ifString, ifNumber, ifElseIf].map((completion) => {
            completion.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
            completion.kind = vscode_languageserver_types_1.CompletionItemKind.Snippet;
            return completion;
        });
    }
    /**
     * Creates an array of completion items containing setting names.
     * @returns array containing snippets
     */
    completeSettingName() {
        const items = [];
        const map = Array.from(languageService_1.LanguageService.getResourcesProvider().settingsMap.values());
        map.forEach(value => {
            items.push(this.fillCompletionItem({
                detail: `${value.description ? value.description + "\n" : ""}Example: ${value.example}`,
                insertText: `${value.displayName} = `,
                kind: vscode_languageserver_types_1.CompletionItemKind.Field,
                name: value.displayName
            }));
        });
        return items;
    }
    /**
     * Creates an array of completion items containing section names.
     * @returns array containing snippets
     */
    completeSectionName() {
        const items = [];
        const sectionNames = Object.keys(_1.ResourcesProviderBase.sectionDepthMap);
        for (let item of sectionNames) {
            items.push(this.fillCompletionItem({
                detail: `Section name: [${item}]`,
                insertText: `${item}`,
                kind: vscode_languageserver_types_1.CompletionItemKind.Struct,
                name: item
            }));
        }
        return items;
    }
    /**
     * Creates an array of completion items containing possible values for settings.
     * @param settingName name of the setting, for example "colors"
     * @returns array containing completions
     */
    completeSettingValue(settingName) {
        const setting = languageService_1.LanguageService.getResourcesProvider().getSetting(settingName);
        if (!setting) {
            return [];
        }
        switch (setting.type) {
            case "string": {
                return this.completeStringSettingValue(setting);
            }
            case "number":
            case "integer":
                if (setting.example) {
                    return [this.fillCompletionItem({ insertText: setting.example.toString() })];
                }
                break;
            case "boolean": {
                return this.getItemsArray(["true", "false"]);
            }
            case "enum": {
                return this.getItemsArray(setting.enum.map(el => el.replace(/percentile\\.+/, "percentile(n)")));
            }
            case "interval": {
                return this.getItemsArray(constants_1.INTERVAL_UNITS, ...setting.enum);
            }
            case "date": {
                return this.getItemsArray(constants_1.CALENDAR_KEYWORDS, new Date().toISOString());
            }
            default: {
                return [];
            }
        }
        return [];
    }
    /**
     * Creates an array of completion items containing snippets.
     * @returns array containing snippets
     */
    completeSnippets() {
        const snippets = languageService_1.LanguageService.getResourcesProvider().readSnippets();
        const items = Object.keys(snippets).map((key) => {
            const insertText = (typeof snippets[key].body === "string") ?
                snippets[key].body : snippets[key].body.join("\n");
            return this.fillCompletionItem({
                insertText, detail: snippets[key].description,
                name: key, insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet, kind: vscode_languageserver_types_1.CompletionItemKind.Keyword
            });
        });
        return items;
    }
    /**
     * Creates an array of completion items containing possible values for settings with type = "string".
     * @param setting the setting
     * @returns array containing completions
     */
    completeStringSettingValue(setting) {
        let valueItems = [];
        let scriptItems = [];
        if (setting.possibleValues) {
            valueItems = setting.possibleValues.map(v => this.fillCompletionItem({ insertText: v.value, detail: v.detail }));
        }
        if (setting.script) {
            setting.script.fields.forEach((field) => {
                if (field.type === "function") {
                    let itemFields = { insertText: "", kind: vscode_languageserver_types_1.CompletionItemKind.Function };
                    if (field.args) {
                        let requiredArgs = field.args.filter(a => a.required);
                        let optionalArgs = field.args.filter(a => !a.required);
                        let requiredArgsString = `${requiredArgs.map(field => field.name).join(", ")}`;
                        itemFields.insertText = `${field.name}${requiredArgsString !== "" ?
                            "(" + requiredArgsString + ")" : ""}`;
                        scriptItems.push(this.fillCompletionItem(itemFields));
                        let args = "";
                        for (let arg of optionalArgs) {
                            args = `${args !== "" ? args + ", " : ""}${arg.name}`;
                            itemFields.insertText = `${field.name}(${requiredArgsString !== "" ?
                                requiredArgsString + ", " : ""}${args})`;
                            scriptItems.push(this.fillCompletionItem(itemFields));
                        }
                    }
                    else {
                        itemFields.insertText = field.name;
                        scriptItems.push(this.fillCompletionItem(itemFields));
                    }
                }
                else {
                    scriptItems.push(this.fillCompletionItem({
                        insertText: field.name,
                        detail: `Type: ${field.type}`
                    }));
                }
            });
        }
        if (!setting.possibleValues && setting.example !== "") {
            valueItems = [this.fillCompletionItem({
                    insertText: setting.example.toString(),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Field
                })];
        }
        return valueItems.concat(scriptItems);
    }
    /**
     * Set fields for CompletionItem
     * @param insertText text to be inserted with completion request
     * @returns completion
     */
    fillCompletionItem(itemFields) {
        let item = vscode_languageserver_types_1.CompletionItem.create(itemFields.name || itemFields.insertText);
        item.insertTextFormat = itemFields.insertTextFormat || vscode_languageserver_types_1.InsertTextFormat.PlainText;
        item.kind = itemFields.kind || vscode_languageserver_types_1.CompletionItemKind.Value;
        item.insertText = itemFields.insertText;
        item.detail = itemFields.detail || itemFields.insertText;
        item.sortText = item.kind.toString();
        return item;
    }
    /**
     * Сonverts the source array to array of completions
     * @param processedArray the source array
     * @param additionalStrings the strings to be processed and added to completions
     * @returns completions
     */
    getItemsArray(processedArray, ...additionalStrings) {
        let items = processedArray.map(el => this.fillCompletionItem({ insertText: el }));
        for (let s of additionalStrings) {
            items.push(this.fillCompletionItem({ insertText: s }));
        }
        return items;
    }
}
exports.CompletionProvider = CompletionProvider;
