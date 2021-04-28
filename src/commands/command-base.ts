/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

export abstract class Command {
    // members:
    private commandName: string;
    private endpoint: string;
    private context: vscode.ExtensionContext;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        this.commandName = '';
        this.endpoint = 'http://localhost:9000';
        this.context = context;
    }

    /**
     * Summary. Sets the command name to register.
     * 
     * @param commandName The command name.
     * @returns Self reference. 
     */
    public setCommandName(commandName: string): Command {
        // setup
        this.commandName = commandName;

        // get
        return this;
    }

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
     * Summary. Gets the VS Code context to use with the command.
     * 
     * @returns The VS Code context. 
     */
     public getContext(): vscode.ExtensionContext {
        return this.context;
    }

    /**
     * Summary. When implemented, returns registerable command
     */
    public abstract register(): any;
}