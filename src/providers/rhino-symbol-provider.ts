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

        for (let i = 0; i < document.lineCount - 1; i++) {
            const element = document.lineAt(i);
            let name = `name-${i}`;
            let detail = `detail-${i}`;
            let kind = vscode.SymbolKind.Field;
            let range1 = document.lineAt(i).range;
            let range2 = document.lineAt(i).range;
            let symbol = new vscode.DocumentSymbol(name, detail, kind, range1, range2);
            symbols.push(symbol);
        }

        return symbols;
	}
}
