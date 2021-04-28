/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

export class MacrosAutoCompleteProvider {
    // members
    private manifests: any[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        this.manifests = [];
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any[]): MacrosAutoCompleteProvider {
        // setup
        this.manifests = manifests;
        
        // get
        return this;
    }

    /*┌─[ AUTO-COMPLETE ITEMS BEHAVIOR ]─────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ behavior for macros.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for snippets with auto-complete behavior. 
     */
    public getMacrosCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup
        var matches = document.lineAt(position).text.match('(?<=.*){{\\$');
       
        // not found
        if(matches === null) {
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

    public getMacrosParameters(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        // setup
        var line = document.lineAt(position.line).text;
        var end = position.character;
        var start = this.getMacroPosition(line, position.character);

        // setup conditions
        var isLength = line.length > 4;
        var isParameter = isLength && line[position.character - 1] === '-' && line[position.character - 2] === '-';

        // not valid
        if(!isParameter || start === -1) {
            return [];
        }

        // build
        var macro = line.substring(start, end);
        var matches = macro.match('(?<={{\\$)[^\\s]*');

        // not found
        if(matches === null) {
            return [];
        }

        // build
        var key = matches[0].toLowerCase();
        var manifest = this.manifests.find(i => i.key === key);

        // not found
        if(manifest === undefined) {
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

            if(item.label !== '-1') {
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

    // Utilities
    private getMacroPosition(line: string, index: number): number {
        // setup
        index = index < 0 ? 0 : index;

        // build
        while (index > 0) {
            if(index - 1 < 0) {
                return -1;
            }

            var _isCli = line.substr(index - 1, 3) === '{{$';
            if(_isCli) {
               return index === 0 ? 0 : index - 1;
            }
            index = index - 1;
        }

        // get
        return -1;
    }

    private static getPluginsPattern(plugins: any[]): string {
        // setup
        var patterns: string[] = [];
        
        // build
        for (var i = 0; i < plugins.length; i++) {
            patterns.push("(?<={{\\$)" + plugins[i].key);
        }
        
        // get
        return patterns.join('|');
    }
}