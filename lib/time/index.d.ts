import { Diagnostic } from "vscode-languageserver-types";
import { Section } from "../configTree/section";
import { Setting } from "../setting";
/**
 * Parses value of time setting, adds diagnostic to `errors` if any error during parsing was thrown.
 *
 * @param timeSetting - Date setting, which value is need to be parsed
 * @param timeParser - Util class, containig methods for date parsing
 * @param errors - Array of diagnosics, to which information about error is added
 * @returns Value of `timeSetting`, parsed to Date.
 */
export declare function parseTimeValue(timeSetting: Setting, section: Section, errors: Diagnostic[]): Date;
