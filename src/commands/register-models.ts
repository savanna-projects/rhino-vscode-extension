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
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";
import { RegisterRhinoCommand } from './register-rhino';

export class RegisterModelsCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Register-Models');
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
    public register(): any {
        // setup
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
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Registering model(s)...');

        // build
        this.getModelsFromFiles((createModel: any) => {
            this.registerModels(createModel, callback);
        });
    }

    private getModelsFromFiles(callback: any) {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;

        let modelsFolder = path.join(workspace, 'Models');
        modelsFolder = modelsFolder.startsWith('\\')
            ? modelsFolder.substring(1, modelsFolder.length)
            : modelsFolder;

        // build
        const fs = require('fs');

        // iterate
        Utilities.getFiles(modelsFolder, (files: string[]) => {
            let modelsData = [];
            for (const modelFile of files) {
                try {
                    let modelStr = fs.readFileSync(modelFile, 'utf8');
                    let isJson = this.isJson(modelStr);
                    let modelData = isJson ? JSON.parse(modelStr) : modelStr;
                    modelsData.push({
                        type: isJson ? 'json' : 'md',
                        data: modelData
                    });
                } catch (e) {
                    console.log('Error:', e);
                }
            }

            callback(modelsData);
        });
    }

    private registerModels(createModel: any[], callback: any) {
        // setup
        let client = this.getRhinoClient();

        // clean and register
        client.deleteModels(() => {
            this.createModels(createModel, callback);
        });
    }

    private createModels(createModel: any[], callback: any) {
        // setup
        let client = this.getRhinoClient();
        let markdownModels = createModel.filter(i => i.type === 'md');
        let mdModels = markdownModels.map(i => i.data).join('\n>>>\n');
        let jsModels = createModel.filter(i => i.type === 'json').map(i => i.data);
        let isJson = jsModels.length > 0;
        let isMarkdown = markdownModels.length > 0;

        // local functions
        function _callback(context: vscode.ExtensionContext, callback: any) {
            // notification
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Models registered');

            // register
            new RegisterRhinoCommand(context).invokeCommand();

            // callback
            if (callback !== undefined) {
                callback();
            }
        }

        // factory
        if (isJson && !isMarkdown) {
            client.createModels(jsModels, () => {
                _callback(this.getContext(), callback);
            });
        }
        if (isMarkdown && !isJson) {
            client.createModelsMd(mdModels, () => {
                _callback(this.getContext(), callback);
            });
        }
        if (isMarkdown && isJson) {
            client.createModels(jsModels, () => {
                client.createModelsMd(mdModels, () => {
                    _callback(this.getContext(), callback);
                });
            });
        }
    }

    private isJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
}
