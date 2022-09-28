import * as vscode from 'vscode';

export class RhinoDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
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