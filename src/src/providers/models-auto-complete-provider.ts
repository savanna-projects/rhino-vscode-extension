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
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class ModelsAutoCompleteProvider extends ProviderBase {
    // properties
    public manifests: any[] = [];

    /**
     * Creates a new instance of Provider
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);
    }

    /*┌─[ ABSTRACT IMPLEMENTATION ]────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register all providers into the given context. 
     */
    protected async onRegister(context: vscode.ExtensionContext): Promise<void> {
        // setup
        const instance = this;

        // register: models
        let models = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getModelsCompletionItems(document, position);
            }
        }, ':');

        // register
        let items = [models];
        context.subscriptions.push(...items);
    }

    /*┌─[ AUTO-COMPLETE ITEMS - PARAMETERS ]───────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getModelsCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
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
        return [...new Map(items.map(item => [item.label, item])).values()];
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
        return [...new Map(items.map(item => [item.label, item])).values()].sort((a, b) => (a.label < b.label ? -1 : 1));
    }
}
