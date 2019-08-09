"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const completionProvider_1 = require("./completionProvider");
const formatter_1 = require("./formatter");
const hoverProvider_1 = require("./hoverProvider");
const validator_1 = require("./validator");
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
        return new completionProvider_1.CompletionProvider(textDocument, position);
    }
    static getValidator(text) {
        return new validator_1.Validator(text);
    }
    static getHoverProvider(document) {
        return new hoverProvider_1.HoverProvider(document);
    }
    static getFormatter(text, formattingOptions) {
        return new formatter_1.Formatter(text, formattingOptions);
    }
}
exports.LanguageService = LanguageService;
