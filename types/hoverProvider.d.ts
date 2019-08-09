import { Hover, Position, TextDocument } from "vscode-languageserver-types";
/**
 * Provides hints for settings
 */
export declare class HoverProvider {
    /**
     * TextDocument content
     */
    private readonly text;
    /**
     * The target TextDocument
     */
    private readonly document;
    constructor(document: TextDocument);
    /**
     * Provides hover for the required position
     * @param position position where hover is requested
     */
    provideHover(position: Position): Hover | null;
    /**
     * Converts Position to offset
     * @param position the Position to be converted
     */
    private positionToOffset;
    /**
     * Converts offset to Position
     * @param offset the offset to be converted
     */
    private offsetToPosition;
    /**
     * Finds limits of a line in text
     * @param position position from which to start
     */
    private lineLimits;
    /**
     * Calculates the range where the setting is defined
     * @param offset offset from which to start
     */
    private calculateRange;
}
