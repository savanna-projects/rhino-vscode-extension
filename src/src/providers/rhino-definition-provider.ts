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
import { Settings } from '../constants/settings';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { ProviderBase } from './provider-base';

export class RhinoDefinitionProvider extends ProviderBase {
    // members
    private readonly _logger: Logger;

    /**
     * Creates a new instance of Provider
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // setup
        this._logger = this.logger?.newLogger('RhinoDefinitionProvider');
    }

    /*┌─[ ABSTRACT IMPLEMENTATION ]────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register all providers into the given context. 
     */
    protected async onRegister(): Promise<void> {
        // setup
        const plugins = this.getPlugins();

        // register: actions
        let definitions = vscode.languages.registerDefinitionProvider(Settings.providerOptions, {
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

        const plugins: any[] = [];

        // build
        const files = Utilities.getFiles(pluginsFolder);

        for (const file of files) {
            const plugin = this.getPlugin(file);
            const pluginContent = plugin.split(/\r?\n|\n\r?/);
            const pluginData = {
                id: this.getPluginId(pluginContent),
                file: file
            };
            plugins.push(pluginData);
        }

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
        } catch (error: any) {
            this._logger?.error(error.message, error);
            return '';
        }
    }
}
