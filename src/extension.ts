import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
import { DocumentsProvider } from './providers/documents-provider';
import { PipelinesProvider } from './providers/pipelines-provider';
import { RhinoDocumentSymbolProvider } from './providers/rhino-symbol-provider';
import { ScriptsProvider } from './providers/scripts-provider';

export function activate(context: vscode.ExtensionContext) {
	// create explorer views
	new DocumentsProvider(context).register();
	new PipelinesProvider(context).register();
	new ScriptsProvider(context).register();

	// register symbol provider
	new RhinoDocumentSymbolProvider().register(context);

	// register activation commands
	new CreateProjectCommand(context).register();
	new RegisterRhinoCommand(context).register();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
