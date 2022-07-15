/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import path = require('path');
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";


export class RegisterEnvironmentCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Register-Environment');
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    public register(): any {
        // build
        var command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke(undefined);
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand(callback: any) {
        this.invoke(callback);
    }

    private invoke(callback: any) {
        // setup
        var client = this.getRhinoClient();
        var options = {
            placeHolder: 'Test ID to get (e.g., RP-1234)'
        };
        
        vscode.window.showInputBox(options).then((value) => {
            // setup
            var request = RegisterEnvironmentCommand.GetEnvironment(value)

            // bad request
            if (Utilities.isNullOrUndefined(request)) {
                vscode.window.setStatusBarMessage('$(testing-error-icon) Environment file not found or not valid.');
                return;
            }

            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Registering environment...');

            // get
            client.addEnvironment(request, (response: any) => {
                vscode.window.setStatusBarMessage('$(testing-passed-icon) Environment registered')
            });
        });
    }

    private static GetEnvironment(environment: string | undefined): any {
        // setup
        var workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        var environmentFile = path.join(workspace, "Environments", environment + '.json');
        environmentFile = environmentFile.startsWith('\\')
            ? environmentFile.substring(1, environmentFile.length)
            : environmentFile;

        // build
        var data = "{}";
        const fs = require('fs');
        try {
            data = fs.readFileSync(environmentFile, 'utf8');
            return JSON.parse(data);
        } catch (e: any) {
            console.log('Error:', e.stack);
        }

        // default
        return JSON.parse(data);
    }
}
