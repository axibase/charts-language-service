import { deleteComments } from "./util";

/**
 * Stores config lines as array, removes comments.
 */
export class Config {
    public currentLineNumber: number = -1;
    private currentLine: string;
    private lines: string[];

    public constructor(text: string) {
        this.lines = deleteComments(text)
            .toLowerCase()
            .split("\n");
    }

    public getCurrentLine(): string {
        return this.currentLine;
    }

    /**
     * Returns lowercased config line with specified index.
     *
     * @param line - Index of line to be returned
     * @returns Lowercased line of config with index equal to `line`
     */
    public getLine(line: number): string | null {
        return (line < this.lines.length && line >= 0) ? this.lines[line] : null;
    }

    public iterator() {
        return this[Symbol.iterator]();
    }

    public [Symbol.iterator]() {
        const that = this;
        return {
            next() {
                that.currentLine = that.lines[++that.currentLineNumber];
                return { value: that.currentLine, done: !(that.currentLineNumber in that.lines) };
            }
        };
    }
}
