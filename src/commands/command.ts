/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { RhinoClient } from '../framework/rhino-client';

export abstract class Command {
    // members:
    private commandName: string;
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
        this.commandName = '';
        this.endpoint = 'http://localhost:9000';
        this.context = context;

        // build
        this.projectManifest = Utilities.getProjectManifest();
        var server = this.projectManifest.rhinoServer;
        var rhinoEndpoint = this.setEndpoint(server.schema + '://' + server.host + ':' + server.port).getEndpoint();
        this.client = new RhinoClient(rhinoEndpoint);
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
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
     * Summary. Sets the Rhino Project manifest to use with the command.
     * 
     * @param projectManifest The Rhino Project manifest (found in the project root).
     * @returns Self reference.
     */
    public setProjectManifest(projectManifest: any): Command {
        // setup
        this.projectManifest = projectManifest;

        // get
        return this;
    }

    /*┌─[ GETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to get object properties.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Gets the command name to register.
     * 
     * @returns The command name to register.
     */
    public getCommandName(): string {
        return this.commandName;
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

    /**
     * Summary. Gets the Rhino Project manifest object.
     * 
     * @returns The Rhino Project manifest object to use with the command. 
     */
    public getProjectManifest(): any {
        return this.projectManifest;
    }

    /**
     * Summary. Gets the VS Code context to use with the command.
     * 
     * @returns The VS Code context. 
     */
    public getContext(): vscode.ExtensionContext {
        return this.context;
    }

    /*┌─[ INTERFACE ]──────────────────────────────────────────
      │
      │ A collection of functions to to implement under
      │ any command.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. When implemented, returns registerable command
     */
    public abstract register(): any;

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public abstract invokeCommand(callback: any): any;
}