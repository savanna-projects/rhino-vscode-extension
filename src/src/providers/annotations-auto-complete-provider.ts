/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import * as vscode from 'vscode';
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class AnnotationsAutoCompleteProvider extends ProviderBase {
    // properties
    public manifests: any[] = [];
    public references: number[] = [];

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

        // register: actions
        let annotations = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAnnotationsCompletionItems(document, position);
            }
        }, '[');

        // register
        let items = [annotations];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    /*┌─[ AUTO-COMPLETE ITEMS - ANNOTATIONS ]──────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getAnnotationsCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // setup conditions
        let isProperty = position.character === 1 && document.lineAt(position.line).text[position.character - 1] === '[';

        // not found
        if (!isProperty) {
            return [];
        }

        // build
        let annotations: vscode.CompletionItem[] = [];
        for (const manifest of this.manifests) {
            let property = new vscode.CompletionItem(manifest.key, vscode.CompletionItemKind.Property);
            property.documentation = manifest.entity.description;
            annotations.push(property);
        }

        // get
        return [...new Map(annotations.map(item => [item.label, item])).values()];
    }
}
