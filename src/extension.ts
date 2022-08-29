import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';

export function activate(context: vscode.ExtensionContext) {
	new RegisterRhinoCommand(context).register();
	new CreateProjectCommand(context).register();
}

export function deactivate(context: vscode.ExtensionContext) {
	context.subscriptions.splice(0, context.subscriptions.length);
}
