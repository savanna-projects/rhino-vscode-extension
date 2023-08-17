/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Utilities } from '../extensions/utilities';

export abstract class Formatter {
    // properties:
    public readonly manifest: any;
    public readonly client: RhinoClient;
    public readonly endpoint: string;
    public readonly context: vscode.ExtensionContext;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        // setup
        this.endpoint = Utilities.getRhinoEndpoint();
        this.context = context;

        // build
        this.manifest = Utilities.getManifest();
        this.client = new RhinoClient(this.endpoint);
    }

    /**
     * Summary. Gets a set of text edits or a thenable that resolves to such.
     *          The lack of a result can be signaled by returning undefined, null, or an empty array.
     * 
     * @returns A set of text edits or a thenable that resolves to such. 
     */
    public abstract format(document: vscode.TextDocument, callback: any): vscode.TextEdit[];
}
