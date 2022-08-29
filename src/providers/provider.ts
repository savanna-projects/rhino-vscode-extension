/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

export abstract class Provider {
    /**
     * Summary. Register all providers into the given context. 
     */
    public abstract register(context: vscode.ExtensionContext): any;

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public abstract setManifests(manifests: any): any;

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
     * @param manifests A collection of locators references as returns by Rhino Server.
     * @returns Self reference.
     */
    public isUnderAnnotation(document: vscode.TextDocument, position: vscode.Position, annotation: string, annotations: any[])
        : boolean {
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
     * @param manifests A collection of annotations references as returns by Rhino Server.
     * @returns Self reference.
     */
    public getSection(document: vscode.TextDocument, annotation: string, annotations: any[])
        : string[] {
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
    // 
    public isCli(line: string, index: number): boolean {
        // setup
        index = index < 0 ? 0 : index;

        // build
        while (index > 0) {
            if (index - 1 < 0) {
                return false;
            }

            let _isCli = line.substring(index - 1, 3) === '{{$';
            if (_isCli) {
                return true;
            }
            index = index - 1;
        }

        // get
        return false;
    }
}