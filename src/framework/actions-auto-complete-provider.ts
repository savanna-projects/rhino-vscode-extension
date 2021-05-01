/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import * as vscode from 'vscode';
import { RhinoSnippet } from '../contracts/rhino-snippet';

export class ActionsAutoCompleteProvider {
    // members
    private pattern: string;
    private manifests: any[];
    private locators: any[];
    private annotations: any[];
    private attributes: any[];
    private assertions: any[];
    private operators: any[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        this.pattern = '.*';
        this.manifests = [];
        this.locators = [];
        this.annotations = [];
        this.attributes = [];
        this.assertions = [];
        this.operators = [];
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Sets a collection of element special attributes.
     * 
     * @param attributes A collection of element special attributes.
     * @returns Self reference.
     */
    public setAttributes(attributes: any): ActionsAutoCompleteProvider {
        // setup
        this.attributes = attributes;
        
        // get
        return this;
    }

    /**
     * Summary. Sets a collection of assertions.
     * 
     * @param assertions A collection of assertions.
     * @returns Self reference.
     */
    public setAssertions(assertions: any): ActionsAutoCompleteProvider {
        // setup
        this.assertions = assertions;
        
        // get
        return this;
    }

    /**
     * Summary. Sets a collection of operators.
     * 
     * @param operators A collection of operators.
     * @returns Self reference.
     */
    public setOperators(operators: any): ActionsAutoCompleteProvider {
        // setup
        this.operators = operators;
        
        // get
        return this;
    }

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
     * Summary. Sets the collection of test case annotations.
     * 
     * @param annotations A collection of test case annotations.
     * @returns Self reference.
     */
    public setAnnotations(annotations: any[]): ActionsAutoCompleteProvider {
        // setup
        this.annotations = annotations;
        
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
        var isCli =this.isCli(document.lineAt(position.line).text, position.character);
        var isUnderSection = this.isUnderAnnotation(document, position, 'test-actions');
        
        if(isCli || !isUnderSection) {
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

    // TODO: handle verbs
    private getElementToken(manifest: any) {
        // setup
        var locatorsVerbs: string[] = [];
        
        // build
        for (let i = 0; i < this.locators.length; i++) {
            locatorsVerbs.push(this.locators[i].verb);
        }

        // get
        return manifest.verb + ' {${5:locator value}} by ' + '{${6|' + this.getLocatorsEnums() + '|}}';
    }

    private getAttributeToken() {
        return 'from {${7|' + this.attributes.sort().map(i => i.key).join(',') + '|}}';
    }

    private getRegexToken() {
        return 'with regex {${8:.*}}';
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
     * Summary. Gets a collection of CompletionItem for test case properties with auto-complete behavior. 
     */
    public getAnnotationsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // setup conditions
        var isProperty = position.character === 1 && document.lineAt(position.line).text[position.character -1] === '[';

        // not found
        if(!isProperty) {
            return [];
        }

        // build
        var annotations: vscode.CompletionItem[] = [];
        for (let i = 0; i < this.annotations.length; i++) {
            var property = new vscode.CompletionItem(this.annotations[i].key, vscode.CompletionItemKind.Property);
            property.documentation = this.annotations[i].entity.description;
            annotations.push(property);
        }

        // get
        return annotations;
    }

    /*┌─[ AUTO-COMPLETE ASSERTION ITEMS ]──────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ for test case assertion.
      └────────────────────────────────────────────────────────*/
     /**
     * Summary. Gets a collection of CompletionItem for test case properties with auto-complete behavior. 
     */
    public getAssertionsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {

        // setup
        var isUnderSection = this.isUnderAnnotation(document, position, 'test-expected-results');

        // bad request
        if(!isUnderSection || this.isAssert(document, position)) {
            return [];
        }

        // build
        var locators = 'of {${3:locator value}} by ' + '{${4|' + this.getLocatorsEnums() + '|}} ';
        var operators = '${5|' + this.operators.map((i) => i.literal.toLowerCase()).sort() + '|} ';
        var attributes = '{${6|' + this.attributes.sort().map(i => i.key).join(',') + '|}} ';

        // get
        return [
            this.getWithElement(locators, operators),
            this.getWithElementWithAttribute(locators, operators, attributes),
            this.getWithElementWithRegex(locators, operators),
            this.getWithElementWithAttributeWithRegex(locators, operators, attributes)
        ];
    }

    private getWithElement(locators: string, operators: string): vscode.CompletionItem {
        // build
        var snippet =
            '[${1:step number}] verify that ' +
            '{${2:text}} ' +
            locators +
            operators + '{${6:expected result}}';
        var item = new vscode.CompletionItem('assert w/ element');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithAttribute(locators: string, operators: string, attributes: string)
        : vscode.CompletionItem {
        // build
        var snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            attributes +
            operators + '{${7:expected result}}';
        var item = new vscode.CompletionItem('assert w/ element /w attribute');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithRegex(locators: string, operators: string): vscode.CompletionItem {
        // build
        var snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            'with regex {${6:.*}} ' +
            operators + '{${7:expected result}}';
        var item = new vscode.CompletionItem('assert w/ element w/ regex');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithAttributeWithRegex(locators: string, operators: string, attributes: string)
        : vscode.CompletionItem {
        // build
        var snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            attributes +
            'with regex {${7:.*}} ' +
            operators + '{${8:expected result}}';
        var item = new vscode.CompletionItem('assert w/ element /w attribute /w regex');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    /**
     * Summary. Gets a collection of all available assertion methods.
     */
    public getAssertionMethodsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // bad request
        if(!this.isAssert(document, position)) {
            return [];
        }

        // build
        var assertions = this.assertions.map(function(i) {
            let assertion = new vscode.CompletionItem(i.literal, vscode.CompletionItemKind.Variable);
            assertion.detail = 'code';
            assertion.documentation = i.entity.description;
            
            return assertion;
        });

        // get
        return assertions;
    }

    /*┌─[ AUTO-COMPLETE ASSERTION ITEMS ]──────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ for test case assertion.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for test case properties with auto-complete behavior. 
     */
    public getDataCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // bad request
        if(!this.isUnderAnnotation(document, position, 'test-data-provider')) {
            return [];
        }

        // get
        var mdTable = new vscode.CompletionItem('data input, markdown', vscode.CompletionItemKind.Snippet);
        mdTable.documentation = 'Basic MD (markdown) table snippet for data driven testing.';
        mdTable.detail = 'vscode';
        mdTable.insertText =
            '|ParameterOne         |ParameterTwo         |\n' +
            '|---------------------|---------------------|\n' +
            '|value one iteration 1|value two iteration 1|\n' +
            '|value one iteration 2|value two iteration 2|';
        return [mdTable];
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

    // gets a value indicating if the current line is under a specific property (annotation)
    private isUnderAnnotation(document: vscode.TextDocument, position: vscode.Position, annotation: string) {
        // setup
        var pattern  = this.annotations.map((i) => '^\\[' + i.key + ']').join('|');
        var testPattern = '^\\[' + annotation + ']';

        // iterate
        var line = position.line;
        while (line !== 0) {
            if(!document.lineAt(line).text.match(pattern)) {
                line = line - 1;
                continue;
            }
            return document.lineAt(line).text.match(testPattern) !== null;
        }

        // default
        return false;
    }

    private getRhinoSnippet(manifest: any, name: string, snippet: string): RhinoSnippet {
        return new RhinoSnippet()
            .setName(name)
            .setSnippet(snippet)
            .setDocumentation(manifest.entity.description)
            .setDetail(manifest.source);
    }

    private getLocatorsEnums(): string {
        // setup
        var locators: any[] = [];
        
        // build
        for (let i = 0; i < this.locators.length; i++) {
            if(this.locators[i].literal === 'x path') {
                locators.push('xpath');
                continue;
            }
            locators.push(this.locators[i].literal);
        }

        // get
        return Array.from(new Set(locators)).sort().join(',');
    }

    private isAssert(document: vscode.TextDocument, position: vscode.Position): boolean {
        // setup
        var text = document.lineAt(position.line).text;
        var subPre = text.substr(0, position.character);

        var length = (text.length - position.character) < 0
            ? 0
            : (text.length - position.character);
        var subSuf = text.substr(position.character, length);

        // setup
        var isAssertPre = subPre.match('^\\[\\d+]\\s+(verify that|assert)\\s+\\{') !== null;
        var isAssertSuf = subSuf.match('.*}') !== null;

        // get
        return isAssertPre && isAssertSuf;
    }
}