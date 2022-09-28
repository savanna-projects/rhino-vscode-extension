import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
import { ExtensionSettings } from './extension-settings';
import { DocumentsProvider } from './providers/documents-provider';
import { RhinoDocumentSymbolProvider } from './providers/rhino-symbol-provider';

export function activate(context: vscode.ExtensionContext) {
	// create documents tree
	vscode.window.createTreeView('rhinoDocumentation', {
		treeDataProvider: new DocumentsProvider()
	});

	// register activation commands
	new RegisterRhinoCommand(context).register();
	new CreateProjectCommand(context).register();

	// register symbol provider
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [ExtensionSettings.providerOptions], 
            new RhinoDocumentSymbolProvider()
        )
    );
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
