/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: add auto-complete for register-parameter action (will invoke the in-test case parameters)
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class ParametersAutoCompleteProvider extends Provider {
    // members:
    private manifests: any;

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
        var instance = new ParametersAutoCompleteProvider().setManifests(this.manifests);

        // register: models
        var parameters = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument) {
                var fromData = instance.getDataParametersCompletionItems(document);
                var fromPlugin = instance.getPluginParametersCompletionItems(document);
                var items = [];
                items.push(...fromData);
                items.push(...fromPlugin);
                return items;
            }
        }, '@');

        // register
        var items = [parameters];
        context.subscriptions.push(...items);
    }

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param _manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any): ParametersAutoCompleteProvider {
        // setup
        this.manifests = manifests;

        // get
        return this;
    }

    // TODO: improve with some code reuse and code clean.
    /*┌─[ AUTO-COMPLETE ITEMS - PARAMETERS ]───────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getDataParametersCompletionItems(document: vscode.TextDocument)
        : vscode.CompletionItem[] {
        // build
        var section = this
            .getSection(document, 'test-data-provider', this.manifests)
            .map(i => i.trim())
            .filter(i => i !== '');

        // build
        var seperator = section.findIndex(i => i.match('(\\|-+\\|?)+\\|') !== null);
        var index = seperator - 1;
        if (seperator < 0) {
            return [];
        }

        // parse
        var parameters = section[index].split('|').map(i => i.trim()).filter(i => i !== '');
        if (parameters.length === 0) {
            return [];
        }

        // build
        var items: vscode.CompletionItem[] = [];
        for (let i = 0; i < parameters.length; i++) {
            var item = new vscode.CompletionItem(parameters[i], vscode.CompletionItemKind.Property);
            item.detail = 'dynamic parameter';
            item.insertText = parameters[i];
            items.push(item);
        }

        // get
        return items;
    }

    private getPluginParametersCompletionItems(document: vscode.TextDocument)
        : vscode.CompletionItem[] {
        // build
        var section = this
            .getSection(document, 'test-parameters', this.manifests)
            .map(i => i.trim())
            .filter(i => i !== '');

        // build
        var seperator = section.findIndex(i => i.match('(\\|-+\\|?)+\\|') !== null);
        var index = seperator + 1;
        if (index > section.length - 1) {
            return [];
        }

        // parse
        var items: vscode.CompletionItem[] = [];
        for (let i = index; i < section.length; i++) {
            var parameter = section[i].split('|').map(i => i.trim()).filter(i => i !== '');
            if (parameter.length !== 2) {
                continue;
            }
            var item = new vscode.CompletionItem(parameter[0], vscode.CompletionItemKind.Property);
            item.detail = 'plugin parameter';
            item.documentation = parameter[1];
            item.insertText = parameter[0];
            items.push(item);
        }

        // get
        return items;
    }
}