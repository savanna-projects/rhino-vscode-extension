/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/language-extensions/programmatic-language-features
 */
import * as vscode from 'vscode';

export class RhinoDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    // members
    private plugins: any[];

    /**
     * Creates a new instance of CommandsProvider
     * 
     * @param plugins A collection of plugins manifests.
     */
    constructor(plugins: any[]) {
        this.plugins = plugins;
    }

    /**
     * Provide symbol information for the given document.
     * 
     * @param document The document in which the command was invoked.
     * 
     * @returns An array of document highlights or a thenable that resolves to such.
     */
    public provideDocumentSymbols(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        let symbols: vscode.DocumentSymbol[] = [];
        let a = this.plugins;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            for (let plugin of this.plugins) {
                if (plugin.key === '') {
                    continue;
                }
                let isMatch = line.text.match(plugin.literal);
                if (!isMatch) {
                    continue;
                }
                let name = plugin.literal;
                let detail = plugin.description;
                let kind = plugin.source === 'code' ? vscode.SymbolKind.Function : vscode.SymbolKind.Object;
                let range = document.lineAt(i).range;
                let symbol = new vscode.DocumentSymbol(name, detail, kind, range, range);

                if (plugin.source !== 'code') {
                    symbol.children.push(new vscode.DocumentSymbol("Chile", "Detail", vscode.SymbolKind.Function, range, range));
                }

                symbols.push(symbol);
                break;
            }
        }

        return symbols;
    }
}
