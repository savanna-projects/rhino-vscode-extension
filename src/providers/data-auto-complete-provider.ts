/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Settings } from '../constants/settings';
import { ProviderBase } from './provider-base';

export class DataAutoCompleteProvider extends ProviderBase {
    // properties
    public references: number[] = [];
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
        let snippet = vscode.languages.registerCompletionItemProvider(Settings.providerOptions, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return instance.getDataCompletionItems(document, position);
            }
        });

        // register
        let items = [snippet];
        context.subscriptions.push(...items);

        // save references
        for (let i = 0; i < items.length; i++) {
            this.references.push(context.subscriptions.length - 1 - i);
        }
    }

    /*┌─[ AUTO-COMPLETE - DATA SNIPPET ]───────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ for test case data.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for test case data with auto-complete behavior. 
     */
    private getDataCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        // bad request
        if (!this.isUnderAnnotation(document, position, 'test-data-provider', this.annotations)) {
            return [];
        }

        // get
        let mdTable = new vscode.CompletionItem('data input, markdown', vscode.CompletionItemKind.Snippet);
        mdTable.documentation = 'Basic MD (markdown) table snippet for data driven testing.';
        mdTable.detail = 'vscode';
        mdTable.insertText =
            '|ParameterOne         |ParameterTwo         |\n' +
            '|---------------------|---------------------|\n' +
            '|value one iteration 1|value two iteration 1|\n' +
            '|value one iteration 2|value two iteration 2|';

        // get
        return [...new Map([mdTable].map(item => [item.label, item])).values()];
    }
}
