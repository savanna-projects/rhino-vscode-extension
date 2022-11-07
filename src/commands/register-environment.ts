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
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
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
        let client = this.getRhinoClient();
        let options = {
            placeHolder: 'Environment file name w/o extension (e.g., Production)'
        };

        vscode.window.showInputBox(options).then((value) => {

            // setup
            let requests = RegisterEnvironmentCommand.getEnvironments(value);
            let mergedJson:JSON = requests[0];
            
            for (let request of requests) {
                mergedJson = {...mergedJson, ...request};
            }
            
            // bad request
            if (Utilities.isNullOrUndefined(mergedJson)) {
                vscode.window.setStatusBarMessage('$(testing-error-icon) Environment file not found or not valid.');
                return;
            }

            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Registering environment...');

            // get
            client.addEnvironment(mergedJson, () => {
                client.syncEnvironment((response: any) => {
                    vscode.window.setStatusBarMessage('$(testing-passed-icon) Environment registered');
                    callback(response);
                });
            }); 
        }
    );
}

    private static getEnvironments(environment: string | undefined): any {
        // setup
        let listOfEnviorments = environment?.split(/\s*,\s*/);
        
        // check if undefined 
        if(!listOfEnviorments) {
            vscode.window.setStatusBarMessage('$(testing-error-icon) Environment file not found or not valid.');
            return;
        }

        let requests:JSON[] = [];

        for (let curEnvironment of listOfEnviorments) {

            console.log(curEnvironment);

            let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
            workspace = workspace === undefined ? '' : workspace;

            let environmentFile = path.join(workspace, "Environments", curEnvironment + '.json');
            environmentFile = environmentFile.startsWith('\\')
                ? environmentFile.substring(1, environmentFile.length)
                : environmentFile;
    
            // build
            let data = "{}";
            const fs = require('fs');
            try {
                data = fs.readFileSync(environmentFile, 'utf8');
                requests.push(JSON.parse(data));
            } catch (e: any) {
                console.log('Error:', e.stack);
                return;
            }
        }

        return requests;
    }
}
