import { Position, Range } from "vscode-languageserver-types";
import { Test } from "./test";

// tslint:disable-next-line:max-line-length
const message = "Apply server-side filter to all series based on entity names, tags, and fields.  \n\nExample: entity-expression = tags.app = 'ATSD'  \nType: string  \nCan not be specified with: entities,entity,entity-group  \nAllowed in section: series  \nAllowed in widgets: all  \n";
suite("Hover tests", () => {
    [
        new Test(
            "Hover place is calculated properly",
            `[configuration]
  entity-expression = cpu_busy`,
            {
                contents: message,
                range: Range.create(1, "  ".length, 1, "  ".length + "entity-expression".length),
            },
            Position.create(1, "  ent".length),
        ),
        new Test(
            "Hover is not provided for a value",
            `[configuration]
  entity-expression = cpu_busy`,
            null,
            Position.create(1, "  entity-expression = c".length),
        ),
        new Test(
            "Hover is not provided for a section",
            `[configuration]
  entity-expression = cpu_busy`,
            null,
            Position.create(0, "[conf".length),
        ),
        new Test(
            "Hover is provided for a setting containing whitespace",
            `[configuration]
  entity expression = cpu_busy`,
            {
                contents: message,
                range: Range.create(1, "  ".length, 1, "  ".length + "entity expression".length),
            },
            Position.create(1, "  entity expr".length),
        ),
        new Test(
            "Hover is provided if a space between setting name and equals sign is absent",
            `[configuration]
  entity expression= cpu_busy`,
            {
                contents: message,
                range: Range.create(1, "  ".length, 1, "  ".length + "entity expression".length),
            },
            Position.create(1, "  entity expr".length),
        ),
    ].forEach((test: Test): void => test.hoverTest());
});
