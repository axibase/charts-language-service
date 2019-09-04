import * as assert from "assert";
import { Diagnostic, Hover, Position, TextDocument, TextEdit } from "vscode-languageserver-types";
import { CompletionProvider } from "../completionProvider";
import { HoverProvider } from "../hoverProvider";
import { SectionStack } from "../sectionStack";
import { Validator } from "../validator";

/**
 * Stub section validator to allow incomplete configs in tests
 */
// tslint:disable-next-line:no-object-literal-type-assertion
const sectionStackStub: SectionStack = {
    stack: [],
    finalize(): null { return null; },
    getCurrentSetting(): null { return null; },
    getLastSection(): null { return null; },
    getSectionRange(): null { return null; },
    getSectionSettings() { return new Map(); },
    insertCurrentSetting() { /* void */ },
    insertSection(): null { return null; },
    requireSections() { /* void */ },
    setSectionRequirements() { /* void */ },
} as any;

/**
 * Contains a test case and executes the test
 */
export class Test {
    /**
     * The expected result of the target function
     */
    private readonly expected: Diagnostic[] | TextEdit[] | Hover | string[];
    /**
     * The name of the test. Displayed in tests list after the execution
     */
    private readonly name: string;
    /**
     * Position of Hover used in hover tests
     */
    private readonly position?: Position;
    /**
     * Text of the test document
     */
    private readonly text: string;
    private readonly document: TextDocument;

    public constructor(
        name: string,
        text: string,
        expected: Diagnostic[] | TextEdit[] | Hover | string[],
        position?: Position,
    ) {
        this.name = name;
        this.text = text;
        this.expected = expected;
        this.position = position;
        this.document = TextDocument.create("test", "axibasecharts", 1, text);
    }

    /**
     * Tests Validator
     */
    public validationTest(): void {
        test((this.name), () => {
            let validator = new Validator(this.text);
            Object.assign(validator, { sectionStack: sectionStackStub });
            assert.deepStrictEqual(validator.lineByLine(), this.expected);
        });
    }

    /**
     * Tests Hover
     */
    public hoverTest(): void {
        test((this.name), () => {
            assert.deepStrictEqual(new HoverProvider(this.document).provideHover(this.position), this.expected);
        });
    }

    /**
     * Tests CompletionProvider
     */
    public completionTest(): void {
        test((this.name), () => {
            const cp: CompletionProvider = new CompletionProvider(this.document, this.position);
            const current: string[] = cp.getCompletionItems().map(i => i.insertText);
            assert.deepStrictEqual(current, this.expected);
        });
    }
}
