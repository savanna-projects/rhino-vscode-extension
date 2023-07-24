/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Channels } from '../constants/channels';
import { Utilities } from '../extensions/utilities';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Logger } from '../logging/logger';

export abstract class ProviderBase {
    // members: static
    public readonly logger: Logger;

    // properties
    public readonly context: vscode.ExtensionContext;
    public readonly client: RhinoClient;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        // setup
        this.logger = new ExtensionLogger(Channels.extension, "ProviderBase");
        this.context = context;
        this.client = new RhinoClient(Utilities.getRhinoEndpoint());
    }

    /**
     * Summary. Register all providers into the given context. 
     */
    public async register(): Promise<void> {
        await this.onRegister(this.context);
    }

    protected abstract onRegister(context: vscode.ExtensionContext): Promise<void>;

    /**
     * Summary. Gets a locators auto-complete enum snippet.
     * 
     * @param locators A collection of locators references as returns by Rhino Server.
     * @returns Self reference.
     */
    public getLocatorsEnums(locators: any): string {
        // setup
        locators = locators === null || locators === undefined ? [] : locators;
        let _locators = [];

        // build
        for (const locator of locators) {
            if (locator.literal === 'x path') {
                _locators.push('xpath');
                continue;
            }
            _locators.push(locator.literal);
        }

        // get
        return Array.from(new Set(_locators)).sort().join(',');
    }

    /**
     * Summary. Returns true if the current position in the current document is under a given annotation.
     * 
     * @param annotations A collection of locators references as returns by Rhino Server.
     * @returns Self reference.
     */
    public isUnderAnnotation(
        document: vscode.TextDocument,
        position: vscode.Position,
        annotation: string,
        annotations: any[]): boolean {

        // setup
        let pattern = annotations.map((i) => '^\\[' + i.key + ']').join('|');
        let testPattern = '^\\[' + annotation + ']';

        // iterate
        let line = position.line;
        while (line !== 0) {
            if (!document.lineAt(line).text.match(pattern)) {
                line = line - 1;
                continue;
            }
            return document.lineAt(line).text.match(testPattern) !== null;
        }

        // default
        return false;
    }

    /**
     * Summary. Returns a complete text section placed under the given annotation.
     * 
     * @param annotations A collection of annotations references as returns by Rhino Server.
     * @returns Self reference.
     */
    public getSection(document: vscode.TextDocument, annotation: string, annotations: any[]): string[] {
        try {
            // bad request
            if (annotations === undefined || annotations === null || annotations.length === 0) {
                return [];
            }

            // setup
            let map = annotations.map((i) => i.key).filter((i) => i !== annotation);
            let pattern = map.map((i) => '^\\[' + i + ']').join('|');
            let testPattern = '^\\[' + annotation + ']';

            // get line number
            let onLine = 0;
            for (onLine; onLine < document.lineCount; onLine++) {
                if (document.lineAt(onLine).text.match(testPattern) !== null) {
                    break;
                }
            }

            // iterate
            let lines: string[] = [];
            while (onLine < document.lineCount) {
                if (document.lineAt(onLine).text.match(pattern)) {
                    break;
                }
                lines.push(document.lineAt(onLine).text);
                onLine += 1;
            }

            // default
            return lines;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    /**
     * Summary. Returns true if the currnet cursor position in the current line is inside a CLI wrapper.
     */
    public isCli(line: string, index: number): boolean {
        // setup
        index = index < 0 ? 0 : index;
        let cliStartIndex = line.indexOf('{{$');
        return cliStartIndex > 0 && index > cliStartIndex;
    }

    // TODO: breakout conditions
    public getMultilineContent(document: vscode.TextDocument, position: vscode.Position) {
        const multilineRegex = /\s`$/g;
        let multiLine = document.lineAt(position).text;
        for (let i = document.lineAt(position).lineNumber - 1; i > 0 && document.lineAt(i).text.match(multilineRegex) !== null; i--) {
            multiLine = document.lineAt(i).text + multiLine;
        }
        return multiLine;
    }
}
