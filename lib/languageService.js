"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const hoverProvider_1 = require("./hoverProvider");
class LanguageService {
    static initialize(resourcesProvider) {
        LanguageService.resourcesProvider = resourcesProvider;
    }
    static getResourcesProvider() {
        if (LanguageService.resourcesProvider === undefined) {
            throw new Error("LanguageService wasn't properly initialized with ResourcesProvider");
        }
        return LanguageService.resourcesProvider;
    }
    static getCompletionProvider(textDocument, position) {
        return new _1.CompletionProvider(textDocument, position);
    }
    static getValidator(text) {
        return new _1.Validator(text);
    }
    static getHoverProvider(document) {
        return new hoverProvider_1.HoverProvider(document);
    }
    static getFormatter(text, formattingOptions) {
        return new _1.Formatter(text, formattingOptions);
    }
}
exports.LanguageService = LanguageService;
