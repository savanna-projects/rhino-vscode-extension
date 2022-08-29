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
        let instance = new MacrosAutoCompleteProvider().setManifests(this.manifests);

        // register: assertions
        let macros = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getMacrosCompletionItems(document, position);
            }
        }, '$');

        // register: methods
        let parameters = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getMacrosParameters(document, position);
            }
        }, '-');

        // register
        let items = [macros, parameters];
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
        let matches = document.lineAt(position).text.match('(?<=.*){{\\$');

        // not found
        if (matches === null) {
            return [];
        }

        // build
        let items: vscode.CompletionItem[] = [];
        for (const manifest of this.manifests) {
            let item = new vscode.CompletionItem(manifest.key, vscode.CompletionItemKind.Method);
            item.detail = 'code';
            item.documentation = manifest.entity.description;
            items.push(item);
        }

        // get
        return items.sort();
    }

    private getMacrosParameters(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        let line = document.lineAt(position.line).text;
        let end = position.character;
        let start = this.getMacroPosition(line, position.character);

        // setup conditions
        let isLength = line.length > 4;
        let isParameter = isLength && line[position.character - 1] === '-' && line[position.character - 2] === '-';

        // not valid
        if (!isParameter || start === -1) {
            return [];
        }

        // build
        let macro = line.substring(start, end);
        let matches = macro.match('(?<={{\\$)[^\\s]*');

        // not found
        if (matches === null) {
            return [];
        }

        // build
        let key = matches[0].toLowerCase();
        let manifest = this.manifests.find(i => i.key === key);

        // not found
        if (manifest === undefined) {
            return [];
        }

        // get
        return this.getParametersBehaviors(manifest);
    }

    private getParametersBehaviors(manifest: any): vscode.CompletionItem[] {
        // setup
        let items: vscode.CompletionItem[] = [];
        let keys = Object.keys(manifest.entity.cliArguments);

        // build: list
        for (const key of keys) {
            let item = this.getParametersBehavior(manifest, key);

            if (item.label !== '-1') {
                items.push(item);
            }
        }

        // get
        return items;
    }

    private getParametersBehavior(manifest: any, key: string): vscode.CompletionItem {
        // build
        let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);
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

            let _isCli = line.substring(index - 1, 3) === '{{$';
            if (_isCli) {
                return index === 0 ? 0 : index - 1;
            }
            index = index - 1;
        }

        // get
        return -1;
    }
}