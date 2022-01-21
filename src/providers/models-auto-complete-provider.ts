/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 * https://github.com/microsoft/vscode-extension-samples/blob/main/document-editing-sample/src/extension.ts
 * https://www.gitmemory.com/issue/microsoft/vscode/75237/501481326
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class ModelsAutoCompleteProvider extends Provider {
    // members
    private manifests: any[];
    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        super();
        this.manifests = [];
    }

    /*┌─[ ABSTRACT IMPLEMENTATION ]────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register all providers into the given context. 
     */
    public register(context: vscode.ExtensionContext): any {
        // setup
        var instance = new ModelsAutoCompleteProvider().setManifests(this.manifests);

        // register: models
        var models = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getModelsCompletionItems(document, position);
            }
        }, ':');

        // register
        var items = [models];
        context.subscriptions.push(...items);
    }

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any): ModelsAutoCompleteProvider {
        // setup
        this.manifests = manifests;

        // get
        return this;
    }

    /*┌─[ AUTO-COMPLETE ITEMS - PARAMETERS ]───────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getModelsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var text = document.lineAt(position).text.substr(0, position.character);
        var isModelToke = text.substr(position.character - 2, text.length) === 'm:';

        // not found
        if (!isModelToke) {
            return [];
        }

        // setup
        var startPosition = new vscode.Position(position.line, position.character - 2);
        var range = new vscode.Range(startPosition, position);
        var items: vscode.CompletionItem[] = [];

        // delete before sending auto-complete
        for (let i = 0; i < this.manifests.length; i++) {
            items.push(...this.getModelsCompletionItem(this.manifests[i], range));
        }

        // get
        return items;
    }

    private getModelsCompletionItem(manifest: any, range: vscode.Range): vscode.CompletionItem[] {
        // setup
        var items: vscode.CompletionItem[] = [];
        var models: [any] = manifest.models;

        // build
        models.forEach(m => {
            for (let i = 0; i < m.entries.length; i++) {
                var entry = m.entries[i];
                var displayName = m.name + ': ' + entry.name;

                var item = new vscode.CompletionItem(displayName, vscode.CompletionItemKind.Reference);
                item.documentation = entry.comment === undefined || entry.comment === null ? 'Coming soon' : entry.comment;
                item.detail = entry.type + ': ' + entry.value;
                item.insertText = entry.name;
                item.additionalTextEdits = [vscode.TextEdit.delete(range)];
                items.push(item);
            }
        });

        // get
        return items.sort((a, b) => (a.label < b.label ? -1 : 1));
    }
}