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
import { RhinoSnippet } from '../models/rhino-snippet-model';
import { ProviderBase } from './provider-base';

export class ActionsAutoCompleteProvider extends ProviderBase {
    // properties
    public pattern: string = '.*';
    public references: number[] = [];
    public manifests: any[] = [];
    public locators: any[] = [];
    public attributes: any[] = [];
    public annotations: any[] = [];

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
        let action = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getActionsCompletionItems(document, position);
            }
        });

        // register: parameters
        let parameters = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getParametersCompletionItems(document, position);
            }
        }, '-');

        // register
        let items = [action, parameters];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    /*┌─[ AUTO-COMPLETE ITEMS - ACTIONS ]──────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getActionsCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // bad request
        let isCli = this.isCli(document.lineAt(position.line).text, position.character);
        let isUnderSection = this.isUnderAnnotation(document, position, 'test-actions', this.annotations);

        if (isCli || !isUnderSection) {
            return [];
        }

        // setup
        let snippets = this.getSnippets();
        let providers: vscode.CompletionItem[] = [];

        // build
        snippets.forEach(i => providers.push(this.getActionsCompletionItem(i)));

        // get
        return [...new Map(providers.map(item => [item.label, item])).values()];
    }

    private getActionsCompletionItem(snippet: RhinoSnippet): vscode.CompletionItem {
        // setup
        let item = new vscode.CompletionItem(snippet.name);

        // build
        item.insertText = new vscode.SnippetString(snippet.snippet);
        item.documentation = new vscode.MarkdownString(snippet.documentation);
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = snippet.detail;

        // TODO: search rhino plugins and add link if found.

        // get
        return item;
    }

    private getSnippets(): RhinoSnippet[] {
        // setup
        let snippets: RhinoSnippet[] = [];

        // build: argument
        this.manifests.forEach(i => snippets.push(...this.getSnippet(i)));

        // get
        const key = 'name';
        return [...new Map(snippets.map(item => [item[key], item])).values()];
    }

    private getSnippet(manifest: any): RhinoSnippet[] {
        // setup
        let token = this.getActionToken(manifest);
        let literal = manifest.key.replace(/([A-Z])/g, " $1").trim().toLowerCase();
        let snippets: RhinoSnippet[] = [];

        // setup conditions
        let isProperties = manifest.entity.hasOwnProperty('properties');
        let isOnElement = isProperties && manifest.entity.properties.hasOwnProperty('elementToActOn');
        let isOnAttribute = isProperties && manifest.entity.properties.hasOwnProperty('elementAttributeToActOn');
        let isArgument = isProperties && manifest.entity.properties.hasOwnProperty('argument');
        let isRegex = isProperties && manifest.entity.properties.hasOwnProperty('regularExpression');
        let isCli = manifest.entity.hasOwnProperty('cliArguments');
        let conditions = {
            isCli: isCli,
            isProperties: isProperties,
            isOnElement: isOnElement,
            isOnAttribute: isOnAttribute,
            isArgument: isArgument,
            isRegex: isRegex
        };

        // setup: aggregated data
        let iterations = isCli
            ? [{ token: '{${1:argument value}}', name: 'w/ argument' }, { token: '{{$ ${1:parameters values}}}', name: 'w/ arguments' }]
            : [{ token: '{${1:argument value}}', name: 'w/ argument' }];

        // build
        for (const iteration of iterations) {
            iteration.name = literal + ` ${iteration.name}`;
            iteration.token = token + ` ${iteration.token}`;
            let onSnippets = this.getSnippetEntries(manifest, conditions, iteration);
            snippets.push(...onSnippets);
        }

        // get
        return snippets;
    }

    private getSnippetEntries(manifest: any, conditions: any, iteration: any): RhinoSnippet[] {
        // setup
        let names: string[] = [];
        let tokens: string[] = [];
        let snippets: RhinoSnippet[] = [];

        // default
        if (conditions.isCli || conditions.isArgument) {
            names.push(iteration.name);
            tokens.push(iteration.token);
            snippets.push(this.getRhinoSnippet(manifest, names.join(' '), tokens.join(' ')));
        }
        if (conditions.isOnElement) {
            names.push('w/ element');
            tokens.push(this.getElementToken(manifest));
            snippets.push(this.getRhinoSnippet(manifest, names.join(' '), tokens.join(' ')));
        }
        if (conditions.isOnAttribute) {
            names.push('w/ attribute');
            tokens.push(this.getAttributeToken());
            snippets.push(this.getRhinoSnippet(manifest, names.join(' '), tokens.join(' ')));
        }
        if (conditions.isRegex) {
            names.push('w/ regex');
            tokens.push(this.getRegexToken());
            snippets.push(this.getRhinoSnippet(manifest, names.join(' '), tokens.join(' ')));
        }

        // get
        const key = 'name';
        return [...new Map(snippets.map(item => [item[key], item])).values()];
    }

    private getActionToken(manifest: any): string {
        // setup
        let action = manifest.key.replace(/([A-Z])/g, " $1").trim().toLowerCase();
        let aliases: string[] = [];

        // build
        if (manifest.hasOwnProperty('aliases') && manifest.aliases !== null) {
            for (const alias of manifest.aliases) {
                aliases.push(alias.replace(/([A-Z])/g, " $1").trim().toLowerCase());
            }
        }

        // get
        return aliases.length < 1 ? action : '{${1|' + action + ',' + [...aliases].sort().join(',') + '|}}';
    }

    private getElementToken(manifest: any) {
        return manifest.verb + ' {${5:locator value}} by ' + '{${6|' + this.getLocatorsEnums(this.locators) + '|}}';
    }

    private getAttributeToken() {
        return 'from {${7|' + [...this.attributes].sort().map(i => i.key).join(',') + '|}}';
    }

    private getRegexToken() {
        return 'with regex {${8:.*}}';
    }

    /*┌─[ AUTO-COMPLETE ITEMS - PARAMETERS ]───────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getParametersCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // setup
        let matches = this.getMultilineContent(document, position).match(this.pattern);

        // not found
        if (matches === null) {
            return [];
        }
        
        // build
        let action = matches[0].toLowerCase().split(' ');

        // build
        for (let i = 0; i < action.length; i++) {
            action[i] = action[i][0].toUpperCase() + action[i].slice(1);
        }

        // get
        let key = action.join('');
        let manifest = this.manifests.find(i => i.key === key);

        // not found
        if (manifest === undefined) {
            return [];
        }

        // get
        return this.getParametersBehaviors(manifest, document, position);
    }

    // check whether position is inside the action's arguments - first opened '{{$' and outside nested '{{$' arguments
    private isActionArguments(str:string, position:number): boolean {
        let depth = 0; // Track nested levels of {{
        let insideFirstOpeningBrackets = false;
        let openingIndex = -1;
        let positions:{start:number,end:number | undefined}[] = [];
        for (let i = 0; i < str.length - 1; i++) {
            if (str[i] === '{' && str[i + 1] === '{' && str[i+2] === '$') {
                i+=2; // Skip checking the next 2 characters since it's part of {{$
                if (depth === 0) {
                    openingIndex = i;
                }
                else{
                    positions[depth] = {start:i, end: undefined};
                }
                depth++;
                
            } else if (str[i] === '}' && str[i + 1] === '}') {
                depth--;
                if (depth === 0 && openingIndex !== -1) {
                    // Check if position is inside the first {{
                    insideFirstOpeningBrackets = (position >= openingIndex 
                        && position < i 
                        && positions.every(pos => !(pos.start >= i && pos?.end ? pos.end < i : position < i)));
                    openingIndex = -1; // Reset opening index after first {{
                    break; // No need to continue checking
                }
                else{
                    positions[depth].end = i;
                }
                i++; // Skip checking the next character since it's part of }}
            }
        }
    
        return insideFirstOpeningBrackets;
    }
    private getParametersBehaviors(
        manifest: any,
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // setup
        let items: vscode.CompletionItem[] = [];
        let keys = Object.keys(manifest.entity.cliArguments);
        // build: list
        for (const key of keys) {
            let item = this.getParametersBehavior(manifest, key, document, position);

            if (item.label !== '-1') {
                items.push(item);
            }
        }

        // get
        return [...new Map(items.map(item => [item.label, item])).values()];
    }

    private getParametersBehavior(
        manifest: any,
        key: string,
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem {  

        // setup
        let line = document.lineAt(position).text;
        let multiLine = this.getMultilineContent(document, position);
        let characterPosition = multiLine.length - line.length + position.character;
        
        let isKey = multiLine.match("(?<!['])" + manifest.literal);
        let isParameters = this.isActionArguments(multiLine, characterPosition) && multiLine.substring(0, characterPosition).match('(?<={{\\$\\s+.*?)--$');
        let isParameter = (line[position.character - 3] + line[position.character - 2] + line[position.character - 1]).match("^--$|\s--");
    
        // not found
        if (!isKey || !(isParameters || isParameter)) {
            return new vscode.CompletionItem('-1');
        }

        // build
        let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);
        item.documentation = manifest.entity.cliArguments[key];

        // get
        return item;
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility and support functions.
      └────────────────────────────────────────────────────────*/
    // Gets a RhinoSnippet object based on a Plugin manifest
    private getRhinoSnippet(manifest: any, name: string, snippet: string): RhinoSnippet {
        // setup
        const rhinoSnippet = new RhinoSnippet();

        // build
        rhinoSnippet.name = name;
        rhinoSnippet.documentation = manifest.entity.description;
        rhinoSnippet.detail = manifest.source;
        rhinoSnippet.snippet = snippet;

        // get
        return rhinoSnippet;
    }
}
