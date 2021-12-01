/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.comw/hat-i-learned-by-building-my-own-vs-code-extension/
 * https:/w/ww.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class AssertionsAutoCompleteProvider extends Provider {
    // members
    private attributes: any[];
    private operators: any[];
    private manifests: any[];
    private references: number[];
    private locators: any[];
    private annotations: any[];

    /**
     * Creates a new instance of Provider
     */
    constructor() {
        super();
        this.attributes = [];
        this.operators = [];
        this.manifests = [];
        this.references = [];
        this.locators = [];
        this.annotations = [];
    }

    public setAnnotations(annotations: any[]) {
        // setup
        this.annotations = annotations;

        // get
        return this;
    }

    public setLocators(locators: any[]) {
        // setup
        this.locators = locators;

        // get
        return this;
    }

    /**
     * Summary. Sets a collection of operators.
     * 
     * @param operators A collection of operators.
     * @returns Self reference.
     */
    public setOperators(operators: any): AssertionsAutoCompleteProvider {
        // setup
        this.operators = operators;

        // get
        return this;
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
        var instance = new AssertionsAutoCompleteProvider()
            .setManifests(this.manifests)
            .setAnnotations(this.annotations)
            .setOperators(this.operators)
            .setLocators(this.locators);

        // register: assertions
        var assertions = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAssertionsCompletionItems(document, position);
            }
        });

        // register: methods
        var assertionMethods = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAssertionMethodsCompletionItems(document, position);
            }
        }, '{');

        // register
        var items = [assertions, assertionMethods];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    public setManifests(manifests: any) {
        // setup
        this.manifests = manifests;

        // get
        return this;
    }

    /*┌─[ AUTO-COMPLETE ITEMS - ASSERTIONS ]──────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getAssertionMethodsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
        // bad request
        if (!this.isAssert(document, position)) {
            return [];
        }

        // build
        var assertions = this.manifests.map(function (i) {
            let assertion = new vscode.CompletionItem(i.key, vscode.CompletionItemKind.Variable);
            assertion.detail = 'code';
            assertion.documentation = i.entity.description;

            return assertion;
        });

        // get
        return assertions;
    }

    private getAssertionsCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {

        // setup
        var isUnderSection = this.isUnderAnnotation(document, position, 'test-expected-results', this.annotations);

        // bad request
        if (!isUnderSection || this.isAssert(document, position)) {
            return [];
        }

        // build
        var locators = 'of {${3:locator value}} by ' + '{${4|' + this.getLocatorsEnums(this.locators) + '|}} ';
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
        var item = new vscode.CompletionItem('assert w/ element w/ attribute');
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
        var item = new vscode.CompletionItem('assert w/ element w/ attribute w/ regex');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility and supprort functions.
      └────────────────────────────────────────────────────────*/
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
