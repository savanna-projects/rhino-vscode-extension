/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://stackoverflow.com/questions/45203543/vs-code-extension-api-to-get-the-range-of-the-whole-text-of-a-document
 * https://code.visualstudio.com/api/references/icons-in-labels
 * https://stackoverflow.com/questions/55633453/rotating-octicon-in-statusbar-of-vs-code
 * https://code.visualstudio.com/api/extension-guides/webview
 */
import path = require('path');
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { ResourceModel } from '../models/register-data-model';
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { CommandBase } from "./command-base";
import { ConnectServerCommand } from './connect-server';
import { RhinoClient } from '../clients/rhino-client';

export class RegisterResourcesCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    // members: static
    private _createModel: TmLanguageCreateModel;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context);

        // build
        this.command = 'Register-Resources';

        // create data
        this._logger = super.logger?.newLogger('RegisterResourcesCommand');
        this._createModel = createModel;
    }

    /*┌─[ REGISTER ]───────────────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for invoking one or more Rhino Test Case
     *          and present the report.
     */
    protected async onRegister(): Promise<any> {
        // setup
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
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Registering Resource(s)...');

        // setup
        const resourcesFolder = Utilities.getSystemFolderPath('Resources');
        const files = Utilities.getFiles(resourcesFolder);
        const resourcesMap = new Map<string, string>();

        // iterate
        for (const resourceFile of files) {
            const resourceContent = this.getResourceFromFile(resourceFile);

            if (!resourceContent) {
                continue;
            }

            resourcesMap.set(resourceFile, resourceContent);
        }

        const resources: ResourceModel[] = [];

        for (const [key, value] of resourcesMap) {
            resources.push({
                fileName: path.basename(key),
                path: key,
                content: value
            });
        }

        await RegisterResourcesCommand.registerResources(
            this.context,
            this.client,
            this._createModel,
            resources);
    }

    private getResourceFromFile(file: string): string {
        // get
        try {
            return fs.readFileSync(file, 'utf8');
        } catch (error: any) {
            console.warn(error);
            this._logger?.warning(error.message, error);
        }

        // default
        return '';
    }

    // TODO: change sync data to true when auto-complete is ready
    private static async registerResources(
        context: vscode.ExtensionContext,
        client: RhinoClient,
        createModel: TmLanguageCreateModel,
        requestBody: ResourceModel[]): Promise<void> {
        // invoke
        await client.resources.newResources(requestBody);

        // setup
        let total = requestBody.length;

        // register
        await new ConnectServerCommand(context, createModel)
            .syncData(false)
            .invokeCommand();
            
        // notification
        vscode.window.setStatusBarMessage(`$(testing-passed-icon) Total of ${total} Resource(s) Registered`);
    }
}
