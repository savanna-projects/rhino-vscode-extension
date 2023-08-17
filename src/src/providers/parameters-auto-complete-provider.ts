/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: add auto-complete for register-parameter action (will invoke the in-test case parameters)
 */
import * as vscode from 'vscode';
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class ParametersAutoCompleteProvider extends ProviderBase {
    // properties
    public manifests: any = [];

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
        let parameters = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument) {
                let fromData = instance.getDataParametersCompletionItems(document);
                let fromPlugin = instance.getPluginParametersCompletionItems(document);
                let items = [];
                items.push(...fromData);
                items.push(...fromPlugin);
                return items;
            }
        }, '@');

        // register
        let items = [parameters];
        context.subscriptions.push(...items);
    }

    /*┌─[ AUTO-COMPLETE ITEMS - PARAMETERS ]───────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getDataParametersCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] {
        // build
        let section = this
            .getSection(document, 'test-data-provider', this.manifests)
            .map(i => i.trim())
            .filter(i => i !== '');

        // build
        let separator = section.findIndex(i => i.match('(\\|-+\\|?)+\\|') !== null);
        let index = separator - 1;
        if (separator < 0) {
            return [];
        }

        // parse
        let parameters = section[index].split('|').map(i => i.trim()).filter(i => i !== '');
        if (parameters.length === 0) {
            return [];
        }

        // build
        let items: vscode.CompletionItem[] = [];
        for (const parameter of parameters) {
            let item = new vscode.CompletionItem(parameter, vscode.CompletionItemKind.Property);
            item.detail = 'dynamic parameter';
            item.insertText = parameter;
            items.push(item);
        }

        // get
        return [...new Map(items.map(item => [item.label, item])).values()];
    }

    private getPluginParametersCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] {
        // build
        let section = this
            .getSection(document, 'test-parameters', this.manifests)
            .map(i => i.trim())
            .filter(i => i !== '');

        // build
        let separator = section.findIndex(i => i.match('(\\|-+\\|?)+\\|') !== null);
        let index = separator + 1;
        if (index > section.length - 1) {
            return [];
        }

        // parse
        let items: vscode.CompletionItem[] = [];
        for (let i = index; i < section.length; i++) {
            let parameter = section[i].split('|').map(i => i.trim()).filter(i => i !== '');
            if (parameter.length < 2) {
                continue;
            }
            let item = new vscode.CompletionItem(parameter[0], vscode.CompletionItemKind.Property);
            item.detail = 'plugin parameter';
            item.documentation = parameter.length > 2
                ? new vscode.MarkdownString(parameter[1] + "  \n\n" + "**Default Value:** `" + parameter[2] + "`")
                : parameter[1];
            item.insertText = parameter[0];
            items.push(item);
        }

        // get
        return [...new Map(items.map(item => [item.label, item])).values()];
    }
}
