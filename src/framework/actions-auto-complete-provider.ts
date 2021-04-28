/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 */
import * as vscode from 'vscode';
import { RhinoSnippet } from '../contracts/rhino-snippet';

export class ActionsAutoCompleteProvider {
    // members
    private pattern: string;
    private manifests: any[];
    private locators: any[];
    private attributes: any[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        this.pattern = '.*';
        this.manifests = [];
        this.locators = [];
        this.attributes = [];
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Sets the regular expression pattern to find a valid plugin in a document line.
     * 
     * @param pattern A regular expression pattern to find a valid plugin in a document line.
     * @returns Self reference.
     */
    public setPattern(pattern: string): ActionsAutoCompleteProvider {
        // setup
        this.pattern = pattern;
        
        // get
        return this;
    }

    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any[]): ActionsAutoCompleteProvider {
        // setup
        this.manifests = manifests;
        
        // get
        return this;
    }

    /**
     * Summary. Sets the collection of locators references as returns by Rhino Server.
     * 
     * @param locators A collection of locators references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setLocators(locators: any[]): ActionsAutoCompleteProvider {
        // setup
        this.locators = locators;
        
        // get
        return this;
    }

    /**
     * Summary. Sets the collection of element special attribute references as returns by Rhino Server.
     * 
     * @param attributes A collection of element special attribute references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setAttributes(attributes: any[]): ActionsAutoCompleteProvider {
        // setup
        this.attributes = attributes;
        
        // get
        return this;
    }    

    /*┌─[ AUTO-COMPLETE ITEMS ]────────────────────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for snippets with auto-complete behavior. 
     */
    public getActionsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // bad request
        if(this.isCli(document.lineAt(position.line).text, position.character)) {
            return [];
        }

        // setup
        var snippets = this.getSnippets();
        var provieders: vscode.CompletionItem[] = [];

        // build
        snippets.forEach(i => provieders.push(this.getActionsCompletionItem(i)));

