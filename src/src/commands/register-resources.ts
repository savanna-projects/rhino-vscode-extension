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
import { RhinoClient } from '../clients/rhino-client';
import { StringUtilities } from '../extensions/stringUtilities';

export class RegisterResourcesCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context, createModel);

        // build
        this.command = 'Register-Resources';

        // create data
        this._logger = this.logger?.newLogger('RegisterResourcesCommand');
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
            let base64Content = StringUtilities.encodeBase64(resourceContent);
            resourcesMap.set(resourceFile, base64Content);
        }

        const resources: ResourceModel[] = [];

        for (const [key, value] of resourcesMap) {
            resources.push({
                fileName: path.basename(key),
                path: key,
                content: value
            });
        }

        await RegisterResourcesCommand.registerResources(this, this.client, resources);
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
        command: CommandBase,
        client: RhinoClient,
        requestBody: ResourceModel[]): Promise<void> {

        await command.saveAllDocuments();

        // invoke
        await client.resources.newResources(requestBody);

        // setup
        let total = requestBody.length;

        // user interface
        vscode.window.setStatusBarMessage(`$(testing-passed-icon) Total of ${total} Resource(s) Registered`);
    }
}
