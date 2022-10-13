/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * CREDITS
 */
import * as vscode from 'vscode';
import { PipelinesProvider } from '../providers/pipelines-provider';
import { Command } from "./command";

export class UpdatePipelinesCommand extends Command {
    // members
    private provider: PipelinesProvider; 

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);
        // setup
        this.provider = new PipelinesProvider();

        // build
        this.setCommandName('Update-Pipelines');
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