        // get
        return provieders;        
    }

    private getActionsCompletionItem(snippet: RhinoSnippet): vscode.CompletionItem {
        // setup
        var item = new vscode.CompletionItem(snippet.name);

        // build
        item.insertText = new vscode.SnippetString(snippet.snippet);
        item.documentation = new vscode.MarkdownString(snippet.documentation);
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = snippet.detail;

        // get
        return item;
    }

    private getSnippets(): RhinoSnippet[] {
        // setup
        var snippets: RhinoSnippet[] = [];

        // build: argument
        this.manifests.forEach(i => snippets.push(...this.getSnippet(i)));

        // get
        return snippets;
    }

    private getSnippet(manifest: any): RhinoSnippet[] {
        // setup
        var token = this.getActionToken(manifest);
        var literal = manifest.key.replace(/([A-Z])/g, " $1").trim().toLowerCase();
        var snippets: RhinoSnippet[] = [];

        // setup conditions
        var isProperties = manifest.entity.hasOwnProperty('properties');
        var isOnElement = isProperties && manifest.entity.properties.hasOwnProperty('elementToActOn');
        var isOnAttribute = isProperties && manifest.entity.properties.hasOwnProperty('elementAttributeToActOn');
        var isArgument = isProperties && manifest.entity.properties.hasOwnProperty('argument');
        var isRegex = isProperties && manifest.entity.properties.hasOwnProperty('regularExpression');
        var isCli = manifest.entity.hasOwnProperty('cliArguments');

        // setup: aggregated data
        var agName: string[] = [];
        var agSnpt: string[] = [];
        var iterations = isCli
            ? [ { token: '{${1:argument value}}', name: 'w/ argumet' }, { token: '{{$ ${1:parameters values}}}', name: 'w/ argumets' } ]
            : [ { token: '{${1:argument value}}', name: 'w/ argumet' } ];

        // default
        agName.push(literal);
        agSnpt.push(token);
        snippets.push(this.getRhinoSnippet(manifest, literal, token));

        // build
        for (let i = 0; i < iterations.length; i++) {           
            if(isArgument) {
                agName.push(iterations[i].name);
                agSnpt.push(iterations[i].token);
                snippets.push(this.getRhinoSnippet(manifest, agName.join(' '), agSnpt.join(' ')));
            }
            if(isOnElement) {
                agName.push('w/ element');
                agSnpt.push(this.getElementToken(manifest));
                snippets.push(this.getRhinoSnippet(manifest, agName.join(' '), agSnpt.join(' ')));
            }
            if(isOnAttribute) {
                agName.push('w/ attribute');
                agSnpt.push(this.getAttributeToken());
                snippets.push(this.getRhinoSnippet(manifest, agName.join(' '), agSnpt.join(' ')));        
            }
            if(isRegex) {
                agName.push('w/ regex');
                agSnpt.push(this.getRegexToken());
                snippets.push(this.getRhinoSnippet(manifest, agName.join(' '), agSnpt.join(' ')));
            }
            agName = [ literal ];
            agSnpt = [ token ];
        }

        // get
        return snippets;       
    }   

    private getActionToken(manifest: any): string {
        // setup
        var action = manifest.key.replace(/([A-Z])/g, " $1").trim().toLowerCase();
        var aliases: string[] = [];

        // build
        if(manifest.hasOwnProperty('aliases') && manifest.aliases !== null) {
            for (var i = 0; i < manifest.aliases.length; i++) {
                aliases.push(manifest.aliases[i].replace(/([A-Z])/g, " $1").trim().toLowerCase());               
            }
        }

        // get
        return aliases.length < 1 ? action : '{${1|' + action + ',' + aliases.sort().join(',') + '|}}';
    }

    private getElementToken(manifest: any) {
        // setup
        var locators: any[] = [];
        var locatorsVerbs: string[] = [];
        
        // build
        for (let i = 0; i < this.locators.length; i++) {
            if(this.locators[i].literal === 'x path') {
                locators.push('xpath');
                continue;
            }
            locators.push(this.locators[i].literal);
            locatorsVerbs.push(this.locators[i].verb);
        }

        // get
        var _locators = Array.from(new Set(locators)).sort().join(',');
        return manifest.verb + ' {${5:locator value}} using ' + '{${6|' + _locators + '|}}';
    }

    private getAttributeToken() {
        // setup
        var attributes: any[] = [];

        // build
        for (let i = 0; i < this.attributes.length; i++) {
            attributes.push( this.attributes[i].key);
        }

        // get
        return 'from {${7|' + attributes.sort().join(',') + '|}}';
    }

    private getRegexToken() {
        return '${8|filter,mask|} with pattern {${9:.*}}';
    }    

    /*┌─[ AUTO-COMPLETE ITEMS BEHAVIOR ]─────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ behavior for action CLI arguments.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for snippets with auto-complete behavior. 
     */
    public getParametersCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var matches = document.lineAt(position).text.match(this.pattern);
       
        // not found
        if(matches === null) {
            return [];
        }

        // build
        var action = matches[0].toLowerCase().split(' ');
        
        // build
        for (let i = 0; i < action.length; i++) {
            action[i] = action[i][0].toUpperCase() + action[i].slice(1);
        }
        
        // get
        var key =  action.join('');
        var manifest = this.manifests.find(i => i.key === key);

        // not found
        if(manifest === undefined) {
            return [];
        }

        // get
        return this.getParametersBehaviors(manifest, document, position);
    }

    private getParametersBehaviors(manifest: any, document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var items: vscode.CompletionItem[] = [];
        var keys = Object.keys(manifest.entity.cliArguments);
        
        // build: list
        for (var i = 0; i < keys.length; i++) {
            var item = this.getParametersBehavior(manifest, keys[i], document, position);

            if(item.label !== '-1') {
                items.push(item);
            }                       
        }
        
        // get
        return items;
    }
    
    private getParametersBehavior(manifest: any, key: string, document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem {
        // setup
        var line = document.lineAt(position).text;
        var isKey = line.match("(?<!['])" + manifest.literal);
        var isParameters = line.substr(0, position.character).match('(?<={{\\$\\s+.*?)--');
        var isParameter = line[position.character - 3] + line[position.character - 2] + line[position.character - 1] === ' --';

        // not found
        if(!isKey || !isParameters || !isParameter) {
            return new vscode.CompletionItem('-1');
        }

        // build
        var item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);
        item.documentation = manifest.entity.cliArguments[key];

        // get
        return item;
    }

    /*┌─[ AUTO-COMPLETE ANNOTATION ITEMS ]─────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ for test case annotations.
      └────────────────────────────────────────────────────────*/
     /**
     * Summary. Gets a collection of CompletionItem for test case annotations with auto-complete behavior. 
     */
    public getAnnotationsCompletionItems(properties: any[], document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup conditions
        var isProperty = position.character === 1 && document.lineAt(position.line).text[position.character -1] === '[';

        // not found
        if(!isProperty) {
            return [];
        }

        // build
        var attributes: vscode.CompletionItem[] = [];
        for (let i = 0; i < properties.length; i++) {
            var attribute = new vscode.CompletionItem(properties[i].key, vscode.CompletionItemKind.Property);
            attribute.documentation = properties[i].entity.description;
            attributes.push(attribute);
        }

        // get
        return attributes;
    }

    // Utilities
    private isCli(line: string, index: number): boolean {
        // setup
        index = index < 0 ? 0 : index;

        // build
        while (index > 0) {
            if(index - 1 < 0) {
                return false;
            }
            
            var _isCli = line.substr(index - 1, 3) === '{{$';
            if(_isCli) {
               return true;
            }
            index = index - 1;
        }

        // get
        return false;
    }

    private getRhinoSnippet(manifest: any, name: string, snippet: string): RhinoSnippet {
        return new RhinoSnippet()
            .setName(name)
            .setSnippet(snippet)
            .setDocumentation(manifest.entity.description)
            .setDetail(manifest.source);
    }
}