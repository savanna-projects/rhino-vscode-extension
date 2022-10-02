import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
import { ExtensionSettings } from './extension-settings';
import { Utilities } from './extensions/utilities';
import { RhinoClient } from './framework/rhino-client';
import { DocumentsProvider } from './providers/documents-provider';
import { PipelinesProvider } from './providers/pipelines-provider';
import { RhinoDocumentSymbolProvider } from './providers/rhino-symbol-provider';
import { ScriptsProvider } from './providers/scripts-provider';

export function activate(context: vscode.ExtensionContext) {
	// create explorer views
	vscode.window.createTreeView('rhinoDocumentation', {
		treeDataProvider: new DocumentsProvider()
	});
	vscode.window.createTreeView('rhinoPipelines', {
		treeDataProvider: new PipelinesProvider()
	});
	vscode.window.createTreeView('rhinoScripts', {
		treeDataProvider: new ScriptsProvider()
	});

	// register symbol provider
	registerDocumentSymbolProvider(context, []);

	// register activation commands
	new RegisterRhinoCommand(context).register();
	new CreateProjectCommand(context).register();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}

function registerDocumentSymbolProvider(context: vscode.ExtensionContext, plugins: any[]) {
	// setup
	let client = new RhinoClient(Utilities.getRhinoEndpoint());
	let options = [ExtensionSettings.providerOptions];

	// fetch
	vscode.window.setStatusBarMessage('$(sync~spin) Loading symbols...');
	client.getPluginsReferences((data: string) => {
		try {
			let plugins = JSON.parse(data);
			let provider = new RhinoDocumentSymbolProvider(plugins);
			context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(options, provider));
			vscode.window.setStatusBarMessage('$(testing-passed-icon) Symbols loaded');
		} catch (error) {
			console.error(error);
			vscode.window.setStatusBarMessage('$(testing-error-icon) Error loading Symbols');
		}
	});
}
