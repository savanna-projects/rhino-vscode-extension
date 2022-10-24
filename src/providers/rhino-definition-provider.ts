/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import path = require('path');
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Utilities } from '../extensions/utilities';
import { Provider } from './provider';

export class RhinoDefinitionProvider extends Provider {
    // members
    private context: vscode.ExtensionContext;

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
    }

    /*┌─[ ABSTRACT IMPLEMENTATION ]────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register all providers into the given context. 
     */
    public register(): any {
        // setup
        let plugins = this.getPlugins();

        // register: actions
        let definitions = vscode.languages.registerDefinitionProvider(ExtensionSettings.providerOptions, {
            provideDefinition(_textDocument, position) {
                const editor = vscode.window.activeTextEditor;
                const selection = editor?.selection;
                const text = editor?.document.lineAt(parseInt(`${selection?.active.line}`)).text;
                const line = plugins.find(i => text?.match(i.id));

                // TODO: add notification to user
                if (line === undefined || line === null) {
                    return;
                }

                let file = line.file.replaceAll('\\', '/');
                file = file.match(/^[a-z,A-Z]:/) ? `/${file}` : file;
                return new vscode.Location(vscode.Uri.parse(file), position);
            }
        });

        // register
        let items = [definitions];
        this.context.subscriptions.push(...items);
    }

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any): any {
        console.log(manifests);
        return [];
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private getPlugins() {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        let pluginsFolder = path.join(workspace, 'Plugins');
        pluginsFolder = pluginsFolder.startsWith('\\')
            ? pluginsFolder.substring(1, pluginsFolder.length)
            : pluginsFolder;
        let plugins: any[] = [];

        // build
        Utilities.getFiles(pluginsFolder, (files: string[]) => {
            for (const file of files) {
                let plugin = this.getPlugin(file);
                let pluginContent = plugin.split(/\r?\n|\n\r?/);
                let pluginData = {
                    id: this.getPluginId(pluginContent),
                    file: file
                };
                plugins.push(pluginData);
            }
        });

        // get
        return [...new Map(plugins.map(item => [item['id'], item])).values()];
    }

    private getPlugin(file: string): string {
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

    private getPluginId(document: string[]): string {
        // not found
        if (document === undefined || document === null) {
            return '';
        }

        try {
            // setup
            let pattern = '^\\[test-id]';

            // get line number
            let onLine = 0;
            for (onLine; onLine < document.length; onLine++) {
                if (document[onLine].match(pattern) !== null) {
                    break;
                }
            }

            // not found
            if (document === undefined || document === null) {
                return '';
            }

            // get
            return document[onLine]
                .replaceAll('[test-id]', '')
                .trim()
                .replace(/([a-z])([A-Z])/g, `$1 $2`)
                .toLowerCase();
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}
