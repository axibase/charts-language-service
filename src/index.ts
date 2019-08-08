import { CompletionProvider } from "./completionProvider";
import { DefaultSetting } from "./defaultSetting";
import { Formatter } from "./formatter";
import { HoverProvider } from "./hoverProvider";
import { LanguageService } from "./languageService";
import { ResourcesProviderBase } from "./resourcesProviderBase";
import { Setting } from "./setting";
import { Validator } from "./validator";

const descriptions = require("./resources/descriptions.md");
const dictionary = require("./resources/dictionary.json");
const snippets = require("./resources/snippets/snippets.json");

export {
    DefaultSetting, Formatter, HoverProvider, LanguageService, 
    CompletionProvider, ResourcesProviderBase, Setting, Validator,
    descriptions, dictionary, snippets
};
