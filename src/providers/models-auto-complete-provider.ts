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
        let instance = new ModelsAutoCompleteProvider().setManifests(this.manifests);

        // register: models
        let models = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getModelsCompletionItems(document, position);
            }
        }, ':');

        // register
        let items = [models];
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
        let text = document.lineAt(position).text.substring(0, position.character);
        let isModelToke = text.substring(position.character - 2, text.length) === 'm:';

        // not found
        if (!isModelToke) {
            return [];
        }

        // setup
        let startPosition = new vscode.Position(position.line, position.character - 2);
        let range = new vscode.Range(startPosition, position);
        let items: vscode.CompletionItem[] = [];

        // delete before sending auto-complete
        for (const manifest of this.manifests) {
            items.push(...this.getModelsCompletionItem(manifest, range));
        }

        // get
        return items;
    }

    private getModelsCompletionItem(manifest: any, range: vscode.Range): vscode.CompletionItem[] {
        // setup
        let items: vscode.CompletionItem[] = [];
        let models: [any] = manifest.models;

        // build
        models.forEach(m => {
            for (const manifest of m.entries) {
                let entry = manifest;
                let displayName = m.name + ': ' + entry.name;

                let item = new vscode.CompletionItem(displayName, vscode.CompletionItemKind.Reference);
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