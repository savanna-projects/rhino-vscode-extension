/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as fs from 'fs';
import * as vscode from 'vscode';
import path = require('path');
import { Utilities } from '../extensions/utilities';
import { CommandBase } from "./command-base";
import { Logger } from '../logging/logger';
import { RhinoClient } from '../clients/rhino-client';


export class RegisterEnvironmentCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this._logger = this.logger?.newLogger('InvokeTestCaseCommand');
        this.command = 'Register-Environment';
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    protected async onRegister(): Promise<any> {
        // build
        let command = vscode.commands.registerCommand(this.command, async () => {
            await this.invokeCommand();
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const client = this.client;
        const options = {
            placeHolder: 'Environment file name w/o extension (e.g., Production)'
        };

        vscode.window.showInputBox(options).then(async (value) => {
            if (value === undefined || value === null || value === '') {
                return;
            }
            const requests = this.getEnvironments(value);

            // setup
            let mergedJson: JSON = requests[0];

            // merge requests
            for (let request of requests) {
                mergedJson = { ...mergedJson, ...request };
            }

            // bad request
            if (Utilities.assertNullOrUndefined(mergedJson)) {
                vscode.window.setStatusBarMessage('$(testing-error-icon) Environment File Not Found or Not Valid.');
                return;
            }

            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Registering Environment(s)...');

            // register
            await RegisterEnvironmentCommand.add(mergedJson, client);

            // user interface
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Environment Registered');
        });
    }

    private getEnvironments(environment: string): JSON[] {
        // setup
        const listOfEnvironments = environment?.split(/\s*,\s*/);

        // check if undefined 
        if (!listOfEnvironments) {
            vscode.window.setStatusBarMessage('$(testing-error-icon) Environment File was Not Found or Not Valid');
            return [];
        }

        // setup
        const environmentsFolder = Utilities.getSystemFolderPath('Environments');

        // build
        const listOfPaths = Utilities.getFilesByFileNames(environmentsFolder, listOfEnvironments);
        const requests: JSON[] = [];

        for (const path of listOfPaths) {
            try {
                const data = fs.readFileSync(path, 'utf8');
                requests.push(JSON.parse(data));
            } catch (error: any) {
                this._logger?.error(error.message, error);
                continue;
            }
        }

        // get
        return requests;
    }

    private static async add(requestBody: any, client: RhinoClient) {
        try{
            const manifest = Utilities.getManifest();
            const encoded = manifest?.engineConfiguration?.encodeEnvironment;
            const isEncoded = encoded !== null && encoded !== undefined && encoded === true;

            if(isEncoded){
                await client.environments.addEnvironmentEncoded(requestBody);
                await client.environments.syncEnvironmentEncoded();
                return;
            }

            await client.environments.addEnvironment(requestBody);
            await client.environments.syncEnvironment();
        }
        catch{
            return;
        }
    }
}
