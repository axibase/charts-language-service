"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const setting_1 = require("./setting");
const languageService_1 = require("./languageService");
/**
 * Provides hints for settings
 */
class HoverProvider {
    constructor(document) {
        this.text = document.getText();
        this.document = document;
    }
    /**
     * Provides hover for the required position
     * @param position position where hover is requested
     */
    provideHover(position) {
        const range = this.calculateRange(this.positionToOffset(position));
        if (range === null) {
            return null;
        }
        const word = this.text.substring(range.start, range.end);
        const name = setting_1.Setting.clearSetting(word);
        const setting = languageService_1.LanguageService.getResourcesProvider().getSetting(name);
        if (setting == null || setting.description == null) {
            return null;
        }
        return {
            contents: setting.toString(),
            range: vscode_languageserver_types_1.Range.create(this.offsetToPosition(range.start), this.offsetToPosition(range.end)),
        };
    }
    /**
     * Converts Position to offset
     * @param position the Position to be converted
     */
    positionToOffset(position) {
        return this.document.offsetAt(position);
    }
    /**
     * Converts offset to Position
     * @param offset the offset to be converted
     */
    offsetToPosition(offset) {
        return this.document.positionAt(offset);
    }
    /**
     * Finds limits of a line in text
     * @param position position from which to start
     */
    lineLimits(position) {
        return {
            end: this.positionToOffset(vscode_languageserver_types_1.Position.create(position.line + 1, 0)) - 1,
            start: this.positionToOffset(vscode_languageserver_types_1.Position.create(position.line, 0)),
        };
    }
    /**
     * Calculates the range where the setting is defined
     * @param offset offset from which to start
     */
    calculateRange(offset) {
        const lineLimits = this.lineLimits(this.offsetToPosition(offset));
        const line = this.text.substring(lineLimits.start, lineLimits.end);
        const regexp = /\S.+?(?=\s*?=)/;
        const match = regexp.exec(line);
        if (match === null) {
            return null;
        }
        const start = lineLimits.start + match.index;
        const end = start + match[0].length;
        if (offset >= start && offset <= end) {
            return { end, start };
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
