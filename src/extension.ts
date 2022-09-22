import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
import { DocumentsProvider } from './providers/documents-provider';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.createTreeView('rhinoDocumentation', {
		treeDataProvider: new DocumentsProvider()
	});
	new RegisterRhinoCommand(context).register();
	new CreateProjectCommand(context).register();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
