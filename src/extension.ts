/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/vscode-api#window.showInputBox
 */
import * as vscode from 'vscode';
import { ConnectRhinoServer } from './commands/connect-rhino-server';
import { CreateIntegratedTestCase } from './commands/create-integrated-test-case';
import { CreateRhinoProject } from './commands/create-rhino-project';
import { InvokeRhinoTestCases } from './commands/invoke-rhino-test-cases';

/**
 * Summary. This function will be called upon activating the extension.
 * 
 * @param context The context of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
	// register commands
	new ConnectRhinoServer(context).register();
	new InvokeRhinoTestCases(context).setCommandName('Invoke-RhinoTestCase').register();
	new CreateRhinoProject(context).register();
	new CreateIntegratedTestCase(context).register();
}

// this method is called when your extension is deactivated
export function deactivate() { }