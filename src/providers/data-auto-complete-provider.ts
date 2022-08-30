/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { ExtensionSettings } from '../extension-settings';
import { Provider } from './provider';

export class DataAutoCompleteProvider extends Provider {
    // members
    private manifests: any[];
    private references: number[];
    private annotations: any[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        super();
        this.manifests = [];
        this.references = [];
        this.annotations = [];
    }

    public setAnnotations(annotations: any[]) {
        // setup
        this.annotations = annotations;

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
        let instance = new DataAutoCompleteProvider()
            .setAnnotations(this.annotations)
            .setManifests(this.manifests);

        // register: assertions
        let snippet = vscode.languages.registerCompletionItemProvider(ExtensionSettings.providerOptions, {
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

    /*┌─[ AUTO-COMPLETE - DATA SNIPPET ]───────────────────────
      │
      │ A collection of functions to factor auto-complete items
      │ for test case data.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets a collection of CompletionItem for test case data with auto-complete behavior. 
     */
    public getDataCompletionItems(document: vscode.TextDocument, position: vscode.Position)
        : vscode.CompletionItem[] {
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
