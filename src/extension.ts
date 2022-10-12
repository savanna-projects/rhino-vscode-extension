import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
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
	new RhinoDocumentSymbolProvider().register(context);

	// register activation commands
	new RegisterRhinoCommand(context).register();
	new CreateProjectCommand(context).register();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
