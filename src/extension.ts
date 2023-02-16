import * as vscode from 'vscode';
import { RhinoClient } from './clients/rhino-client';
import { ConnectServerCommand } from './commands/connect-server';
import { CreateProjectCommand } from './commands/create-project';
import { Utilities } from './extensions/utilities';

export async function activate(context: vscode.ExtensionContext) {
	new CreateProjectCommand(context).register();

	// wait for server
	const baseUrl = Utilities.getRhinoEndpoint();
	const isRhinoPorject = baseUrl !== null && baseUrl !== undefined && baseUrl !== '';
	
	if (isRhinoPorject) {
		while (true) {
			// wait for server to be ready
			vscode.window.setStatusBarMessage('$(sync~spin) Waiting for Connection...');

			const client = new RhinoClient(baseUrl);
			const response = await client.status.ping();

			if (response === 'pong') {
				break;
			}

			await Utilities.waitAsync(5000);
		}

		// setup
		const createModel = await Utilities.getTmCreateObject();
		const connectCommand = new ConnectServerCommand(context, createModel).syncData(false);

		// register
		await connectCommand.invokeCommand();
	}
}

export function deactivate(context: vscode.ExtensionContext) {
	if (context?.subscriptions) {
		context.subscriptions.splice(0, context.subscriptions.length);
	}
}
