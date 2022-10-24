import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';

export function activate(context: vscode.ExtensionContext) {
	// setup
	let registerCommand = new RegisterRhinoCommand(context);

	// register
	new CreateProjectCommand(context).register();
	registerCommand.register();
	registerCommand.invokeCommand();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
