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
import { stringify } from 'querystring';
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";
import { RegisterRhinoCommand } from './register-rhino';

export class RegisterPluginsCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Register-Plugins');
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
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Registering plugin(s)...');
        
        // setup
        var workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        var pluginsFolder = path.join(workspace, 'Plugins');
        pluginsFolder = pluginsFolder.startsWith('\\')
            ? pluginsFolder.substring(1, pluginsFolder.length)
            : pluginsFolder;

        Utilities.getFiles(pluginsFolder, (files: string[]) => {
            var plugins: string[] = [];

            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                var plugin = this.getPluginsFromFile(file);
                plugins.push(plugin);
            }

            var createModel = plugins
                .join("\n>>>\n")
                .split('\n')
                .map(i => i.replace(/^\d+\.\s+/, ''))
                .join('\n');

            this.registerPlugins(createModel, callback);
        });
    }

    private getPluginsFromFile(file: string): string {
        // setup
        const fs = require('fs');

        // get
        try {
            return fs.readFileSync(file, 'utf8');
        } catch (e) {
            console.log(e);
        }

        // default
        return '';
    }

    private registerPlugins(createModel: string, callback: any) {
        this.getRhinoClient().createPlugins(createModel, (response: any) => {
            // setup
            var total = response.toString().split('>>>').length;

            // notification
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Total of ' + total + ' plugin(s) registered');

            // register
            new RegisterRhinoCommand(this.getContext()).invokeCommand();

            // callback
            if (callback !== undefined) {
                callback();
            }
        });
    }
}