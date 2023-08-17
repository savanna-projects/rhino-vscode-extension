/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.comw/hat-i-learned-by-building-my-own-vs-code-extension/
 * https:/w/ww.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 */
import * as vscode from 'vscode';
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class AssertionsAutoCompleteProvider extends ProviderBase {
    // properties
    public attributes: any[] = [];
    public operators: any[] = [];
    public manifests: any[] = [];
    public references: number[] = [];
    public locators: any[] = [];
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

        // register: assertions
        let assertions = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAssertionsCompletionItems(document, position);
            }
        });

        // register: methods
        let assertionMethods = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getAssertionMethodsCompletionItems(document, position);
            }
        }, '{');

        // register
        let items = [assertions, assertionMethods];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    /*┌─[ AUTO-COMPLETE ITEMS - ASSERTIONS ]──────────────────
      │
      │ A collection of functions to factor auto-complete items.
      └────────────────────────────────────────────────────────*/
    private getAssertionMethodsCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // bad request
        if (!this.isAssert(document, position)) {
            return [];
        }

        // build
        let items = this.manifests.map(function (i) {
            let assertion = new vscode.CompletionItem(i.literal, vscode.CompletionItemKind.Variable);
            assertion.detail = 'code';
            assertion.documentation = i.entity.description;

            return assertion;
        });

        // get
        return [...new Map(items.map(item => [item.label, item])).values()];
    }

    private getAssertionsCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position): vscode.CompletionItem[] {

        // setup
        let isUnderSection = this.isUnderAnnotation(document, position, 'test-expected-results', this.annotations);

        // bad request
        if (!isUnderSection || this.isAssert(document, position)) {
            return [];
        }

        // build
        let locators = 'of {${3:locator value}} by ' + '{${4|' + this.getLocatorsEnums([...new Set(this.locators)]) + '|}} ';
        let operators = '${5|' + [...new Set(this.operators)].map((i) => i.literal.toLowerCase()).sort() + '|} ';
        let attributes = '{${6|' + [...new Set(this.attributes)].sort().map(i => i.key).join(',') + '|}} ';

        // get
        let snippets = [
            this.getWithElement(locators, operators),
            this.getWithElementWithAttribute(locators, operators, attributes),
            this.getWithElementWithRegex(locators, operators),
            this.getWithElementWithAttributeWithRegex(locators, operators, attributes)
        ];
        return [...new Map(snippets.map(item => [item.label, item])).values()];
    }

    private getWithElement(locators: string, operators: string): vscode.CompletionItem {
        // build
        let snippet =
            '[${1:step number}] verify that ' +
            '{${2:text}} ' +
            locators +
            operators + '{${6:expected result}}';
        let item = new vscode.CompletionItem('assert w/ element');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithAttribute(
        locators: string,
        operators: string,
        attributes: string): vscode.CompletionItem {

        // build
        let snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            attributes +
            operators + '{${7:expected result}}';
        let item = new vscode.CompletionItem('assert w/ element w/ attribute');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithRegex(locators: string, operators: string): vscode.CompletionItem {
        // build
        let snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            'with regex {${6:.*}} ' +
            operators + '{${7:expected result}}';
        let item = new vscode.CompletionItem('assert w/ element w/ regex');
        item.insertText = new vscode.SnippetString(snippet);
        item.documentation = new vscode.MarkdownString('Coming soon.');
        item.kind = vscode.CompletionItemKind.Method;
        item.detail = 'code';

        // get
        return item;
    }

    private getWithElementWithAttributeWithRegex(
        locators: string,
        operators: string,
        attributes: string): vscode.CompletionItem {

        // build
        let snippet =
            '[${1:step number}] verify that ' +
            '{${2:method}} ' +
            locators +
            attributes +
            'with regex {${7:.*}} ' +
            operators + '{${8:expected result}}';
        let item = new vscode.CompletionItem('assert w/ element w/ attribute w/ regex');
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
        let text = document.lineAt(position.line).text;
        let subPre = text.substring(0, position.character);

        let length = (text.length - position.character) < 0
            ? 0
            : (text.length - position.character);
        let subSuf = text.substring(position.character, length);

        // setup
        let isAssertPre = subPre.match('^\\[\\d+]\\s+(verify that|assert)\\s+\\{') !== null;
        let isAssertSuf = subSuf.match('.*}') !== null;

        // get
        return isAssertPre && isAssertSuf;
    }
}
