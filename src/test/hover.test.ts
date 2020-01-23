import { deepStrictEqual } from "assert";
import { Position, TextDocument } from "vscode-languageserver-types";
import { HoverProvider } from "../hoverProvider";
import { createRange } from "../util";

// tslint:disable-next-line:max-line-length
const message = "Apply server-side filter to all series based on entity names, tags, and fields.  \n\nExample: entity-expression = tags.app = 'ATSD'  \nType: string  \nCan not be specified with: entities,entity,entity-group  \nAllowed in section: series  \nAllowed in widgets: all  \n";
suite("Hover tests", () => {
    test("Hover place is calculated properly", () => {
        const config = `[configuration]
entity-expression = cpu_busy`;
        const document = TextDocument.create("test", "axibasecharts", 1, config);
        const actual = new HoverProvider(document)
                .provideHover(Position.create(1, "  ent".length));
        const expected = {
            contents: message,
            range: createRange(0, "entity-expression".length, 1)
        };
        deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
    test("Hover is not provided for a value", () => {
        const config = `[configuration]
  entity-expression = cpu_busy`;
        const document = TextDocument.create("test", "axibasecharts", 1, config);
        const actual = new HoverProvider(document)
                .provideHover(Position.create(1, "  entity-expression = c".length));
        const expected = null;
        deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
    test("Hover is not provided for a section", () => {
        const config = `[configuration]
entity-expression = cpu_busy`;
        const document = TextDocument.create("test", "axibasecharts", 1, config);
        const actual = new HoverProvider(document)
                .provideHover(Position.create(0, "[conf".length));
        const expected = null;
        deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
    test("Hover is provided for a setting containing whitespace", () => {
        const config = `[configuration]
entity expression = cpu_busy`;
        const document = TextDocument.create("test", "axibasecharts", 1, config);
        const actual = new HoverProvider(document)
                .provideHover(Position.create(1, "  entity expr".length));
        const expected = {
            contents: message,
            range: createRange(0, "entity expression".length, 1)
        };
        deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
    test("Hover is provided if a space between setting name and equals sign is absent", () => {
        const config = `[configuration]
entity expression= cpu_busy`;
        const document = TextDocument.create("test", "axibasecharts", 1, config);
        const actual = new HoverProvider(document)
                .provideHover(Position.create(1, "  entity expr".length));
        const expected = {
            contents: message,
            range: createRange(0, "entity expression".length, 1)
        };
        deepStrictEqual(actual, expected, `Config: \n${config}`);
    });
});
