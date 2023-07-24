/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class MacrosAutoCompleteProvider extends ProviderBase {
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

        // register: assertions
        let macros = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getMacrosCompletionItems(document, position);
            }
        }, '$');

        // register: methods
        let parameters = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
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

    /*┌─[ AUTO-COMPLETE ITEMS BEHAVIOR ]───────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ behavior for macros.
      └────────────────────────────────────────────────────────*/
    private getMacrosCompletionItems(document: vscode.TextDocument, position: vscode.Position) : vscode.CompletionItem[] {
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
        return [...new Map(items.map(item => [item.label, item])).values()].sort();
    }

    private getMacrosParameters(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        // setup
        let multiline = this.getMultilineContent(document, position);
        let line = document.lineAt(position.line).text;
        let characterPosition = multiline.length - line.length + position.character;
        let end = characterPosition;
        let start = this.getMacroPosition(multiline, characterPosition);
        // setup conditions
        let isLength = multiline.length > 4;
        let isParameter = isLength && multiline[characterPosition - 1] === '-' && multiline[characterPosition - 2] === '-';

        // not valid
        if (!isParameter || start === -1) {
            return [];
        }

        // build
        let macro = multiline.substring(start, end);
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
        let items = this.getParametersBehaviors(manifest);
        return [...new Map(items.map(item => [item.label, item])).values()];
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
        return [...new Map(items.map(item => [item.label, item])).values()];
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

            let _isCli = line.substring(index, index + 3) === '{{$';
            if (_isCli) {
                return index === 0 ? 0 : index;
            }

            //skip nested macro
            let isNested = line.substring(index, index - 2) === '}}';
            if(isNested){
                while(line.substring(index, index + 3) !== '{{$' &&  index > 0){
                    index = index - 1;
                }
            }
            index = index - 1;
        }

        // get
        return -1;
    }
}
