import * as vscode from 'vscode';
import { CreateProjectCommand } from './commands/create-project';
import { RegisterRhinoCommand } from './commands/register-rhino';
import { Utilities } from './extensions/utilities';

export function activate(context: vscode.ExtensionContext) {
	// setup
	let registerCommand = new RegisterRhinoCommand(context);

	// register
	new CreateProjectCommand(context).register();
	registerCommand.register();
	registerCommand.invokeCommand();
	let logger = registerCommand.getRhinoLogger();
	logger.show();
	logger.appendLine(`${Utilities.getTimestamp()} - Rhino Support Extension started.`);
}

export function deactivate(context: vscode.ExtensionContext) {
	if (context?.subscriptions) {
		context.subscriptions.splice(0, context.subscriptions.length);
	}
}
