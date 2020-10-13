// https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
import { fstat } from 'fs';
import { win32 } from 'path';
import * as vscode from 'vscode';
import { RhinoActionsProvider } from './actions-provider';
import { Utilities } from './extensions/utilities';

export function activate(context: vscode.ExtensionContext) {
	console.log('Rhino Language support is now active');

	// commnad implementation: activate
	let activate = vscode.commands.registerCommand('rhino-language-support.activate', () => {
		vscode.window.showInformationMessage('Activate');
	});

	// commnad implementation: createProject
	let createProject = vscode.commands.registerCommand('rhino-language-support.createProject', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false
		})
		.then(folderUri => {
			// folder
			Utilities.createProjectFolder(folderUri);
			Utilities.createProjectManifest(folderUri);

			// notification
			vscode.window.showInformationMessage('Rhino project successfully created.');
		});
	});

	let run = vscode.commands.registerCommand("rhino-language-support.run", () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false
		})
		.then(fileUri => {
			// get active document
			var editor = vscode.window.activeTextEditor;
			
			// exit conditions
			if(!editor) {
				return;
			}

			// get automation spec (test cases)
			var testCases: string[] = [];
			editor.document.getText().split(">>>").forEach(i => testCases.push(i.trim()));

			// get manifest
			var ws = vscode.workspace.workspaceFolders;
			if(ws) {
				console.log(ws[0].uri.fsPath);
			}
		});
	});

	// register: rhino actions
	const actionsProvider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'rhino' }, {
		provideCompletionItems() {
			return RhinoActionsProvider.get();
		}
	});

	// register: auto complete
	const autoComplete = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'rhino' }, {
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
	}, '$');

	context.subscriptions.push(actionsProvider/*, autoComplete*/);
	context.subscriptions.push(activate, createProject, run);
}

// this method is called when your extension is deactivated
export function deactivate() {}
