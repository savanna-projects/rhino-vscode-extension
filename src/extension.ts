/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 */
import * as vscode from 'vscode';
import { ConnectRhinoServer } from './commands/connect-rhino-server';
import { InvokeRhinoTestCases } from './commands/invoke-rhino-test-cases';
import { Utilities } from './extensions/utilities';

/**
 * Summary. This function will be called upon activating the extension.
 * 
 * @param context The context of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
	// register commands
	new ConnectRhinoServer(context).register();
	new InvokeRhinoTestCases(context).setCommandName('Invoke-RhinoTestCase').register();

	/**
	 * Summary. Register 'Create-RhinoProject' command.
	 */
	let createRhinoProject = vscode.commands.registerCommand('Create-RhinoProject', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false
		})
		.then(folderUri => {
			// folder
			Utilities.createProjectFolder(folderUri);
			Utilities.createProjectManifest(folderUri);

			// notification
			vscode.window.showInformationMessage('Create-RhinoProject -Path ' + folderUri + ' -> Created');
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }