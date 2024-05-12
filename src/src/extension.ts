import * as vscode from 'vscode';
import { RhinoClient } from './clients/rhino-client';
import { ConnectServerCommand } from './commands/connect-server';
import { CreateProjectCommand } from './commands/create-project';
import { AgentLogListener } from './components/agent-log-listener';
import { StaticCodeAnalyzer } from './components/static-code-analyzer';
import { Channels } from './constants/channels';
import { Utilities } from './extensions/utilities';

let diagnosticCollection: vscode.DiagnosticCollection;

export async function activate(context: vscode.ExtensionContext) {
	new CreateProjectCommand(context).register();

	// wait for server
	let baseUrl = Utilities.getRhinoEndpoint();
	const isRhinoProject = baseUrl !== null && baseUrl !== undefined && baseUrl !== '';

	if (isRhinoProject) {
		while (true) {
			// wait for server to be ready
			vscode.window.setStatusBarMessage('$(sync~spin) Waiting for Connection...');

			const client = new RhinoClient(baseUrl);
			const response = await client.status.ping();

			if (response === 'pong') {
				break;
			}

			baseUrl = Utilities.getRhinoEndpoint();
			await Utilities.waitAsync(5000);
		}

		// setup
		const createModel = await Utilities.getTmCreateObject();
		const connectCommand = new ConnectServerCommand(context, createModel).syncData(false);

		// register
		await connectCommand.invokeCommand();
		new StaticCodeAnalyzer(context, createModel).register();
	}
}

export function deactivate() {
	// if (context?.subscriptions) {
	// 	context.subscriptions.splice(0, context.subscriptions.length);
	// }
}

