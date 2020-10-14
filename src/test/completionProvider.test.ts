import { deepStrictEqual, strictEqual } from "assert";
import { CompletionItem, Position, TextDocument } from "vscode-languageserver-types";
import { CompletionProvider } from "../completionProvider";

suite("General CompletionProvider tests", () => {
    test("Correct: completion using possibleValues", () => {
        const text = `type = `;
        const expected = ["chart", "gauge", "treemap", "bar", "calendar", "histogram", "box",
                          "pie", "graph", "text", "page", "console", "table", "property"];
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, Position.create(0, "type = ".length));
        const actual: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        deepStrictEqual(actual, expected);
    });
    test("Correct: completion using example", () => {
        const text = `url = `;
        const expected = ["http://atsd_hostname:port"];
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, Position.create(0, "url = ".length));
        const actual: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        deepStrictEqual(actual, expected);
    });
    test("Correct: completion using example and script", () => {
        const text = `alert-style = `;
        const expected = ["stroke: red; stroke-width: 2", "alert"];
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, Position.create(0, "alert-style = ".length));
        const actual: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        deepStrictEqual(actual, expected);
    });

    test("Correct: completion using custom provider", () => {
        const text = `instrument = `;
        const expected = ["demo_[demo]"];
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const completers = {"instrument": () => expected};
        const cp: CompletionProvider = new CompletionProvider(document, Position.create(0, text.length), completers);
        const actual: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        deepStrictEqual(actual, expected);
    });

    test("Correct: completion using custom provider with prefix", () => {
        const text = `instrument = demo`;
        const expected = ["demo_[demo]"];
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const completers = {"instrument": (prefix: string) => prefix === "demo" ? expected : []};
        const cp: CompletionProvider = new CompletionProvider(document, Position.create(0, text.length), completers);
        const actual: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        deepStrictEqual(actual, expected);
    });
});

/**
 * Tests CompletionProvider for endkeywords, such as 'endif', 'endsql', etc
 */
suite("CompletionProvider endkeywords tests", () => {
    test("Endscript keyword completion", () => {
        const text = `script
        end`;
        const expected = "endscript";
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        strictEqual(current.includes(expected), true);
    });

    test("Start keyword misspelled, no completion", () => {
        const text = `sq
        end`;
        const expected = "endsql";
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        strictEqual(current.includes(expected), false);
    });

    test("Doesn't offer mismatched keyword completion", () => {
        const text = `sql
        end`;
        const expected = "endscript";
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: string[] = (cp.getCompletionItems() as CompletionItem[]).map(i => i.insertText);
        strictEqual(current.includes(expected), false);
    });

    test("No suggestions (same line) for control keywords", () => {
        const text = `csv =`;
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: CompletionItem[] = (cp.getCompletionItems() as CompletionItem[]);
        deepStrictEqual(current.length, 0);
    });

    test("No section name suggestions if line already contains section", () => {
        const text = `[widget] `;
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: CompletionItem[] = (cp.getCompletionItems() as CompletionItem[]);
        deepStrictEqual(current.length, 0);
    });

    test("No suggestions after if expression", () => {
        const text = `if hello == 'abc' `;
        const position = Position.create(2, 1);
        const document: TextDocument = TextDocument.create("test", "axibasecharts", 1, text);
        const cp: CompletionProvider = new CompletionProvider(document, position);
        const current: CompletionItem[] = (cp.getCompletionItems() as CompletionItem[]);
        deepStrictEqual(current.length, 0);
    });
});
