import * as vscode from 'vscode';

export class RhinoDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

	// public provideDocumentSymbolInformation(document: vscode.TextDocument): vscode.ProviderResult<vscode.SymbolInformation[]> {
    //     let symbols: vscode.SymbolInformation[] = [];

    //     for (let i = 0; i < document.lineCount - 1; i++) {
    //         const element = document.lineAt(i);
    //         let name = `name-${i}`;
    //         let detail = `detail-${i}`;
    //         let kind = vscode.SymbolKind.Field;
    //         let range1 = document.lineAt(i).range;
    //         let range2 = document.lineAt(i).range;
    //         let loc = new vscode.Location()
    //         let symbol = new vscode.SymbolInformation(name, vscode.SymbolKind.Field, "range1");
    //         symbols.push(symbol);
    //     }

    //     return symbols;
	// }

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