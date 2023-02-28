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
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { CommandBase } from "./command-base";
import { RegisterRhinoCommand } from './register-rhino';
import { RhinoClient } from '../clients/rhino-client';

export class RegisterModelsCommand extends CommandBase {
    // members: state
    private readonly _logger: Logger;
    private _createModel: TmLanguageCreateModel;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context);

        // build
        this.command = 'Register-Models';

        // create data
        this._logger = super.logger?.newLogger('RegisterModelsCommand');
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
        let command = vscode.commands.registerCommand(this.command, () => {
            this.invokeCommand();
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const context = this.context;

        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Registering Model(s)...');

        // setup
        const requestBody = this.getModelsFromFiles();

        // invoke
        await this.registerModels(this.client, requestBody);


        // register
        new RegisterRhinoCommand(context, Promise.resolve(this._createModel)).invokeCommand();
        
        // user interface
        vscode.window.setStatusBarMessage('$(testing-passed-icon) Models Registered');
    }

    private getModelsFromFiles(): any[] {
        // setup
        const modelsFolder = Utilities.getSystemFolderPath('Models');

        // iterate
        const files = Utilities.getFiles(modelsFolder);
        const modelsData = [];
        for (const modelFile of files) {
            try {
                const modelStr = fs.readFileSync(modelFile, 'utf8');
                const isJson = Utilities.assertJson(modelStr);
                const modelData = isJson ? JSON.parse(modelStr) : modelStr;
                modelsData.push({
                    type: isJson ? 'json' : 'md',
                    data: modelData
                });
            } catch (error: any) {
                this._logger?.error(error.message, error);
            }
        }

        // get
        return modelsData;
    }

    private async registerModels(client: RhinoClient, requestBody: any[]): Promise<void> {
        try {
            // setup
            const markdownModels = requestBody.filter(i => i.type === 'md');
            const mdModels = markdownModels.map(i => i.data).join('\n>>>\n');
            const jsModels = requestBody.filter(i => i.type === 'json').map(i => i.data);
            const isJson = jsModels.length > 0;
            const isMarkdown = markdownModels.length > 0;

            // clean
            await client.models.deleteModels();

            // register
            if (isJson && !isMarkdown) {
                await client.models.newModels(jsModels);
            }
            if (isMarkdown && !isJson) {
                await client.models.newModels(mdModels);
            }
            if (isMarkdown && isJson) {
                await client.models.newModels(jsModels);
                await client.models.newModels(mdModels);
            }
        }
        catch (error: any) {
            this._logger?.error(error.message, error);
        }
    }
}
