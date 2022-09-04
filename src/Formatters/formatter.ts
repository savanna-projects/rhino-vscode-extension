/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { RhinoClient } from '../framework/rhino-client';

export abstract class Formatter {
    // members:
    private endpoint: string;
    private context: vscode.ExtensionContext;
    private projectManifest: any;
    private client: RhinoClient;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        // setup
        this.endpoint = 'http://localhost:9000';
        this.context = context;

        // build
        this.projectManifest = Utilities.getProjectManifest();
        let server = this.projectManifest.rhinoServer;
        let rhinoEndpoint = this.setEndpoint(server.schema + '://' + server.host + ':' + server.port).getEndpoint();
        this.client = new RhinoClient(rhinoEndpoint);
    }

    /**
     * Summary. Gets the VS Code context to use with the command.
     * 
     * @returns The VS Code context. 
     */
    public getContext(): vscode.ExtensionContext {
        return this.context;
    }

    /**
     * Summary. Gets a set of text edits or a thenable that resolves to such.
     *          The lack of a result can be signaled by returning undefined, null, or an empty array.
     * 
     * @returns A set of text edits or a thenable that resolves to such. 
     */
    public abstract format(document: vscode.TextDocument, callback: any): vscode.TextEdit[]

    /**
     * Summary. Set the Rhino Server endpoint to use with the command.
     * 
     * @param endpoint The Rhino Server endpoint.
     * @returns Self reference. 
     */
    public setEndpoint(endpoint: string) {
        // setup
        this.endpoint = endpoint;

        // get
        return this;
    }

    /**
     * Summary. Gets the Rhino Server endpoint to use with the command.
     * 
     * @returns The Rhino Server endpoint. 
     */
    public getEndpoint(): string {
        return this.endpoint;
    }

    /**
     * Summary. Gets the Rhino API client to use with the command.
     * 
     * @returns The Rhino API client. 
     */
    public getRhinoClient(): RhinoClient {
        return this.client;
    }
}
