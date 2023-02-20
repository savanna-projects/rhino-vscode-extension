/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://stackoverflow.com/questions/45203543/vs-code-extension-api-to-get-the-range-of-the-whole-text-of-a-document
 * https://code.visualstudio.com/api/references/icons-in-labels
 * https://stackoverflow.com/questions/55633453/rotating-octicon-in-statusbar-of-vs-code
 * https://code.visualstudio.com/api/extension-guides/webview
 */
import * as fs from 'fs';
import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { CommandBase } from "./command-base";
import { ConnectServerCommand } from './connect-server';

export class RegisterPluginsCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    // members
    private _createModel: TmLanguageCreateModel;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context);

        // build
        this.command = 'Register-Plugins';

        // create data
        this._logger = super.logger?.newLogger('RegisterPluginsCommand');
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
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Registering Plugin(s)...');

        // setup
        const pluginsFolder = Utilities.getSystemFolderPath('Plugins');
        const files = Utilities.getFiles(pluginsFolder);
        const plugins: string[] = [];

        // build
        for (const file of files) {
            const plugin = this.getPluginsFromFile(file);
            plugins.push(Utilities.formatRhinoSpec(plugin));
        }

        const distinctPlugins = [...new Set(plugins)];
        const requestBody = distinctPlugins
            .join("\n>>>\n")
            .split('\n')
            .map(i => i.replace(/^\d+\.\s+/, ''))
            .join('\n');

        // invoke
        await RegisterPluginsCommand.registerPlugins(
            this.context,
            this._createModel,
            this.client,
            requestBody);
    }

    private getPluginsFromFile(file: string): string {
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

    private static async registerPlugins(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel,
        client: RhinoClient,
        requestBody: string) {

        // setup
        const response = await client.plugins.addPlugins(requestBody);
        const total = response?.toString().split('>>>').length;

        // register
        await new ConnectServerCommand(context, createModel)
            .syncData(true)
            .invokeCommand();
            
        // user interface
        vscode.window.setStatusBarMessage(`$(testing-passed-icon) Total of ${total} Plugin(s) Registered`);
    }
}
