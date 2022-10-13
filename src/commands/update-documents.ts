/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * CREDITS
 */
import * as vscode from 'vscode';
import { DocumentsProvider } from '../providers/documents-provider';
import { Command } from "./command";

export class UpdateDocumentsCommand extends Command {
    // members
    private provider: DocumentsProvider; 

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);
        // setup
        this.provider = new DocumentsProvider();

        // build
        this.setCommandName('Update-Documents');
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    public register(): any {
        // build
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke(undefined);
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand(callback: any) {
        this.invoke(callback);
    }

    private invoke(callback: any) {
        // invoke
        this.provider.register();
        
        // no callback
        if(callback === undefined) {
            return;
        }

        // get
        callback();
    }
}
