/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 */
import * as vscode from 'vscode';
import { ConnectRhinoServer } from './commands/connect-rhino-server';

import { Utilities } from './extensions/utilities';
import { ActionsAutoCompleteProvider } from './framework/actions-auto-complete-provider';
import { MacrosAutoCompleteProvider } from './framework/macros-auto-complete-provider';
import { RhinoClient } from './framework/rhino-client';

/**
 * Summary. This function will be called upon activating the extension.
 * 
 * @param context The context of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
	/**
	 * Summary. Register 'Connect-RhinoServer' command.
	 */
	context.subscriptions.push(vscode.commands.registerCommand('Connect-RhinoServer', () => {
		new ConnectRhinoServer(context).register();
	}));
	
	// let startRhinoLanguageSupport = vscode.commands.registerCommand('Connect-RhinoServer', () => {
	// 	// setup
	// 	var projectManifest = Utilities.getProjectManifest();
	// 	var rhinoServer = projectManifest.rhinoServer;
	// 	var endpoint = rhinoServer.schema + '://' + rhinoServer.host + ':' + rhinoServer.port;		
	// 	var client = new RhinoClient(endpoint);
	// 	var options = {
	// 		scheme: 'file',
	// 		language: 'rhino'
	// 	};
	// 	vscode.window.showInformationMessage('Connect-RhinoServer -> Processing...');

	// 	// build
	// 	client.getPlugins((plugins: any[]) => {
	// 		client.getMacros((macros: any[]) => {
	// 			client.getLocators((locators: any[]) => {
	// 				client.getAttributes((attributes: any[]) => {
	// 					// setup
	// 					var pattern = Utilities.getPluginsPattern(plugins);
	// 					var macrosProvider = new MacrosAutoCompleteProvider().setManifests(macros);
	// 					var actionsProvider = new ActionsAutoCompleteProvider()
	// 						.setManifests(plugins)
	// 						.setLocators(locators)
	// 						.setAttributes(attributes)
	// 						.setPattern(pattern);

	// 					// register actions auto-complete
	// 					context.subscriptions.push(vscode.languages.registerCompletionItemProvider(options, {
	// 						provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
	// 							return actionsProvider.getActionsCompletionItems(document, position);
	// 						}
	// 					}));

	// 					// register parameters behavior
	// 					context.subscriptions.push(vscode.languages.registerCompletionItemProvider(options, {
	// 						provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
	// 							return actionsProvider.getParametersCompletionItems(document, position);
	// 						}
	// 					}, '-'));

	// 					// register properties
	// 					client.getProperties((properties: any[]) => {
	// 						context.subscriptions.push(vscode.languages.registerCompletionItemProvider(options, {
	// 							provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
	// 								return actionsProvider.getAnnotationsCompletionItems(properties, document, position);
	// 							}
	// 						}, '['));
	// 					});

	// 					// TODO: register macro behavior
	// 					// TODO: register assertion behaviour

	// 					// notification
	// 					var message = 'Connect-RhinoServer -> (Status: Ok, NumberOfPlugins: ' + plugins.length + ')';
	// 					vscode.window.showInformationMessage(message);	
	// 				});
	// 			});	
	// 		});
	// 	});		
	// });

	/**
	 * Summary. Register 'Create-RhinoProject' command.
	 */
	let createRhinoProject = vscode.commands.registerCommand('Create-RhinoProject', () => {
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
			vscode.window.showInformationMessage('Create-RhinoProject -Path ' + folderUri + ' -> Created');
		});
	});

	/**
	 * Summary. Register 'Invoke-RhinoTestCase' command.
	 */
	let invokeRhinoTestCase = vscode.commands.registerCommand("Invoke-RhinoTestCase", () => {
		// setup
		var editor = vscode.window.activeTextEditor;
		const path = require('path');
		const fs = require('fs');
		
		// exit conditions
		if(!editor) {
			return;
		}
		
		// get automation spec (test cases)
		var testCases: string[] = [];
		var testCase = editor.document.getText();
		editor.document.getText().split(">>>").forEach(i => testCases.push(i.trim()));
		
		// get manifest
		var ws = vscode.workspace.workspaceFolders;
		if(ws) {
			var p = path.join(ws[0].uri.fsPath, "manifest.json");
			fs.readFile(p, 'utf8', function (err: any, data: any) {
				if (err) {
					console.error(err);
					vscode.window.showErrorMessage(err.message);
				}
				var manifest = JSON.parse(data);
				Utilities.execute(testCase, manifest);
			});
		}
	});






































	// register: auto complete
	// const autoComplete = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'rhino' }, {
	// 	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
	// 		// get all text until the `position` and check if it reads `console.`
	// 		// and if so then complete if `log`, `warn`, and `error`
	// 		var linePrefix = document.lineAt(position).text.substr(0, position.character);
	// 		if (!linePrefix.match('{{\\$\\s+-{2}(}})?$')) {
	// 			return undefined;
	// 		}
			
	// 		var a  = new vscode.CompletionItem('log', vscode.CompletionItemKind.Method);
	// 		a.documentation = "parameter help";

	// 		return [
	// 			a,
	// 			new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
	// 			new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
	// 		];
	// 	}
	// }, '-', '$');

	//context.subscriptions.push(autoComplete);
	//context.subscriptions.push(startRhinoLanguageSupport, createRhinoProject, invokeRhinoTestCase);
}

// this method is called when your extension is deactivated
export function deactivate() { }