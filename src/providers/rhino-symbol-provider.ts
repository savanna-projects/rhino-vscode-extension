/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/language-extensions/programmatic-language-features
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Utilities } from '../extensions/utilities';
import { RhinoClient } from '../framework/rhino-client';
import { Provider } from './provider';

export class RhinoDocumentSymbolProvider extends Provider implements vscode.DocumentSymbolProvider {
    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        super();
    }

    /**
     * Provide symbol information for the given document.
     * 
     * @param document The document in which the command was invoked.
     * 
     * @returns An array of document highlights or a thenable that resolves to such.
     */
    public provideDocumentSymbols(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        return this.resolveSymbols(document);
    }

    /**
     * Provide symbol information for the given document.
     * 
     * @param document The document in which the command was invoked.
     * 
     * @returns An array of DocumentSymbol.
     */
    public resolveSymbols(document: vscode.TextDocument): Thenable<vscode.DocumentSymbol[]> {
        const get = (symbols: any[]) => {
            let documentSymbols = [];
            try {
                for (let symbol of symbols) {
                    documentSymbols.push(this.resolveSymbol(symbol));
                }
            } catch (error) {
                console.error(error);
            }
            return documentSymbols;
        };

        let options = { location: { viewId: "outline" } };
        return vscode.window.withProgress(options, () => {
            return new Promise<vscode.DocumentSymbol[]>(function (resolve, reject) {
                // setup
                let text = document.getText();
                let input = text === undefined ? '' : text;

                // bad request
                if (input === undefined || input === '') {
                    resolve([]);
                }

                // setup
                let endpoint = Utilities.getRhinoEndpoint();
                let client = new RhinoClient(endpoint);

                // resolve
                client.getSymbols(input, (data: string) => {
                    let symbols = JSON.parse(data);
                    let documentSymbols = get(symbols);

                    if (documentSymbols === null || documentSymbols === undefined || documentSymbols.length === 0) {
                        return [];
                    }

                    let symbolsTree = documentSymbols.length > 1
                        ? documentSymbols
                        : documentSymbols[0].children;
                    resolve(symbolsTree);
                });
            });
        });
    }

    private resolveSymbol(symbol: any): vscode.DocumentSymbol {
        // setup meta-data
        let name = symbol.name;
        let details = symbol.details;
        let kind = undefined;

        // setup kind
        switch (symbol.type) {
            case "Boolean":
                kind = vscode.SymbolKind.Boolean;
                break;
            case "Class":
                kind = vscode.SymbolKind.Class;
                break;
            case "Model":
                kind = vscode.SymbolKind.String;
                break;
            case "Module":
                kind = vscode.SymbolKind.Module;
                break;
            default:
                kind = vscode.SymbolKind.Method;
                break;
        }

        // setup range
        let start = new vscode.Position(symbol.range.start.line, symbol.range.start.character);
        let end = new vscode.Position(symbol.range.end.line, symbol.range.end.character);
        let range = new vscode.Range(start, end);

        let selectedStart = new vscode.Position(symbol.selectedRange.start.line, symbol.selectedRange.start.character);
        let selectedEnd = new vscode.Position(symbol.selectedRange.end.line, symbol.selectedRange.end.character);
        let selectedRange = new vscode.Range(selectedStart, selectedEnd);

        const documentSymbol = new vscode.DocumentSymbol(name, details, kind, range, selectedRange);

        // exit conditions
        if (symbol.symbols === undefined || symbol.symbols.length === 0) {
            return documentSymbol;
        }

        // recurse
        documentSymbol.children = [];
        for (let item of symbol.symbols) {
            let child = this.resolveSymbol(item);
            documentSymbol.children.push(child);
        }

        // get
        return documentSymbol;
    }

    /**
     * Summary. Register all providers into the given context. 
     */
    public register(context: vscode.ExtensionContext): any {
        // setup
        let options = [ExtensionSettings.providerOptions];

        // register
        context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(options, this));
    }
}
