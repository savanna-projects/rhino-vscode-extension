/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

export abstract class Formatter {
    // members:
    private context: vscode.ExtensionContext;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
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
    public abstract format(document: vscode.TextDocument): vscode.TextEdit[]
}
