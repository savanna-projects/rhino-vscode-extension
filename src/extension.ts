// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RhinoActionsProvider } from './actions-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rhino-language-support" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('rhino-language-support.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Rhino Language Support!');
	});

	// Register Rhino Actions
	console.log('Starting registerCompletionItemProvider');
	const provider1 = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'rhino' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			return RhinoActionsProvider.get();
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'rhino' }, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			// get all text until the `position` and check if it reads `console.`
			// and if so then complete if `log`, `warn`, and `error`
			const linePrefix = document.lineAt(position).text.substr(0, position.character);
			if (!linePrefix.endsWith('{{$')) {
				return undefined;
			}
			
			return [
				new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
				new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
				new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
			];
		}
	}, '$'); // triggered whenever a '.' is being typed

	context.subscriptions.push(provider1, provider2);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
