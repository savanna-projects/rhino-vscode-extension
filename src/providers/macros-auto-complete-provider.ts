/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class MacrosAutoCompleteProvider extends Provider {
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
        var instance = new MacrosAutoCompleteProvider().setManifests(this.manifests);

        // register: assertions
        var macros = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getMacrosCompletionItems(document, position);
            }
        }, '$');

        // register: methods
        var parameters = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getMacrosParameters(document, position);
            }
        }, '-');

        // register
        var items = [macros, parameters];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any) {
        // setup
        this.manifests = manifests;

        // get
        return this;
    }

    /*┌─[ AUTO-COMPLETE ITEMS BEHAVIOR ]───────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ behavior for macros.
      └────────────────────────────────────────────────────────*/
    private getMacrosCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var matches = document.lineAt(position).text.match('(?<=.*){{\\$');

        // not found
        if (matches === null) {
            return [];
        }

        // build
        var items: vscode.CompletionItem[] = [];
        for (let i = 0; i < this.manifests.length; i++) {
            var item = new vscode.CompletionItem(this.manifests[i].key, vscode.CompletionItemKind.Method);
            item.detail = 'code',
                item.documentation = this.manifests[i].entity.description;

            items.push(item);
        }

        // get
        return items.sort();
    }

    private getMacrosParameters(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var line = document.lineAt(position.line).text;
        var end = position.character;
        var start = this.getMacroPosition(line, position.character);

        // setup conditions
        var isLength = line.length > 4;
        var isParameter = isLength && line[position.character - 1] === '-' && line[position.character - 2] === '-';

        // not valid
        if (!isParameter || start === -1) {
            return [];
        }

        // build
        var macro = line.substring(start, end);
        var matches = macro.match('(?<={{\\$)[^\\s]*');

        // not found
        if (matches === null) {
            return [];
        }

        // build
        var key = matches[0].toLowerCase();
        var manifest = this.manifests.find(i => i.key === key);

        // not found
        if (manifest === undefined) {
            return [];
        }

        // get
        return this.getParametersBehaviors(manifest);
    }

    private getParametersBehaviors(manifest: any): vscode.CompletionItem[] {
        // setup
        var items: vscode.CompletionItem[] = [];
        var keys = Object.keys(manifest.entity.cliArguments);

        // build: list
        for (var i = 0; i < keys.length; i++) {
            var item = this.getParametersBehavior(manifest, keys[i]);

            if (item.label !== '-1') {
                items.push(item);
            }
        }

        // get
        return items;
    }

    private getParametersBehavior(manifest: any, key: string): vscode.CompletionItem {
        // build
        var item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);
        item.documentation = manifest.entity.cliArguments[key];

        // get
        return item;
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility and supprort functions.
      └────────────────────────────────────────────────────────*/
    private getMacroPosition(line: string, index: number): number {
        // setup
        index = index < 0 ? 0 : index;

        // build
        while (index > 0) {
            if (index - 1 < 0) {
                return -1;
            }

            var _isCli = line.substr(index - 1, 3) === '{{$';
            if (_isCli) {
                return index === 0 ? 0 : index - 1;
            }
            index = index - 1;
        }

        // get
        return -1;
    }
}