/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class AnnotationsAutoCompleteProvider extends Provider {
    // members
    private manifests: any[];
    private references: number[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        super();
        this.manifests = [];
        this.references = [];
    }

    /*┌─[ ABSTRACT IMPLEMENTATION ]────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register all providers into the given context. 
     */
    public register(context: vscode.ExtensionContext) {
        // setup
        var instance = new AnnotationsAutoCompleteProvider().setManifests(this.manifests);

        // register: actions
        var annotations = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAnnotationsCompletionItems(document, position);
            }
        }, '[');

        // register
        var items = [annotations];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    public setManifests(manifests: any) {
        // setup
        this.manifests = manifests;

        // get
        return this;
    }

    /*┌─[ AUTO-COMPLETE ITEMS - ANNOTATIONS ]──────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    public getAnnotationsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup conditions
        var isProperty = position.character === 1 && document.lineAt(position.line).text[position.character - 1] === '[';

        // not found
        if (!isProperty) {
            return [];
        }

        // build
        var annotations: vscode.CompletionItem[] = [];
        for (let i = 0; i < this.manifests.length; i++) {
            var property = new vscode.CompletionItem(this.manifests[i].key, vscode.CompletionItemKind.Property);
            property.documentation = this.manifests[i].entity.description;
            annotations.push(property);
        }

        // get
        return annotations;
    }
}