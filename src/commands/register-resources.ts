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
import { ConnectServerCommand } from './connect-server';
import { ResourceModel } from '../contracts/register-data-model';

export class RegisterResourcesCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Register-Resources');
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
            this.invoke();
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand() {
        this.invoke();
    }

    private invoke() {
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Registering resource(s)...');

        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        let resourcesFolder = path.join(workspace, 'Resources');
        resourcesFolder = resourcesFolder.startsWith('\\')
            ? resourcesFolder.substring(1, resourcesFolder.length)
            : resourcesFolder;

        // iterate
        Utilities.getFiles(resourcesFolder, (resourcesFiles: string[]) => {
            const resourcesMap = new Map<string, string>();
            for (const resourceFile of resourcesFiles) {
                let resourceContent = this.getResourceFromFile(resourceFile);

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

            this.registerResources(resources);
        });
    }

    private getResourceFromFile(file: string): string {
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

    private registerResources(createModel: ResourceModel[]) {
        this.getRhinoClient().createResources(createModel).then(() => {
            // setup
            let total = createModel.length;

            // notification
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Total of ' + total + ' resource(s) registered');

            // register
            new ConnectServerCommand(this.getContext()).invokeCommand();
        });
    }
}
